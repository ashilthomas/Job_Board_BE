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
    const { id } = req.params; // Job ID
    const userId = req.user.id; // Extracted from JWT middleware
    let resumePath = req.file?.path; // Resume file path from multer
   

    if (!resumePath) {
        return res.status(400).json({ success: false, message: 'Resume file is required.' });
    }

    resumePath = resumePath.replace(/\\/g, "/"); 
    const resumeFilename = path.basename(resumePath);

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
                    resume: resumeFilename,
                },
            },
            { new: true }
        );

        // Step 5: Create a new job application
        const application = new ApplicationModel({
            job: id,
            applicant: userId,
            resume: resumeFilename,
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

export const getApplicantsForJob = async (req, res) => {
    const { employerId } = req.user; // Get employer ID from authenticated user
    const { jobId } = req.params; // Get job ID from request parameters

    try {
        // Find the job and ensure it belongs to the employer
        const job = await JobModel.findOne({ _id: jobId, employer: employerId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or does not belong to you"
            });
        }

        // Fetch applications for the specific job
        const applications = await ApplicationModel.find({ job: jobId })
            .populate('applicant', 'name email'); // Populate applicant details

        // Extract applicant details along with application status
        const applicants = applications.map(app => ({
            name: app.applicant.name,
            email: app.applicant.email,
            status: app.status, // Include application status
        }));

        return res.status(200).json({
            success: true,
            job: {
                id: job._id,
                title: job.title
            },
            applicants
        });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params; // Get application ID from URL
    const { status } = req.body; // New status from request body
    const { employerId } = req.user; // Get employer ID from authenticated user

    try {
        // Find the application and ensure the employer owns the job
        const application = await ApplicationModel.findById(applicationId).populate('job');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Check if the employer owns the job
        if (application.job.employer.toString() !== employerId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You don't own this job"
            });
        }

        // Update application status
        application.status = status;
        await application.save();

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application
        });

    } catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
