
import UserModel from "../model/userModel.js";
import authenticateUser from "./userAuth.js";

const authenticateEmployer = async (req, res, next) => {

  console.log("authenticateEmployer");
  
  // First validate token
  authenticateUser(req, res, async (err) => {
    if (err) return; // authenticateUser already handled errors

    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      if (user.role !== "employer") {
        return res.status(403).json({ success: false, message: "Access denied. Employers only." });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
  });
};

export default authenticateEmployer;
