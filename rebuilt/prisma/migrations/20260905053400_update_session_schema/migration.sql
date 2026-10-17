/*
  Warnings:

  - You are about to drop the column `agoraChannel` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `agoraToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `agoraUid` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `isCancelled` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `isLive` on the `Session` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'WAITING', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ONE_TO_ONE', 'GROUP', 'LIVE_EVENT');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('WEBRTC_P2P', 'MEDIASOUP', 'AGORA', 'OTHER');

-- DropIndex
DROP INDEX "Session_agoraChannel_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "agoraChannel",
DROP COLUMN "agoraToken",
DROP COLUMN "agoraUid",
DROP COLUMN "isCancelled",
DROP COLUMN "isLive",
ADD COLUMN     "mediaProvider" "MediaProvider" NOT NULL DEFAULT 'WEBRTC_P2P',
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'ONE_TO_ONE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT;
