-- Fix PaymentStatus enum: map legacy values onto the new enum.
-- Old: PENDING, COMPLETED, FAILED, REFUNDED
-- New: PENDING, PROCESSING, SUCCEEDED, FAILED, PARTIALLY_REFUNDED, REFUNDED

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus_new') THEN
        DROP TYPE "PaymentStatus_new";
    END IF;
END $$;

CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING','PROCESSING','SUCCEEDED','FAILED','PARTIALLY_REFUNDED','REFUNDED');

ALTER TABLE "Payment" ALTER COLUMN "paymentStatus" DROP DEFAULT;

ALTER TABLE "Payment" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new"
USING (
    CASE "paymentStatus"::text
        WHEN 'COMPLETED' THEN 'SUCCEEDED'
        WHEN 'FAILED' THEN 'FAILED'
        WHEN 'REFUNDED' THEN 'REFUNDED'
        ELSE 'PENDING'
    END
)::"PaymentStatus_new";

ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";

ALTER TABLE "Payment" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
