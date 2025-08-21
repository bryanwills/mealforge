import { betterAuth } from "better-auth";
import { google, facebook, github } from "better-auth/social-providers";
import { prismaAdapter } from "better-auth/adapters/prisma-adapter";
import { db } from "./db";

export const auth = betterAuth({
  adapter: prismaAdapter({
    provider: "postgresql",
    client: db,
  }),
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});

export type Auth = typeof auth;
