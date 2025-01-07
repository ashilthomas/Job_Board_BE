import express from "express"
import { applyForJob } from "../controller/applicationController.js"
const applicationRoute = express.Router()

applicationRoute.post("/apply/:id",applyForJob)

export default applicationRoute