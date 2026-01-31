import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["user", "host", "admin"],
        default: "user"
    },
    storage_quota_mb: {
        type: Number,
        default: 100
    },
    storage_used_mb: {
        type: Number,
        default: 0,
        min: 0
    },
    subscription_type: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    subscription_status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active"
    },
    subscription_end_date: {
        type: Date,
        default: null
    },
    last_login: {
        type: Date,
        default: Date.now 
    },
    last_logout: {
        type: Date,
        default: null
    },
    last_active: {
        type: Date,
        default: Date.now
    },
    bio: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String,
        maxlength: 100
    },
    social_links: {
        twitter: String,
        linkedin: String,
        website: String
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:String,
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date,
    },
    
}, { timestamps: true });

//Remove 'next' parameter and don't call it
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has exceeded storage quota
userSchema.methods.isStorageQuotaExceeded = function() {
    return this.storage_used_mb > this.storage_quota_mb;
};

// Method to check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
    if (this.subscription_type === 'free') return true;
    return this.subscription_status === 'active' && 
           (!this.subscription_end_date || this.subscription_end_date > new Date());
};

// Generate reset password token
userSchema.methods.generateResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

export default mongoose.model("User", userSchema);