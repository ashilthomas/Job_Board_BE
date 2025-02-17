import express from "express"
import { applyForJob, getApplicantsForJob, myAppliedJobs } from "../controller/applicationController.js"
import upload from "../middleware/fileUploads.js"
import authenticateUser from "../middleware/userAuth.js"
const applicationRoute = express.Router()

applicationRoute.post("/apply/:id",upload.single("resume"),authenticateUser,applyForJob)
applicationRoute.get("/myjobs",authenticateUser,myAppliedJobs)
applicationRoute.get("/getAppllicationForEmployer/:jobId",authenticateUser,getApplicantsForJob)

export default applicationRoute