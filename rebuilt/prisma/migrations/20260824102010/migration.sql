/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'host', 'admin');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "StreamPlatform" AS ENUM ('YOUTUBE', 'TWITCH', 'DISCORD', 'OTHER', 'ZOOM', 'TEAMS', 'AGORA');

-- CreateEnum
CREATE TYPE "SessionCategory" AS ENUM ('PODCAST', 'INTERVIEW', 'PANEL', 'WORKSHOP', 'QNA', 'OTHER', 'EVENT', 'EDUCATION');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('SPEAKER', 'LISTENER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('CLOUDINARY', 'AWS_S3', 'OTHER');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('PENDING', 'RECORDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('FILE', 'IMAGE', 'TEXT', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_logout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user',
ADD COLUMN     "social_links" JSONB,
ADD COLUMN     "storage_quota_mb" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "subscription_end_date" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "subscription_type" "SubscriptionType" NOT NULL DEFAULT 'free',
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "streamPlatform" "StreamPlatform" NOT NULL DEFAULT 'YOUTUBE',
    "streamUrl" TEXT,
    "thumbnailUrl" TEXT,
    "recordingUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "hostId" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 100,
    "category" "SessionCategory" NOT NULL DEFAULT 'PODCAST',
    "tags" TEXT[],
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'PUBLIC',
    "requiresRegistration" BOOLEAN NOT NULL DEFAULT false,
    "registrationCount" INTEGER NOT NULL DEFAULT 0,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "chatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "monetizationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowQuestions" BOOLEAN NOT NULL DEFAULT true,
    "allowScreenShare" BOOLEAN NOT NULL DEFAULT false,
    "autoRecord" BOOLEAN NOT NULL DEFAULT false,
    "leaveSessionMessage" TEXT,
    "agoraChannel" TEXT,
    "agoraUid" INTEGER,
    "agoraToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "role" "ParticipantRole" NOT NULL DEFAULT 'LISTENER',

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 3,
    "features" TEXT[],
    "benefits" TEXT[],
    "maxPodcasts" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "expiryMessage" TEXT,
    "paymentId" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordingSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'PENDING',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileType" TEXT,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'CLOUDINARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecordingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ChatType" NOT NULL DEFAULT 'TEXT',
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_agoraChannel_key" ON "Session"("agoraChannel");

-- CreateIndex
CREATE INDEX "Session_hostId_idx" ON "Session"("hostId");

-- CreateIndex
CREATE INDEX "Session_category_idx" ON "Session"("category");

-- CreateIndex
CREATE INDEX "Session_scheduledStart_idx" ON "Session"("scheduledStart");

-- CreateIndex
CREATE INDEX "SessionParticipant_userId_idx" ON "SessionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_userId_key" ON "SessionParticipant"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "RecordingSession_sessionId_idx" ON "RecordingSession"("sessionId");

-- CreateIndex
CREATE INDEX "RecordingSession_userId_idx" ON "RecordingSession"("userId");

-- CreateIndex
CREATE INDEX "Chat_sessionId_createdAt_idx" ON "Chat"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingSession" ADD CONSTRAINT "RecordingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingSession" ADD CONSTRAINT "RecordingSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
