-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "storage_quota_mb" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "stripePriceId" TEXT;

-- AlterTable
ALTER TABLE "RecordingSession" ADD COLUMN     "isDownloadable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "payment_service_subscription_id" TEXT,
ADD COLUMN     "payment_service_transaction_id" TEXT,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "settings" JSONB,
ADD COLUMN     "storage_used_mb" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "userName" TEXT,
ALTER COLUMN "last_logout" DROP NOT NULL,
ALTER COLUMN "last_logout" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "subscriptionId" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "paymentGateway" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "stripeSessionId" TEXT,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "currentTool" TEXT NOT NULL DEFAULT 'pen',
    "currentColor" TEXT NOT NULL DEFAULT '#000000',
    "currentSize" INTEGER NOT NULL DEFAULT 2,
    "collaborators" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeEditor" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "output" TEXT NOT NULL DEFAULT '',
    "isExecuting" BOOLEAN NOT NULL DEFAULT false,
    "collaborators" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeEditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebinarState" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "activePollId" TEXT,
    "moderators" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebinarState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "webinarId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "webinarId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "answer" TEXT,
    "answeredById" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");
CREATE INDEX "Payment_paymentStatus_idx" ON "Payment"("paymentStatus");
CREATE UNIQUE INDEX "Whiteboard_sessionId_key" ON "Whiteboard"("sessionId");
CREATE UNIQUE INDEX "CodeEditor_sessionId_key" ON "CodeEditor"("sessionId");
CREATE UNIQUE INDEX "WebinarState_sessionId_key" ON "WebinarState"("sessionId");
CREATE INDEX "Poll_sessionId_idx" ON "Poll"("sessionId");
CREATE INDEX "Poll_webinarId_idx" ON "Poll"("webinarId");
CREATE INDEX "PollOption_pollId_idx" ON "PollOption"("pollId");
CREATE INDEX "PollVote_optionId_idx" ON "PollVote"("optionId");
CREATE INDEX "PollVote_userId_idx" ON "PollVote"("userId");
CREATE UNIQUE INDEX "PollVote_pollId_userId_key" ON "PollVote"("pollId", "userId");
CREATE INDEX "Question_sessionId_answered_upvotes_idx" ON "Question"("sessionId", "answered", "upvotes");
CREATE INDEX "Question_webinarId_idx" ON "Question"("webinarId");
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");
CREATE UNIQUE INDEX "Subscription_stripe_subscription_id_key" ON "Subscription"("stripe_subscription_id");
CREATE UNIQUE INDEX "Subscription_payment_service_subscription_id_key" ON "Subscription"("payment_service_subscription_id");
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE UNIQUE INDEX "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeEditor" ADD CONSTRAINT "CodeEditor_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebinarState" ADD CONSTRAINT "WebinarState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "WebinarState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "WebinarState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
