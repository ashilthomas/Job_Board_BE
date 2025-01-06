import express from "express"
import  {createJob, getJobDetails, getJobs, updateJob } from "../controller/jobController.js"
import authenticateEmployer from "../middleware/employerAuth.js"

const jobRoute = express.Router()

jobRoute.post("/job",authenticateEmployer,createJob)
jobRoute.post("/job/:id",getJobDetails)
jobRoute.get("/job",getJobs)
jobRoute.put("/job/:id",updateJob)

// jobRoute.delete("/job/:id",deleteJob)

export default jobRoute