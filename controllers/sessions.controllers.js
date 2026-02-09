import { Session } from "../models/sessions.models.js";

const createSession = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            scheduled_start, 
            scheduled_end, 
            stream_platform, 
            stream_url, 
            thumbnail_url,
            category,
            tags,
            access_level,
            max_participants,
            requires_registration
        } = req.body;
        
        if (!title || !description || !scheduled_start || !scheduled_end || !stream_platform || !stream_url || !thumbnail_url) {
            return res.status(400).json({ message: "All required fields are required" });
        }
        
        // Validate dates
        const startTime = new Date(scheduled_start);
        const endTime = new Date(scheduled_end);
        
        if (startTime >= endTime) {
            return res.status(400).json({ message: "End time must be after start time" });
        }
        
        if (startTime <= new Date()) {
            return res.status(400).json({ message: "Start time must be in the future" });
        }
        
        const session = await Session.create({
            title,
            description,
            scheduled_start,
            scheduled_end,
            stream_platform,
            stream_url,
            thumbnail_url,
            host_id: req.user._id, 
            category: category || 'podcast',
            tags: tags || [],
            access_level: access_level || 'public',
            max_participants: max_participants || 100,
            requires_registration: requires_registration || false
        });
        
        return res.status(201).json({
            success: true,
            message: "Session created successfully",
            session
        });
            
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get all sessions
const getAllSessions = async (req, res) => {
    try {
        const { 
            category, 
            access_level, 
            page = 1, 
            limit = 10, 
            search,
            upcoming_only 
        } = req.query;
        
        const filter = { is_cancelled: false };
        
        if (category) filter.category = category;
        if (access_level) filter.access_level = access_level;
        if (upcoming_only === 'true') {
            filter.scheduled_start = { $gte: new Date() };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const sessions = await Session.find(filter)
            .populate('host_id', 'userName name avatar')
            .sort({ scheduled_start: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Session.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            sessions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSessions: total
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get session by ID
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const session = await Session.findById(id)
            .populate('host_id', 'userName name avatar')
            .populate('participants.user_id', 'userName name avatar');
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            session
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Update session
const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Find session and check if user is the host
        const session = await Session.findById(id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        if (session.host_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Only the host can update this session" 
            });
        }
        
        // Don't allow updating certain fields if session is live
        if (session.is_live) {
            delete updates.scheduled_start;
            delete updates.scheduled_end;
            delete updates.stream_platform;
        }
        
        const updatedSession = await Session.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        ).populate('host_id', 'userName name avatar');
        
        res.status(200).json({
            success: true,
            message: "Session updated successfully",
            session: updatedSession
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete session (soft delete - mark as cancelled)
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        
        const session = await Session.findById(id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        if (session.host_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Only the host can delete this session" 
            });
        }
        
        if (session.is_live) {
            return res.status(400).json({ 
                success: false,
                message: "Cannot delete a live session" 
            });
        }
        
        await Session.findByIdAndUpdate(id, { is_cancelled: true });
        
        res.status(200).json({
            success: true,
            message: "Session cancelled successfully"
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Join session
const joinSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { role = 'listener' } = req.body;
        
        const session = await Session.findById(id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        if (session.is_cancelled) {
            return res.status(400).json({ 
                success: false,
                message: "Cannot join a cancelled session" 
            });
        }
        
        // Check if user is already a participant
        const existingParticipant = session.participants.find(
            p => p.user_id.toString() === req.user._id.toString()
        );
        
        if (existingParticipant) {
            return res.status(400).json({ 
                success: false,
                message: "You are already a participant in this session" 
            });
        }
        
        // Check max participants limit
        if (session.participants.length >= session.max_participants) {
            return res.status(400).json({ 
                success: false,
                message: "Session is full" 
            });
        }
        
        // Add participant
        session.participants.push({
            user_id: req.user._id,
            role,
            joined_at: new Date()
        });
        
        await session.save();
        
        res.status(200).json({
            success: true,
            message: "Joined session successfully",
            session
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Start session (go live)
const startSession = async (req, res) => {
    try {
        const { id } = req.params;
        
        const session = await Session.findById(id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        if (session.host_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Only the host can start this session" 
            });
        }
        
        if (session.is_live) {
            return res.status(400).json({ 
                success: false,
                message: "Session is already live" 
            });
        }
        
        const updatedSession = await Session.findByIdAndUpdate(
            id, 
            { 
                is_live: true,
                actual_start_time: new Date()
            }, 
            { new: true }
        ).populate('host_id', 'userName name avatar');
        
        res.status(200).json({
            success: true,
            message: "Session started successfully",
            session: updatedSession
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// End session
const endSession = async (req, res) => {
    try {
        const { id } = req.params;
        
        const session = await Session.findById(id);
        
        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found" 
            });
        }
        
        if (session.host_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Only the host can end this session" 
            });
        }
        
        if (!session.is_live) {
            return res.status(400).json({ 
                success: false,
                message: "Session is not live" 
            });
        }
        
        const endTime = new Date();
        const duration = session.actual_start_time ? 
            Math.round((endTime - session.actual_start_time) / 60000) : 0; // in minutes
        
        const updatedSession = await Session.findByIdAndUpdate(
            id, 
            { 
                is_live: false,
                actual_end_time: endTime,
                duration
            }, 
            { new: true }
        ).populate('host_id', 'userName name avatar');
        
        res.status(200).json({
            success: true,
            message: "Session ended successfully",
            session: updatedSession
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

export {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    joinSession,
    startSession,
    endSession
};
