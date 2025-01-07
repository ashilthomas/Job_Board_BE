import ApplicationModel from "../model/applicationModel.js";
import JobModel from "../model/jobModel.js";


// POST /jobs/:id/apply - Apply for a job
export const applyForJob = async (req, res) => {
    const { id } = req.params; // Job ID
    const userId  = req.user.id; // Extracted from JWT middleware
    const resumePath = req.file.path;

    try {
        // Check if the job exists
        const job = await JobModel.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Check if the user has already applied
        const existingApplication = await ApplicationModel.findOne({
            job: id,
            applicant: userId,
            resume:resumePath
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // Create a new application
        const application = new ApplicationModel({
            job: id,
            applicant: userId,
            resume:resumePath
           
        });

        await application.save();

        res.status(201).json({
            message: 'Application submitted successfully.',
            application,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for job.', error });
    }
};
