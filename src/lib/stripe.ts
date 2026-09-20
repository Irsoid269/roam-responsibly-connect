import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const isStripeConfigured = Boolean(publishableKey);

let stripePromise: Promise<Stripe | null> | null = null;

/** Lazily loaded, memoized Stripe.js singleton — null if no publishable key is configured. */
export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
