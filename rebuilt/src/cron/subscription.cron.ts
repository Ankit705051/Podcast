import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const expireSubscriptions = async (): Promise<number> => {
  const now = new Date();

  // Find subscriptions that are still active but past their end date
  const expiring = await prisma.subscription.findMany({
    where: {
      endDate: { lt: now },
      isActive: true,
      status: "ACTIVE",
    },
    select: { id: true, userId: true },
  });

  if (expiring.length === 0) {
    return 0;
  }

  const ids = expiring.map((s) => s.id);
  const userIds = [...new Set(expiring.map((s) => s.userId))];

  const result = await prisma.subscription.updateMany({
    where: { id: { in: ids } },
    data: {
      isActive: false,
      status: "EXPIRED",
      expiryMessage: "Subscription expired automatically.",
    },
  });

  // Keep denormalized user subscription status in sync
  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { subscription_status: "expired" },
  });

  return result.count;
};

const subscriptionCron = () => {
  // Run every hour to check for expired subscriptions
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Running subscription expiry check cron job...");
      const count = await expireSubscriptions();
      console.log(
        `Cron job completed. Updated ${count} expired subscriptions.`
      );
    } catch (error) {
      console.error("Error running subscription expiry cron job:", error);
    }
  });
};

export default subscriptionCron;
