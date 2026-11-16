-- Manual completion of 20261115200022_add_payment_attempt.
-- The original migration failed after the enum conversion succeeded but
-- before the column drops / PaymentAttempt table creation.

ALTER TABLE "Payment" DROP COLUMN IF EXISTS "paymentGateway",
DROP COLUMN IF EXISTS "stripeInvoiceId",
DROP COLUMN IF EXISTS "stripeSessionId";

CREATE TABLE IF NOT EXISTS "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'INITIATED',
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "checkoutSessionId" TEXT,
    "invoiceId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAttempt_idempotencyKey_key" ON "PaymentAttempt"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "PaymentAttempt_paymentId_idx" ON "PaymentAttempt"("paymentId");
CREATE INDEX IF NOT EXISTS "PaymentAttempt_gateway_providerPaymentId_idx" ON "PaymentAttempt"("gateway", "providerPaymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAttempt_paymentId_attemptNumber_key" ON "PaymentAttempt"("paymentId", "attemptNumber");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PaymentAttempt_paymentId_fkey'
    ) THEN
        ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey"
            FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
