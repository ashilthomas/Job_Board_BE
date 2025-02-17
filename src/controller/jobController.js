import mongoose from "mongoose";
import JobModel from "../model/jobModel.js";
import UserModel from "../model/userModel.js";
import uploadToCloudinary from "../config/cloudinaryServices.js";
import e from "cors";


// POST /jobs - Create a new job
export const createJob = async (req, res) => {
    const userId = req.user.id
    console.log(req.body);
    
    const {
        title,
        description,
        location,
        salary: salaryString,
        skillsRequired,
        experienceLevel,
        jobType,

    } = req.body;

    // Parse the stringified salary into an object
    const salary = JSON.parse(salaryString);
    const filePath = req.file.path
    const result = await uploadToCloudinary(filePath);

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
            postedBy: userId,
            image:result.url // Reference to the employer
        });

        // Save the job to the database
        const savedJob = await newJob.save();

        res.status(201).json({
            success:true,
            message: 'Job posted successfully',
            job: savedJob,
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success:false,
     message: 'Error creating job', error });
    }
};

export const getJobDetails= async (req, res) => {
    const id = req.params.id;
    console.log(id);
    

    // Validate if the id is a valid MongoDB ObjectId
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Invalid job ID"
    //     });
    // }

    try {
        // Fetch the job from the database
        const job = await JobModel.findById(id).populate('postedBy');

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
// get all jobs

export const getJobs =async(req,res)=>{
    const {page=1,limit=10}= req.query
    try {
        const jobs = await JobModel.find({})
        .skip((page - 1) * limit) // Skip jobs based on current page
        .limit(parseInt(limit)); 

        const totalJobs = await JobModel.countDocuments()

        res.status(200).json({
            success:true,
            jobs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalJobs / limit),
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
            return res.status(404).json({success:false, message: 'Job not found.' });
        }

       

        // Update the job with the provided data
        Object.assign(job, updatedData, { updatedAt: Date.now() });

        // Save the updated job to the database
        const updatedJob = await job.save();

        res.status(200).json({
            success:true,
            message: 'Job updated successfully.',
            job: updatedJob,
        });
    } catch (error) {
        res.status(500).json({ success:false, message: 'Error updating job.', error });
    }
};

// search functionalilty

export const searchJobs = async (req, res) => {
    console.log("hitting");
    
    const {  page = 1, limit = 10 } = req.query;
    
    const { keyword } = req.query;
    console.log(keyword);
    

    try {
        // Validate that a keyword is provided
      

        // Build a search query
        const query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } }, // Matches title
               
            ],
        };

        // Execute the query
        const jobs = await JobModel.find(query)
        .skip((page - 1) * limit) // Skip jobs based on current page
        .limit(parseInt(limit)); 
        const totalJobs = await JobModel.countDocuments(query);

        // Return search results
        res.status(200).json({
            success:true,
            message: 'Search results retrieved successfully.',
            jobs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalJobs / limit),
        });
    } catch (error) {
        res.status(500).json({ success:false, message: 'Error searching for jobs.', error });
    }
};

// jobReconmendetion
const vectorize = (skillsArray, referenceSkills) => {
    return referenceSkills.map(skill => skillsArray.includes(skill) ? 1 : 0);
};

// Helper function: Compute cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0; // Avoid division by zero
    return dotProduct / (magnitudeA * magnitudeB);
};

// Controller: Recommend Jobs for a User
export const recommendJobs = async (req, res) => {
    try {
        const  userId  = req.user.id;

        // Fetch the user data
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all jobs
        const jobs = await JobModel.find();
        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found' });
        }

        // Reference set of all possible skills from the job dataset
        const allSkills = [...new Set(jobs.flatMap(job => job.skillsRequired))];

        // Vectorize user skills
        const userVector = vectorize(user.skills, allSkills);

        // Calculate similarity scores for each job
        const recommendations = jobs.map(job => {
            const jobVector = vectorize(job.skillsRequired, allSkills);
            const similarity = cosineSimilarity(userVector, jobVector);

            // Weight location and salary preference (optional)
            const locationScore = user.preferences?.location === job.location ? 0.2 : 0;
            const salaryScore = job.salary.min >= (user.preferences?.minSalary || 0) ? 0.2 : 0;

            return {
                job,
                similarity: similarity + locationScore + salaryScore,
            };
        });

        // Sort recommendations by similarity score
        recommendations.sort((a, b) => b.similarity - a.similarity);

        // Return top 10 recommendations
        res.json(recommendations.slice(0, 10).map(rec => ({
            job: rec.job,
            matchScore: Math.round(rec.similarity * 100), // Percentage match
        })));
    } catch (error) {
        console.error('Error in recommendJobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const employerJob = async (req, res) => {
    const { id } = req.user;
    
    try {
        const empJobs = await JobModel.find({ postedBy: id });

        // Always return an array, even if it's empty
        return res.json({
            success: true,
            empJobs: empJobs.length > 0 ? empJobs : []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
