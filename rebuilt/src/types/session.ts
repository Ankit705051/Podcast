import { AccessLevel, SessionCategory, ParticipantRole,SessionType,SessionStatus,MediaProvider } from "@prisma/client";

//data required for create a sesssion 
export interface CreateSessionData {
    title: string;
    description: string;
    accessLevel: AccessLevel;
    sessionCategory: SessionCategory;
    participantRole: ParticipantRole;
    type: SessionType;
    category: SessionCategory;
    scheduledStart: Date;
    scheduledEnd: Date;
    hostId: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    maxParticipants?: number;
    chatEnabled?: boolean;
    recordingEnabled?: boolean;
    allowScreenShare?: boolean;
    allowQuestions?: boolean;
    autoRecord?: boolean;
    mediaProvider?: MediaProvider;
    requiresRegistration?: boolean;
    status?: SessionStatus;
}


// data required for update a session 
export interface UpdateSessionData {
    title?: string;
    description?: string;
    accessLevel?: AccessLevel;
    sessionCategory?: SessionCategory;
    participantRole?: ParticipantRole;
    type?: SessionType;
    category?: SessionCategory;
    scheduledStart?: Date;
    scheduledEnd?: Date;
    hostId?: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    maxParticipants?: number;
    chatEnabled?: boolean;
    recordingEnabled?: boolean;
    allowScreenShare?: boolean;
    allowQuestions?: boolean;
    autoRecord?: boolean;
    mediaProvider?: MediaProvider;
    requiresRegistration?: boolean;
    status?: SessionStatus;
}

// data required for joining a session
export interface JoinSessionData {
    sessionId: string;
    userId: string;
    role: ParticipantRole;
}

// data required for leaving a session
export interface LeaveSessionData {
    sessionId: string;
    userId: string;
}

// data required for starting a session
export interface StartSessionData {
    sessionId: string;
    userId: string;
}

// data required for ending a session
export interface EndSessionData {
    sessionId: string;
    userId: string;
}

// data required for cancelling a session
export interface CancelSessionData {
    sessionId: string;
    userId: string;
}

// participant information returned by session service
export interface ParticipantInfo {
    id: string;
    userId: string;
    role: ParticipantRole;
    joinedAt: Date;
    isActive: boolean;
    leftAt?: Date;
}

// public session information
export interface PublicSessionInfo {
    id: string;
    title: string;
    description: string;
    accessLevel: AccessLevel;
    sessionCategory: SessionCategory;
    participantRole: ParticipantRole;
    type: SessionCategory;
    category: SessionCategory;
    scheduledStart: Date;
    scheduledEnd: Date;
    hostId: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    maxParticipants?: number;
    chatEnabled?: boolean;
    recordingEnabled?: boolean;
    allowScreenShare?: boolean;
    allowQuestions?: boolean;
    autoRecord?: boolean;
    mediaProvider?: string;
    requiresRegistration?: boolean;
}

export interface joinSessionResponse {
    sessionId: string;
    userId: string;
    participantId: string;
    role: ParticipantRole;
    joinedAt: Date;
    isActive: boolean;
    participantCount: number;
    maxParticipants?: number;
}