import { query as q } from "faunadb";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: "https://github.com/login/oauth/authorize?scope=read:user",
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        if (!session.user?.email) {
          throw new Error("no user");
        }

        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email),
                    ),
                  ),
                ),
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ]),
          ),
        );

        Object.assign(session, {
          activeSubscription: userActiveSubscription,
        });
      } catch {
        Object.assign(session, { activeSubscription: null });
      }

      return session;
    },
    async signIn({ user }) {
      try {
        const matchExpression = q.Match(
          q.Index("user_by_email"),
          q.Casefold(user.email!),
        );

        await fauna.query(
          q.If(
            q.Not(q.Exists(matchExpression)),
            q.Create(q.Collection("users"), {
              data: {
                email: user.email!,
              },
            }),
            q.Get(matchExpression),
          ),
        );

        return true;
      } catch {
        return false;
      }
    },
  },
});