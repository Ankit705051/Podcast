import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth Error:", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};
