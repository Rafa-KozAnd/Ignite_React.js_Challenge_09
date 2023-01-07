import { NextApiHandler, PageConfig } from "next";
import { Readable } from "stream";
import { Stripe } from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function getBuffer(readable: Readable) {
  const chunks: any[] = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

type RelevantEvent =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

const relevantEvents = new Set<RelevantEvent>([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const handler: NextApiHandler = async (request, response) => {
  if (request.method !== "POST") {
    return response
      .setHeader("Allow", "POST")
      .status(405)
      .end("Method not allowed");
  }

  const buffer = await getBuffer(request);
  const secret = request.headers["stripe-signature"];

  let event: Stripe.Event | undefined;

  try {
    if (!secret) {
      throw new Error("no secret");
    }

    event = stripe.webhooks.constructEvent(
      buffer,
      secret,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).json(error);
  }

  if (relevantEvents.has(event.type as any)) {
    try {
      const type = event.type as RelevantEvent;

      switch (type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          await saveSubscription(
            subscription.id,
            subscription.customer.toString(),
            false,
          );

          break;
        }
        case "checkout.session.completed": {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          await saveSubscription(
            checkoutSession.subscription!.toString(),
            checkoutSession.customer!.toString(),
            true,
          );

          break;
        }
        default: {
          throw new Error("Unhandled event.");
        }
      }
    } catch (error) {
      return response.status(200).json({ error: "Webhook handler failed." });
    }
  }

  return response.status(200).json({ received: true });
};

export default handler;