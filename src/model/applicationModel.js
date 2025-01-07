import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending',
    },
    resume: { type: String, default: null }, 
    
    appliedAt: { type: Date, default: Date.now },
});

const ApplicationModel = mongoose.model('Application', applicationSchema);

export default ApplicationModel;
