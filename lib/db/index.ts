import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const client = createClient({
  url: `file:${join(dataDir, "vertical-conseil.db")}`,
});

export const db = drizzle(client, { schema });

void client
  .execute("ALTER TABLE tender_offer ADD COLUMN proposal TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE user ADD COLUMN first_name TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE user ADD COLUMN last_name TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE user ADD COLUMN phone TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE user ADD COLUMN address TEXT")
  .catch(() => undefined);
void client
  .execute(
    `CREATE TABLE IF NOT EXISTS client_request (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      installation_id TEXT,
      kind TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at INTEGER NOT NULL
    )`,
  )
  .catch(() => undefined);
void client
  .execute("ALTER TABLE client_request ADD COLUMN purchase_order_name TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE client_request ADD COLUMN purchase_order_stored TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE client_request ADD COLUMN purchase_order_mime TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN current_contractor TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN door_height TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN landing_door_width TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN landing_door_height TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN property_manager_address TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN property_manager_email TEXT")
  .catch(() => undefined);
void client
  .execute("ALTER TABLE installation ADD COLUMN property_manager_phone TEXT")
  .catch(() => undefined);
void client
  .execute(
    `CREATE TABLE IF NOT EXISTS asce_pro_purchase (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tender_id TEXT NOT NULL,
      installation_id TEXT NOT NULL,
      address TEXT,
      installation_count INTEGER NOT NULL,
      invoice_number TEXT NOT NULL,
      ht TEXT NOT NULL,
      vat TEXT NOT NULL,
      ttc TEXT NOT NULL,
      due_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`,
  )
  .catch(() => undefined);
void client
  .execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS asce_pro_purchase_user_tender ON asce_pro_purchase (user_id, tender_id)",
  )
  .catch(() => undefined);
