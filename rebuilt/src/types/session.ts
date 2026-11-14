import { AccessLevel, SessionCategory, ParticipantRole,SessionType,SessionStatus,MediaProvider } from "@prisma/client";

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

export interface JoinSessionData {
    sessionId: string;
    userId: string;
    role: ParticipantRole;
}

export interface LeaveSessionData {
    sessionId: string;
    userId: string;
}
export interface StartSessionData {
    sessionId: string;
    userId: string;
}
export interface EndSessionData {
    sessionId: string;
    userId: string;
}

export interface CancelSessionData {
    sessionId: string;
    userId: string;
}
export interface ParticipantInfo {
    id: string;
    userId: string;
    role: ParticipantRole;
    joinedAt: Date;
    isActive: boolean;
    leftAt?: Date;
}
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

export interface CreateSessionInput {
    title: string;
    description: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    streamPlatform: import("@prisma/client").StreamPlatform;
    streamUrl: string;
    thumbnailUrl: string;
    category: SessionCategory;
    tags: string[];
    accessLevel: AccessLevel;
    maxParticipants: number;
    requiresRegistration: boolean;
}

export interface UpdateSessionInput {
    title?: string;
    description?: string;
    scheduledStart?: Date;
    scheduledEnd?: Date;
    streamPlatform?: import("@prisma/client").StreamPlatform;
    streamUrl?: string;
    thumbnailUrl?: string;
    category?: SessionCategory;
    tags?: string[];
    accessLevel?: AccessLevel;
    maxParticipants?: number;
    requiresRegistration?: boolean;
    chatEnabled?: boolean;
    recordingEnabled?: boolean;
    allowQuestions?: boolean;
    allowScreenShare?: boolean;
    autoRecord?: boolean;
    recordingUrl?: string;
    leaveSessionMessage?: string;
}

export interface SessionQueryInput {
    category?: SessionCategory;
    accessLevel?: AccessLevel;
    page: number;
    limit: number;
    search?: string;
    upcomingOnly: boolean;
}