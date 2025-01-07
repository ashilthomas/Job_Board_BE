import ApplicationModel from "../model/applicationModel.js";
import JobModel from "../model/jobModel.js";
import { PdfReader } from "pdfreader";
import UserModel from "../model/userModel.js";

// POST /jobs/:id/apply - Apply for a job
// export const applyForJob = async (req, res) => {
//     const { id } = req.params; // Job ID
//     const userId  = req.user.id; // Extracted from JWT middleware
//     const resumePath = req.file.path;

//     try {
//         // Check if the job exists
//         const job = await JobModel.findById(id);
//         if (!job) {
//             return res.status(404).json({
//                 success:false,
                
//                 message: 'Job not found.' });
//         }

//         // Check if the user has already applied
//         const existingApplication = await ApplicationModel.findOne({
//             job: id,
//             applicant: userId,
//             resume:resumePath
//         });

//         if (existingApplication) {
//             return res.status(400).json({
//                 success:false,
//                  message: 'You have already applied for this job.' });
//         }

//         // Create a new application
//         const application = new ApplicationModel({
//             job: id,
//             applicant: userId,
//             resume:resumePath
           
//         });

//         await application.save();

//         res.status(201).json({
//             success:true,
//             message: 'Application submitted successfully.',
//             application,
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success:false,
            
//             message: 'Error applying for job.', error });
//     }
// };

export const applyForJob = async (req, res) => {
    const { id } = req.params; // Job ID
    const userId = req.user.id; // Extracted from JWT middleware
    const resumePath = req.file?.path; // Resume file path from multer

    if (!resumePath) {
        return res.status(400).json({ success: false, message: 'Resume file is required.' });
    }

    try {
        // Step 1: Check if the job exists
        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        // Step 2: Check if the user has already applied
        const existingApplication = await ApplicationModel.findOne({ job: id, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
        }

        // Step 3: Parse resume for skills and experience
        const { extractedSkills, extractedExperience } = await parseResume(resumePath);

        // Step 4: Update the user's profile with parsed skills and experience
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    skills: extractedSkills,
                    experience: extractedExperience,
                    resume: resumePath,
                },
            },
            { new: true }
        );

        // Step 5: Create a new job application
        const application = new ApplicationModel({
            job: id,
            applicant: userId,
            resume: resumePath,
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            application,
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error during job application:', error);
        res.status(500).json({ success: false, message: 'Failed to apply for the job.', error });
    }
};

const parseResume = async (resumePath) => {
    let extractedSkills = new Set();
    let extractedExperience = '';
    let currentSection = null;
    let buffer = []; // Buffer for fixing fragmented words

    const finalizeParsedData = () => {
        const mergedWords = mergeFragmentedWords(buffer);
        mergedWords.forEach(word => extractedSkills.add(word));
    };

    const mergeFragmentedWords = (words) => {
        const merged = [];
        for (let i = 0; i < words.length; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1] || '';

            // Merge if the current and next words are fragments (lowercase and uppercase checks)
            if (currentWord.match(/^[A-Z]?$/) && nextWord.match(/^[a-z]/)) {
                merged.push(currentWord + nextWord);
                i++; // Skip the next word
            } else {
                merged.push(currentWord);
            }
        }
        return merged;
    };

    return new Promise((resolve, reject) => {
        const reader = new PdfReader();

        reader.parseFileItems(resumePath, (err, item) => {
            if (err) {
                console.error('Error reading PDF:', err);
                return reject('Failed to read the PDF');
            }

            if (!item) {
                // End of PDF - Process the buffer
                finalizeParsedData();
                return resolve({
                    extractedSkills: Array.from(extractedSkills),
                    extractedExperience: extractedExperience.trim(),
                });
            }

            if (item.text) {
                if (item.text.match(/skills/i)) {
                    currentSection = 'skills';
                } else if (item.text.match(/experience/i)) {
                    currentSection = 'experience';
                }

                if (currentSection === 'skills' && !item.text.match(/skills/i)) {
                    const words = item.text.split(/\s+/);
                    words.forEach(word => buffer.push(word));
                } else if (currentSection === 'experience' && !item.text.match(/experience/i)) {
                    extractedExperience += item.text + ' ';
                }
            }
        });
    });
};