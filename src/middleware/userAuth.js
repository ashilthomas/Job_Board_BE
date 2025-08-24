import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.SKT || "your_jwt_secret";

// Middleware to check if user has a valid token
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log(token);
  

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token." });
    }
    req.user = decoded; // decoded contains { id, role }
    next();
  });
};

export default authenticateUser;
