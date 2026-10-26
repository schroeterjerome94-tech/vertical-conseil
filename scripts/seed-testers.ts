import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { user } from "../lib/db/schema";

const testers = [
  {
    email: "gerance.test@vertical-conseil.ch",
    name: "Compte test gérance",
    password: "GeranceTest2026!",
    organizationName: "Gérance Test",
    accountKind: "gerance" as const,
    role: "gerance" as const,
  },
  {
    email: "ascensoriste.test@vertical-conseil.ch",
    name: "Compte test ascensoriste",
    password: "AsceTest2026!",
    organizationName: "Ascensoriste Test",
    accountKind: "ascensoriste" as const,
    role: "ascensoriste" as const,
  },
];

async function seed() {
  for (const tester of testers) {
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, tester.email));
    if (!existing[0]) {
      await auth.api.signUpEmail({
        body: {
          name: tester.name,
          email: tester.email,
          password: tester.password,
          organizationName: tester.organizationName,
          accountKind: tester.accountKind,
          phone: "+41 21 000 00 00",
          address: "Rue du Test 1, 1000 Lausanne",
        },
      });
    }
    await db
      .update(user)
      .set({
        role: tester.role,
        status: "approved",
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(user.email, tester.email));
    console.info(`Testeur prêt : ${tester.email}`);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
