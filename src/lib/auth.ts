import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { logActivity } from "@/lib/activityLog";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      accessType: "offline",
      prompt: "consent",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await logActivity({ actorId: user.id, action: "user.register" });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await logActivity({ actorId: session.userId, action: "user.login" });
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "google") {
            await logActivity({ actorId: account.userId, action: "youtube.connect" });
          }
        },
      },
      delete: {
        after: async (account) => {
          if (account.providerId === "google") {
            await logActivity({ actorId: account.userId, action: "youtube.disconnect" });
          }
        },
      },
    },
  },
  plugins: [username()],
});
