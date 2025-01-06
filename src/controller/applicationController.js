import ApplicationModel from "../model/applicationModel";
import JobModel from "../model/jobModel";


// POST /jobs/:id/apply - Apply for a job
export const applyForJob = async (req, res) => {
    const { id } = req.params; // Job ID
    const { userId } = req.user; // Extracted from JWT middleware

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
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // Create a new application
        const application = new ApplicationModel({
            job: id,
            applicant: userId,
           
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
