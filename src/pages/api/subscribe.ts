import { query as q } from "faunadb";
import { NextApiHandler } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

interface FaunaUser {
  ref: {
    id: string;
  };
  data: {
    email: string;
    stripe_customer_id?: string;
  };
}

const handler: NextApiHandler = async (request, response) => {
  if (request.method !== "POST") {
    return response
      .setHeader("Allow", "POST")
      .status(405)
      .end("Method not allowed");
  }

  const session = await getSession({ req: request });
  const sessionUser = session!.user!;

  const faunaUser = await fauna.query<FaunaUser>(
    q.Get(q.Match(q.Index("user_by_email"), q.Casefold(sessionUser.email!))),
  );

  let stripeCustomerId = faunaUser.data.stripe_customer_id;

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: sessionUser.email!,
      name: sessionUser.name!,
    });

    stripeCustomerId = stripeCustomer.id;

    await fauna.query(
      q.Update(q.Ref(q.Collection("users"), faunaUser.ref.id), {
        data: {
          stripe_customer_id: stripeCustomerId,
        },
      }),
    );
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    billing_address_collection: "required",
    line_items: [
      {
        price: process.env.STRIPE_PRODUCT_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return response.status(200).json({
    sessionId: stripeCheckoutSession.id,
  });
};

export default handler;