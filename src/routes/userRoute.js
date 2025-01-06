import express from "express"
import { loginUser, registerUser, updateEmployerProfile, uploadResume } from "../controller/userController.js"
import authenticateUser from "../middleware/userAuth.js"
import upload from "../middleware/fileUploads.js"

const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.post("/login",loginUser)
userRoute.put("/updateEmploye",authenticateUser,updateEmployerProfile)
userRoute.post('/users/upload-resume', authenticateUser, upload.single('resume'), uploadResume);


export default userRoute