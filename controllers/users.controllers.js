import User from "../models/users.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";

// register controller
export const registerController = async (req, res) => {
    try {
        const { userName, name, email, password, role } = req.body;
        
        if (!userName || !name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }
        const validRoles = ["user", "host", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Must be user, host, or admin"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.verified) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            userName,
            name,
            email,
            password,
            role,
            verificationToken 
        });

        await newUser.save();
        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                }
            });
            const verifyUrl = `${process.env.BASE_URI}/api/v1/users/verify/${newUser.verificationToken}`; 
            await transporter.sendMail({
                from: process.env.MAIL_USERNAME,
                to: newUser.email,
                subject: "Verify your email address",
                text: `Please click on the link to verify your email address: ${verifyUrl}`,
            });
        } catch(error) {
            console.log("Email sending failed:", error);
        }
        
        return res.status(201).json({ 
            message: "User registered successfully", 
            user: {
                id: newUser._id,
                userName: newUser.userName,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar,
            }, 
            token 
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in Register Controller" });
    }
}

// verify controller
export const verifyUser=async (req,res)=>{
    try{
        const {verificationToken}=req.params;
        if(!verificationToken){
            return res.status(400).json({
                message:"Invalid token",
            })
        }

        const user = await User.findOne({verificationToken:verificationToken});
        if(!user){
            return res.status(404).json({
                message:"Invalid token",
            })
        }
        user.verified=true;
        user.verificationToken=undefined;
        await user.save();
        res.status(200).json({
            message:"User is verified successfully"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Verify Controller" });
    }
}

//login
export const login=async (req,res)=>{
    try{
        const{email,password, userName}=req.body || {};
        if(!password || (!email && !userName)){
            return res.status(400).json({
                message:"Please provide password and either email or username"
            })
        }
        const user = await User.findOne({ $or: [{ email }, { userName }] });
        if(!user){
            return res.status(404).json({
                message:"User not found",
            })
        }
        const isPasswordValid=await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(401).json({
                message:"Invalid password",
            })
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            maxAge:30*24*60*60*1000,
        })
        res.status(200).json({
            success:true,
            token,
            user:{
                id:user._id,
                userName:user.userName,
                name:user.name,
                email:user.email,
                role:user.role,
                avatar:user.avatar,
            },
            message:"User logged in successfully"
        })
        
        // Get user's subscription after login
        try {
            const { Subscription } = await import("../models/subscriptions.models.js");
            const { Plan } = await import("../models/plan.models.js");
            
            const subscription = await Subscription.findOne({ 
                user: user._id,
                is_active: true,
                status: "active"
            }).populate('plan');
            
            if (subscription) {
                res.status(200).json({
                    success:true,
                    token,
                    user:{
                        id:user._id,
                        userName:user.userName,
                        name:user.name,
                        email:user.email,
                        role:user.role,
                        avatar:user.avatar,
                        currentSubscription: {
                            planName: subscription.plan.name,
                            planPrice: subscription.plan.price,
                            planFeatures: subscription.plan.features,
                            status: subscription.status,
                            endDate: subscription.endDate,
                            daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
                        }
                    },
                    message:"User logged in successfully"
                });
            }
        } catch (subError) {
            console.log("Error fetching subscription:", subError);
            // Still return login success even if subscription fetch fails
        }
        
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Login" });
    }
}


//logout
export const logout=async (req,res)=>{
    try{
        res.clearCookie("token");
        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Logout" });
    }
}

//get user
export const getUser=async (req,res)=>{
    try{
        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.headers.authorization);
        
        // Get token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        
        console.log("Token found:", token ? "Yes" : "No");
        
        if(!token){
            return res.status(401).json({message:"Unauthorized - No token provided"});
        }
        
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log("Token decoded successfully, user ID:", decoded.id);
        
        const user=await User.findById(decoded.id).select("-password");
        
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        
        // Get user's current subscription
        const { Subscription } = await import("../models/subscriptions.models.js");
        const { Plan } = await import("../models/plan.models.js");
        
        const subscription = await Subscription.findOne({ 
            user: user._id,
            is_active: true,
            status: "active"
        }).populate('plan');
        
        res.status(200).json({
            success:true,
            user: {
                ...user.toObject(),
                currentSubscription: subscription ? {
                    planName: subscription.plan.name,
                    planPrice: subscription.plan.price,
                    planFeatures: subscription.plan.features,
                    status: subscription.status,
                    endDate: subscription.endDate,
                    daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
                } : null
            }
        });
    }
    catch(error){
        console.log("JWT Error:", error.name, error.message);
        res.status(500).json({ message: "Error in Get User" });
    }
}

//forget password
export const forgetPassword=async (req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({message:"Email is required"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const resetToken=user.generateResetToken();
        await user.save();
        const resetUrl=`${process.env.BASE_URI}/reset-password/${resetToken}`;
        console.log("Reset URL:", resetUrl);
        res.status(200).json({
            success:true,
            message:"Reset link sent successfully",
            resetUrl
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Forget Password" });
    }
}

//reset password
export const resetPassword=async (req,res)=>{
    try{
        const {token}=req.params;
        const {password,confPassword}=req.body;
        if(!password || !confPassword){
            return res.status(400).json({message:"Password and confirm password are required"});
        }
        if(password!==confPassword){
            return res.status(400).json({message:"Password and confirm password must be same"});
        }
        const user=await User.findOne({resetPasswordToken:token,resetPasswordExpire:{$gt:Date.now()}});
        if(!user){
            return res.status(400).json({message:"Invalid or expired reset token"});
        }
        user.password=password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        res.status(200).json({
            success:true,
            message:"Password reset successfully"
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Reset Password" });
    }
}   


// update user
export const updateUser=async (req,res)=>{
    try{
        const {name,email,bio,location} = req.body;
        const user=await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(name) user.name = name;
        if(email) user.email = email;
        if(bio) user.bio = bio;
        if(location) user.location = location;
        
        // Handle avatar upload
        if(req.file){
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }
        
        await user.save();
        res.status(200).json({
            success:true,
            message:"User updated successfully",
            user: {
                id: user._id,
                userName: user.userName,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                location: user.location
            }
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Error in Update User" });
    }
}