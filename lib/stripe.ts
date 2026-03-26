import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
}

// Uses the latest API version supported by the installed Stripe SDK.
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});

