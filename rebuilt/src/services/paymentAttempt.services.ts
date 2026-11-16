import { PaymentAttemptStatus, type PaymentAttempt, type PaymentGateway } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface CreatePaymentAttemptInput {
  paymentId: string;
  gateway: PaymentGateway;
  idempotencyKey: string;
}
export const createPaymentAttempt = async (
  input: CreatePaymentAttemptInput
): Promise<PaymentAttempt> => {
  const { paymentId, gateway, idempotencyKey } = input;

  return prisma.$transaction(async (tx) => {
    const payments = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Payment" WHERE "id" = ${paymentId} FOR UPDATE
    `;
    if (payments.length === 0) {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }
    const existingAttempt = await tx.paymentAttempt.findUnique({
      where: { idempotencyKey },
    });
    if (existingAttempt) {
      if (
        existingAttempt.paymentId !== paymentId ||
        existingAttempt.gateway !== gateway
      ) {
        throw new AppError(
          "Idempotency key already used for a different payment",
          409,
          "IDEMPOTENCY_CONFLICT"
        );
      }
      return existingAttempt;
    }

    const lastAttempt = await tx.paymentAttempt.findFirst({
      where: { paymentId },
      select: { attemptNumber: true },
      orderBy: { attemptNumber: "desc" },
    });
    const nextAttemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;

    return tx.paymentAttempt.create({
      data: {
        paymentId,
        gateway,
        idempotencyKey,
        attemptNumber: nextAttemptNumber,
        status: PaymentAttemptStatus.INITIATED,
      },
    });
  });
};
