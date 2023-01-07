import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
}