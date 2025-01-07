import express from "express"
import { applyForJob } from "../controller/applicationController.js"
import upload from "../middleware/fileUploads.js"
import authenticateUser from "../middleware/userAuth.js"
const applicationRoute = express.Router()

applicationRoute.post("/apply/:id",upload.single("resume"),authenticateUser,applyForJob)

export default applicationRoute