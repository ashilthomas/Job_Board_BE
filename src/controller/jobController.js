import JobModel from "../model/jobModel.js";
import UserModel from "../model/userModel.js";


// POST /jobs - Create a new job
export const createJob = async (req, res) => {
    const userId = req.user.id
    const { title, description,  location, salary,skillsRequired, experienceLevel, jobType } = req.body;

  

    try {
        // Create a new job document
        const newJob = new JobModel({
            title,
            description,
            location,
            salary,
            skillsRequired,
            experienceLevel,
            jobType,
            postedBy: userId, // Reference to the employer
        });

        // Save the job to the database
        const savedJob = await newJob.save();

        res.status(201).json({
            success:true,
            message: 'Job posted successfully',
            job: savedJob,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
     message: 'Error creating job', error });
    }
};

export const getJobDetails= async (req, res) => {
    const id = req.params.id;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID"
        });
    }

    try {
        // Fetch the job from the database
        const job = await JobModel.findById(id);

        // If the job is not found, return a 404 error
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "No job found"
            });
        }

        // Return the job if found
        res.status(200).json({
            success: true,
            job
        });

    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching job:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
//get all jobs

export const getJobs =async(req,res)=>{
    try {
        const jobs = await JobModel.find({})

        res.status(200).json({
            success:true,
            jobs
        })
        
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success:false,
            message:"internal server error"

        })
        
        
    }
}
export const updateJob = async (req, res) => {
    const { id } = req.params; // Job ID from the URL
    const  userId = req.user.id; // Extracted from JWT middleware
    const updatedData = req.body; // Updated job data from the request body

    try {
        // Find the job by ID
        const job = await JobModel.findById(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

       

        // Update the job with the provided data
        Object.assign(job, updatedData, { updatedAt: Date.now() });

        // Save the updated job to the database
        const updatedJob = await job.save();

        res.status(200).json({
            message: 'Job updated successfully.',
            job: updatedJob,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job.', error });
    }
};