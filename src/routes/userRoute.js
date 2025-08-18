import express from "express"
import { checkAdmin, checkEmployer, checkUser, loginUser, registerUser, updateEmployerProfile, uploadResume } from "../controller/userController.js"
import authenticateUser from "../middleware/userAuth.js"
import upload from "../middleware/fileUploads.js"
import authenticateEmployer from "../middleware/employerAuth.js"
import authenticateAdmin from "../middleware/adminAuth.js"

const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.post("/login",loginUser)
userRoute.put("/updateEmploye",authenticateUser,updateEmployerProfile)
userRoute.post('/users/upload-resume', authenticateUser, upload.single('resume'), uploadResume);

userRoute.get("/checkUser", authenticateUser, checkUser);
userRoute.get("/checkEmployer", authenticateEmployer, checkEmployer);
userRoute.get("/checkAdmin", authenticateAdmin, checkAdmin);


export default userRoute