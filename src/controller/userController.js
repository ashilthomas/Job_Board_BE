import UserModel from "../model/userModel.js";
import bcrypt from "bcrypt"
import getToken from "../utils/generateToken.js";
import fs from "fs";
import { PdfReader } from "pdfreader";
import { PDFDocument } from 'pdf-lib';





export const registerUser = async (req, res) => {
    console.log("hitting");
    
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success:false,
            
            message: 'All fields are required' });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success:false,
                 message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword });
        const user = await newUser.save();

        req.user = user;
        return getToken(req, res);
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            success:false,
            
            message: 'Error registering user', error });
    }
};
export const loginUser = async (req, res,next) => {
    console.log("hitting login");
  
    const { password, email } = req.body;
  
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
  
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
            success:false,
             success: false, message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
  
      req.user = user
      
  
      getToken(req,res,next)
  
    
  
      
    } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
export const updateEmployerProfile = async (req, res) => {
    const userId = req.user.id; // From JWT middleware
    console.log(userId);
    
    const { companyName, companyDetails } = req.body;
    console.log(req.body);
    

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { companyName, companyDetails,role:"employer" },
            { new: true }
        );

        res.status(200).json({
            
            success:true,
            message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({success:false,
             message: 'Error updating profile', error });
    }
};


export const uploadResume = async (req, res) => {
    const { id } = req.user;
        const resumePath = req.file.path;
    
        try {
            let extractedSkills = new Set();
            let extractedExperience = '';
            let currentSection = null;
            let buffer = []; // Buffer for fixing fragmented words
    
            const reader = new PdfReader();
            reader.parseFileItems(resumePath, (err, item) => {
                if (err) {
                    console.error("Error reading PDF:", err);
                    return res.status(500).json({ error: 'Failed to read the PDF' });
                }
    
                if (!item) {
                    // End of PDF - Process the buffer
                    finalizeParsedData();
    
                    // Convert Set to Array
                    const skillsArray = Array.from(extractedSkills);
    
                    // Save parsed data
                    UserModel.findByIdAndUpdate(
                        id,
                        {
                            $set: {
                                skills: skillsArray,
                                experience: extractedExperience.trim(),
                                resume: resumePath,
                            },
                        },
                        { new: true }
                    )
                        .then(updatedUser => {
                            res.status(200).json({
                                message: 'Resume uploaded and parsed successfully!',
                                user: updatedUser,
                            });
                        })
                        .catch(error => {
                            console.error("Error updating user:", error);
                            res.status(500).json({ error: 'Failed to update user data' });
                        });
    
                    return;
                }
    
                if (item.text) {
                    if (item.text.match(/skills/i)) {
                        currentSection = 'skills';
                    } else if (item.text.match(/experience/i)) {
                        currentSection = 'experience';
                    }
    
                    if (currentSection === 'skills' && !item.text.match(/skills/i)) {
                        const words = item.text.split(/\s+/);
                        words.forEach(word => buffer.push(word));
                    } else if (currentSection === 'experience' && !item.text.match(/experience/i)) {
                        extractedExperience += item.text + ' ';
                    }
                }
            });
    
            const finalizeParsedData = () => {
                // Process the buffer to merge fragmented words
                const mergedWords = mergeFragmentedWords(buffer);
                mergedWords.forEach(word => extractedSkills.add(word));
            };
    
            const mergeFragmentedWords = (words) => {
                const merged = [];
                for (let i = 0; i < words.length; i++) {
                    const currentWord = words[i];
                    const nextWord = words[i + 1] || '';
                    
                    // Merge if the current and next words are fragments (lowercase and uppercase checks)
                    if (currentWord.match(/^[A-Z]?$/) && nextWord.match(/^[a-z]/)) {
                        merged.push(currentWord + nextWord);
                        i++; // Skip the next word
                    } else {
                        merged.push(currentWord);
                    }
                }
                return merged;
            };
        } catch (error) {
            console.error("Error during resume upload:", error);
            res.status(500).json({ error: 'Failed to process the resume' });
        }
};

