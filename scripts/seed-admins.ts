import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { ADMIN_EMAILS } from "../lib/constants";
import { db } from "../lib/db";
import { user } from "../lib/db/schema";

const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!password) {
  throw new Error("ADMIN_BOOTSTRAP_PASSWORD manquant dans .env.local");
}
const adminPassword: string = password;

const names: Record<(typeof ADMIN_EMAILS)[number], string> = {
  "michel.gosteli@vertical-conseil.ch": "Michel Gosteli",
  "jerome.schroeter@vertical-conseil.ch": "Jérôme Schroeter",
};

async function seed() {
  for (const email of ADMIN_EMAILS) {
    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing[0]) {
      await db
        .update(user)
        .set({
          role: "admin",
          status: "approved",
          emailVerified: true,
          plan: "pro",
          planRequested: false,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email));
      console.info(`Admin déjà présent : ${email}`);
      continue;
    }

    await auth.api.signUpEmail({
      body: {
        name: names[email],
        email,
        password: adminPassword,
        organizationName: "Vertical Conseil Sàrl",
        accountKind: "gerance",
      },
    });

    await db
      .update(user)
      .set({
        role: "admin",
        status: "approved",
        emailVerified: true,
        plan: "pro",
        planRequested: false,
        updatedAt: new Date(),
      })
      .where(eq(user.email, email));

    console.info(`Admin créé : ${email}`);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
