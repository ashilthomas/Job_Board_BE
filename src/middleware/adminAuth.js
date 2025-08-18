
import UserModel from "../model/userModel.js";
import authenticateUser from "./userAuth.js";

const authenticateAdmin = async (req, res, next) => {
  authenticateUser(req, res, async (err) => {
    if (err) return;

    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
  });
};

export default authenticateAdmin;
