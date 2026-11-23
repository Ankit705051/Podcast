import Stripe from "stripe";
import { AppError } from "../utils/AppError.js";

let client: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new AppError("Stripe is not configured", 500, "STRIPE_NOT_CONFIGURED");
    }
    client = new Stripe(key);
  }
  return client;
};

export const isStripeConfigured = (): boolean =>
  Boolean(process.env.STRIPE_SECRET_KEY);

export const constructStripeEvent = (rawBody: Buffer, signature: string) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Dev convenience: without a webhook secret we cannot verify signatures.
    // Only acceptable outside production.
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        "STRIPE_WEBHOOK_SECRET is required in production",
        500,
        "STRIPE_NOT_CONFIGURED"
      );
    }
    console.warn(
      "STRIPE_WEBHOOK_SECRET not set — accepting unverified Stripe webhook (dev only)"
    );
    return JSON.parse(rawBody.toString("utf8")) as Stripe.Event;
  }
  return getStripeClient().webhooks.constructEvent(rawBody, signature, secret);
};
