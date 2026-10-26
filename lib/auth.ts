import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { isAdminEmail } from "./constants";
import { db } from "./db";
import * as schema from "./db/schema";
import { saveDevMail } from "./dev-mailbox";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "gerance",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "pending",
        input: false,
      },
      organizationName: {
        type: "string",
        required: false,
        input: true,
      },
      firstName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
      accountKind: {
        type: "string",
        required: false,
        input: true,
      },
      plan: {
        type: "string",
        required: true,
        defaultValue: "free",
        input: false,
      },
      planRequested: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      saveDevMail({
        to: user.email,
        subject: "Réinitialisation du mot de passe",
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      saveDevMail({
        to: user.email,
        subject: "Vérifiez votre adresse e-mail",
        url,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const admin = isAdminEmail(user.email);
          const requested = String(
            user.accountKind ?? ctx?.body?.accountKind ?? "gerance",
          );
          const kind = requested === "ascensoriste" ? "ascensoriste" : "gerance";
          const firstName = String(user.firstName ?? ctx?.body?.firstName ?? "").trim();
          const lastName = String(user.lastName ?? ctx?.body?.lastName ?? "").trim();
          const phone = String(user.phone ?? ctx?.body?.phone ?? "").trim();
          const address = String(user.address ?? ctx?.body?.address ?? "").trim();
          if (!admin) {
            if (!phone) {
              throw new APIError("BAD_REQUEST", {
                message: "Le numéro de téléphone est obligatoire.",
              });
            }
            if (!address) {
              throw new APIError("BAD_REQUEST", {
                message: "L’adresse est obligatoire.",
              });
            }
          }
          const fullName =
            [firstName, lastName].filter(Boolean).join(" ") || user.name;
          return {
            data: {
              ...user,
              email: user.email.trim().toLowerCase(),
              name: fullName,
              firstName: firstName || "",
              lastName: lastName || "",
              phone: phone || "",
              address: address || "",
              role: admin ? "admin" : kind,
              status: admin ? "approved" : "pending",
              accountKind: admin ? "admin" : kind,
              plan: admin ? "pro" : "free",
              planRequested: false,
            },
          };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = String(ctx.body?.email ?? "")
        .trim()
        .toLowerCase();
      if (!email) return;
      const existing = await ctx.context.internalAdapter.findUserByEmail(email);
      const user = existing?.user as
        | { emailVerified?: boolean; status?: string }
        | undefined;
      if (!user) return;
      if (!user.emailVerified && user.status !== "approved") {
        throw new APIError("FORBIDDEN", {
          message: "Veuillez d’abord confirmer votre adresse e-mail.",
        });
      }
      if (user.status === "pending") {
        throw new APIError("FORBIDDEN", {
          message:
            "Votre compte est en attente de validation par Vertical Conseil.",
        });
      }
      if (user.status === "refused") {
        throw new APIError("FORBIDDEN", {
          message: "Cette inscription n’a pas été acceptée.",
        });
      }
      if (user.status === "suspended") {
        throw new APIError("FORBIDDEN", {
          message: "Ce compte a été suspendu.",
        });
      }
    }),
  },
  session: {
    updateAge: 60 * 60 * 24,
    disableSessionRefresh: true,
  },
  plugins: [nextCookies()],
});
