import express from "express";
import { registerController,verifyUser,login,logout,getUser,forgetPassword,resetPassword,updateUser } from "../controllers/users.controllers.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router=express.Router();

router.post("/register",registerController);
router.get("/verify/:verificationToken", verifyUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user", getUser);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/update-user", authenticateUser, uploadAvatar, updateUser);

export default router;