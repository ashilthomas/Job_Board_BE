import express from "express"
import  {createJob,  employerJob,  getJobDetails,  getJobs, recommendJobs, searchJobs, updateJob } from "../controller/jobController.js"
import authenticateUser from "../middleware/userAuth.js"
import upload from "../middleware/fileUploads.js"
import authenticateEmployer from "../middleware/employerAuth.js"

const jobRoute = express.Router()

jobRoute.post("/job",upload.single("image"),authenticateUser,createJob)
jobRoute.post("/job/:id",getJobDetails)
jobRoute.get("/job",getJobs)
jobRoute.put("/job/:id",updateJob)
jobRoute.get("/job/search",searchJobs)
jobRoute.get("/recommend",authenticateUser,recommendJobs)
jobRoute.get("/employerJob",authenticateUser,employerJob)

// jobRoute.delete("/job/:id",deleteJob)

export default jobRoute