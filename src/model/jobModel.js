import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    }, // Job title (e.g., "Software Engineer")
    description: { 
        type: String, 
        required: true 
    }, // Detailed job description
     // Reference to the employer's user account
    location: { 
        type: String, 
        required: true 
    }, // Job location (e.g., "San Francisco, CA")
    salary: { 
        min: { type: Number, required: true }, 
        max: { type: Number, required: true } 
    }, // Salary range (e.g., { min: 50000, max: 100000 })
    skillsRequired: { 
        type: [String], 
        required: true 
    }, // Required skills for the job (e.g., ['JavaScript', 'React'])
    experienceLevel: { 
        type: String, 
        enum: ['Entry', 'Mid', 'Senior'], 
        required: true 
    }, // Experience level (e.g., "Mid")
    jobType: { 
        type: String, 
        enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], 
        required: true 
    }, // Job type
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // The employer who posted the job
    status: { 
        type: String, 
        enum: ['Open', 'Closed'], 
        default: 'Open' 
    }, // Job status
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, // When the job was posted
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }, // When the job was last updated
});

const JobModel = mongoose.model('Job', jobSchema);

export default JobModel;
