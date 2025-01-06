import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['job_seeker', 'employer', 'admin'], 
        default: "job_seeker" // Updated default value
    },
    // Job Seeker Fields
    skills: { type: [String], default: [] }, // Only for job seekers
    resume: { type: String, default: null }, // Only for job seekers
    experience: { type: String, default: null }, // Only for job seekers
    preferences: { 
        location: { type: String, default: null }, 
        minSalary: { type: Number, default: null } 
    }, // Only for job seekers
    // Employer Fields
    companyName: { type: String, default: null }, // Only for employers
    companyDetails : { type: String, default: null }, // Only for employers
    // Admin-Specific Fields
    // permissions: { 
    //     type: [String], 
    //     default: ['approve_jobs', 'manage_users', 'view_analytics'] 
    // }, // For admins, optional
    createdAt: { type: Date, default: Date.now },
});

// Method to check role
userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
