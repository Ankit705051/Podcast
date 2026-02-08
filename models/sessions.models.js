import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scheduled_start: {
        type: Date,
        required: true
    },
    scheduled_end: {
        type: Date,
        required: true
    },
    is_live: {
        type: Boolean,
        default: false
    },
    is_recorded: {
        type: Boolean,
        default: false
    },
    is_cancelled: {
        type: Boolean,
        default: false
    },
    stream_platform: {
        type: String,
        enum: ['youtube', 'twitch', 'discord', 'other', 'zoom', 'teams'],
        default: 'youtube'
    },
    stream_url: {
        type: String,
        required: true
    },
    thumbnail_url: {
        type: String,
        required: true
    },
    recording_url: {
        type: String,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joined_at: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['speaker', 'listener', 'moderator'],
            default: 'listener'
        }
    }],
    max_participants: {
        type: Number,
        default: 100
    },
    category: {
        type: String,
        enum: ['podcast', 'interview', 'panel', 'workshop', 'qna', 'other'],
        default: 'podcast'
    },
    tags: [{
        type: String,
        trim: true
    }],
    access_level: {
        type: String,
        enum: ['public', 'private', 'invite_only'],
        default: 'public'
    },
    requires_registration: {
        type: Boolean,
        default: false
    },
    registration_count: {
        type: Number,
        default: 0
    },
    actual_start_time: {
        type: Date,
        default: null
    },
    actual_end_time: {
        type: Date,
        default: null
    },
    viewer_count: {
        type: Number,
        default: 0
    },
    chat_enabled: {
        type: Boolean,
        default: true
    },
    recording_enabled: {
        type: Boolean,
        default: true
    },
    monetization_enabled: {
        type: Boolean,
        default: false
    },
    session_settings: {
        allow_questions: {
            type: Boolean,
            default: true
        },
        allow_screen_share: {
            type: Boolean,
            default: false
        },
        auto_record: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

export const Session = mongoose.model('Session', sessionSchema);
