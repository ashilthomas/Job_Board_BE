import express from "express"
import  {createJob,  getJobDetails,  getJobs, recommendJobs, searchJobs, updateJob } from "../controller/jobController.js"
import authenticateEmployer from "../middleware/employerAuth.js"
import authenticateUser from "../middleware/userAuth.js"

const jobRoute = express.Router()

jobRoute.post("/job",authenticateEmployer,createJob)
jobRoute.post("/job/:id",getJobDetails)
jobRoute.get("/job",getJobs)
jobRoute.put("/job/:id",updateJob)
jobRoute.get("/job/search",searchJobs)
jobRoute.get("/recommend",authenticateUser,recommendJobs)

// jobRoute.delete("/job/:id",deleteJob)

export default jobRoute