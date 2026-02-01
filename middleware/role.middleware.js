import User from "../models/users.models.js";

export const checkRole = (...roles) => {
    return async (req, res, next) => {
        try {
            // Use req.user from auth middleware instead of fetching again
            const user = req.user;
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            if (!roles.includes(user.role)) {
                return res.status(403).json({ 
                    message: "Forbidden - Insufficient permissions",
                    required: roles,
                    current: user.role
                });
            }
            
            next();
        } catch (error) {
            console.log("Role Check Error:", error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};
