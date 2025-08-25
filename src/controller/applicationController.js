import ApplicationModel from "../model/applicationModel.js";
import JobModel from "../model/jobModel.js";
import { PdfReader } from "pdfreader";
import UserModel from "../model/userModel.js";
import path from 'path'

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
    console.log("hitting");
    
    const { id } = req.params; // Job ID
    const userId = req.user.id; // Extracted from JWT middleware
   
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Resume is required" });
    }

    // Save file path in database
    const resumeUrl = `/uploads/${file.filename}`;

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
        // const { extractedSkills, extractedExperience } = await parseResume(resumeUrl); // use resumeUrl

        // Step 4: Update user's profile
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    // skills: extractedSkills,
                    // experience: extractedExperience,
                    resume: file.filename, // ✅ store the uploaded file name
                },
            },
            { new: true }
        );

        // Step 5: Create a new application
        const application = new ApplicationModel({
            job: id,
            applicant: userId,
            resume: file.filename, // ✅ use file.filename
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

const parseResume = (resumePath) => {
    return new Promise((resolve, reject) => {
        let extractedSkills = new Set();
        let extractedExperience = '';
        let currentSection = null;
        let buffer = [];

        const finalizeParsedData = () => {
            const mergedWords = mergeFragmentedWords(buffer);
            mergedWords.forEach(word => {
                const cleanWord = word.replace(/[^a-zA-Z0-9+.#]/g, '');
                if (cleanWord.length > 1) extractedSkills.add(cleanWord);
            });
            return {
                extractedSkills: Array.from(extractedSkills),
                extractedExperience: extractedExperience.trim(),
            };
        };

        const mergeFragmentedWords = (words) => {
            const merged = [];
            for (let i = 0; i < words.length; i++) {
                const currentWord = words[i];
                const nextWord = words[i + 1] || '';

                if (currentWord.match(/^[A-Z]?$/) && nextWord.match(/^[a-z]/)) {
                    merged.push(currentWord + nextWord);
                    i++;
                } else {
                    merged.push(currentWord);
                }
            }
            return merged;
        };

        try {
            const reader = new PdfReader();
            reader.parseFileItems(resumePath, (err, item) => {
                if (err) {
                    console.error("PDF parsing error:", err);
                    return reject("Failed to read the PDF");
                }

                if (!item) {
                    // End of file
                    return resolve(finalizeParsedData());
                }

                if (item.text) {
                    const lowerText = item.text.toLowerCase();

                    if (/skills|technical skills|core competencies|technologies|tools/.test(lowerText)) {
                        currentSection = 'skills';
                    } else if (/experience|work experience|professional experience/.test(lowerText)) {
                        currentSection = 'experience';
                    }

                    if (currentSection === 'skills' && !/skills|technical skills/.test(lowerText)) {
                        const words = item.text
                            .split(/[\s,;•]+/)
                            .map(w => w.trim())
                            .filter(Boolean);

                        words.forEach(word => buffer.push(word));
                    } else if (currentSection === 'experience' && !/experience/.test(lowerText)) {
                        extractedExperience += item.text + ' ';
                    }
                }
            });
        } catch (error) {
            console.error("Unexpected error in parseResume:", error);
            return reject("Unexpected error while parsing resume");
        }
    });
};

export const myAppliedJobs =async(req,res)=>{
    const {id} = req.user
    try {
        const myJobs = await ApplicationModel.find({ applicant:id}).populate("job").populate({
            path: 'job',
            populate: {
                path: 'postedBy', // This will populate the employer details inside the job
                model: 'User' 
            }
        })
        if(!myJobs || myJobs.length==0){
            return res.json({
                success:false,
                message:"No job applied"
            })
        }
        res.json({
            success:true,
            myJobs
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ success: false, message: 'Failed to apply for the job.', error });
    }
}

 // Import Application model

export const getApplicantsForJob = async (req, res) => {
    console.log("Endpoint hit");

    const { id } = req.user; // Employer ID from authenticated user


    const { jobId } = req.params; // Job ID from request parameters


    try {
        // Find the job and ensure it belongs to the employer
        const job = await JobModel.findOne({ _id: jobId, postedBy: id });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or does not belong to you",
            });
        }

        // Fetch applications for the specific job
        const applications = await ApplicationModel.find({ job: jobId })
            .populate("applicant", "name email"); // Populate applicant details

        // Extract applicant details along with application status
        const applicants = applications.map((app) => ({
            id:app._id,
            name: app.applicant?.name || "Unknown",
            email: app.applicant?.email || "Unknown",
            status: app.status, // Include application status
            resume: app.resume, // Include resume field if needed
        }));

        return res.status(200).json({
            success: true,
            job: {
                id: job._id,
                title: job.title,
            },
            applicants,
        });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        console.log("sdjflsjalda",applicationId);
        

        if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const updatedApplication = await ApplicationModel.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        return res.status(200).json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


 // let resumePath = req.file?.path;

    // if (!resumePath) {
    //     return res.status(400).json({ success: false, message: 'Resume file is required.' });
    // }

    // resumePath = resumePath.replace(/\\/g, "/");
    // const resumeFilename = path.basename(resumePath);
