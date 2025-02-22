
import jwt from "jsonwebtoken"
import UserModel from "../model/userModel.js";
import "dotenv/config";
const JWT_SECRET = process.env.SKT || 'your_jwt_secret';

// Middleware to authenticate employer
const authenticateEmployer = async (req, res, next) => {
    // const token = req.headers.authorization?.split(' ')[1];
    const token = req.cookies.token;
    console.log(token);
    

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        

        // Fetch the user from the database
        const user = await UserModel.findById(decoded.id);
        console.log(user);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is an employer
        if (user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Only employers can access this route.' });
        }

        // Attach user details to the request object
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token.', error });
    }
};

export default authenticateEmployer ;
