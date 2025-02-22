import express from "express"
import { checkEmployer, checkuser, loginUser, registerUser, updateEmployerProfile, uploadResume } from "../controller/userController.js"
import authenticateUser from "../middleware/userAuth.js"
import upload from "../middleware/fileUploads.js"
import authenticateEmployer from "../middleware/employerAuth.js"

const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.post("/login",loginUser)
userRoute.put("/updateEmploye",authenticateUser,updateEmployerProfile)
userRoute.post('/users/upload-resume', authenticateUser, upload.single('resume'), uploadResume);
userRoute.get('/checkUser',authenticateUser,checkuser);
userRoute.get('/checkEmployer',authenticateEmployer,checkEmployer);


export default userRoute