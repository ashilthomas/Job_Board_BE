import express from "express"
import { applyForJob, getApplicantsForJob, myAppliedJobs, updateApplicationStatus } from "../controller/applicationController.js"
import upload from "../middleware/fileUploads.js"
import authenticateUser from "../middleware/userAuth.js"
import authenticateEmployer from "../middleware/employerAuth.js"
const applicationRoute = express.Router()

applicationRoute.post("/apply/:id",upload.single("resume"),authenticateUser,applyForJob)
applicationRoute.get("/myjobs",authenticateUser,myAppliedJobs)
applicationRoute.get("/getApplicationForEmployer/:jobId",authenticateEmployer,getApplicantsForJob);
applicationRoute.put("/updateStatus/:applicationId", authenticateEmployer,updateApplicationStatus);


export default applicationRoute