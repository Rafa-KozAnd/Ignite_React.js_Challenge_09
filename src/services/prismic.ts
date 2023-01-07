import Prismic from "@prismicio/client";
import { IncomingMessage } from "http";

export function getPrismicClient(request?: IncomingMessage) {
  return Prismic.client(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: request,
  });
}