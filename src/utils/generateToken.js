import jwt from "jsonwebtoken"
import "dotenv/config"
console.log(process.env.SKT);

const getToken = (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({
                success: false,
                message: "User information is missing",
            });
        }

        if (!process.env.SKT) {
            return res.status(500).json({
                success: false,
                message: "Secret key is missing",
            });
        }

        const token = jwt.sign({ id: req.user._id }, process.env.SKT, { expiresIn: "30m" });

        res.status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1800000,
            })
            .json({
                success: true,
                user: req.user,
                token,
                message: "Logged in successfully",
            });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({
            success: false,
            message: "Token generation failed",
        });
    }
};

export default getToken;
