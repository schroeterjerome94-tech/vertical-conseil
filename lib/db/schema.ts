import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  role: text("role").notNull().default("gerance"),
  status: text("status").notNull().default("pending"),
  organizationName: text("organization_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  accountKind: text("account_kind"),
  plan: text("plan").notNull().default("free"),
  planRequested: integer("plan_requested", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const elevatorInstallation = sqliteTable("installation", {
  id: text("id").primaryKey(),
  internalRef: text("internal_ref"),
  buildingAddress: text("building_address"),
  ownerName: text("owner_name"),
  propertyManagerName: text("property_manager_name"),
  propertyManagerAddress: text("property_manager_address"),
  propertyManagerEmail: text("property_manager_email"),
  propertyManagerPhone: text("property_manager_phone"),
  installationNumber: text("installation_number"),
  currentContractor: text("current_contractor"),
  manufacturer: text("manufacturer"),
  commissioningYear: text("commissioning_year"),
  elevatorType: text("elevator_type"),
  stopCount: text("stop_count"),
  ratedLoad: text("rated_load"),
  buildingAccess: text("building_access"),
  ratedSpeed: text("rated_speed"),
  tractionType: text("traction_type"),
  motorizationType: text("motorization_type"),
  controlType: text("control_type"),
  landingAccess: text("landing_access"),
  machineRoomLocation: text("machine_room_location"),
  shaftDimensions: text("shaft_dimensions"),
  shaftWidth: text("shaft_width"),
  shaftDepth: text("shaft_depth"),
  shaftConstruction: text("shaft_construction"),
  cabinDimensions: text("cabin_dimensions"),
  cabinWidth: text("cabin_width"),
  cabinDepth: text("cabin_depth"),
  doorWidth: text("door_width"),
  doorHeight: text("door_height"),
  doorType: text("door_type"),
  landingDoorWidth: text("landing_door_width"),
  landingDoorHeight: text("landing_door_height"),
  landingDoorType: text("landing_door_type"),
  travel: text("travel"),
  pitDepth: text("pit_depth"),
  headroom: text("headroom"),
  implantation: text("implantation"),
  safetyInfo: text("safety_info"),
  modernizations: text("modernizations"),
  extraFields: text("extra_fields"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const installationDocument = sqliteTable("installation_document", {
  id: text("id").primaryKey(),
  installationId: text("installation_id")
    .notNull()
    .references(() => elevatorInstallation.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  kind: text("kind").notNull().default("autre"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const installationAssignment = sqliteTable("installation_assignment", {
  id: text("id").primaryKey(),
  installationId: text("installation_id")
    .notNull()
    .references(() => elevatorInstallation.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const tenderCall = sqliteTable("tender", {
  id: text("id").primaryKey(),
  installationId: text("installation_id")
    .notNull()
    .references(() => elevatorInstallation.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  deadline: integer("deadline", { mode: "timestamp_ms" }).notNull(),
  status: text("status").notNull().default("open"),
  createdBy: text("created_by").notNull(),
  awardedOfferId: text("awarded_offer_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const contactMessage = sqliteTable("contact_message", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const clientRequest = sqliteTable("client_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  installationId: text("installation_id"),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  purchaseOrderName: text("purchase_order_name"),
  purchaseOrderStored: text("purchase_order_stored"),
  purchaseOrderMime: text("purchase_order_mime"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const tenderInvite = sqliteTable("tender_invite", {
  id: text("id").primaryKey(),
  tenderId: text("tender_id")
    .notNull()
    .references(() => tenderCall.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const tenderOffer = sqliteTable("tender_offer", {
  id: text("id").primaryKey(),
  tenderId: text("tender_id")
    .notNull()
    .references(() => tenderCall.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(),
  message: text("message"),
  proposal: text("proposal"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const asceProPurchase = sqliteTable("asce_pro_purchase", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tenderId: text("tender_id")
    .notNull()
    .references(() => tenderCall.id, { onDelete: "cascade" }),
  installationId: text("installation_id").notNull(),
  address: text("address"),
  installationCount: integer("installation_count").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  ht: text("ht").notNull(),
  vat: text("vat").notNull(),
  ttc: text("ttc").notNull(),
  dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const notice = sqliteTable("notice", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  href: text("href").notNull(),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});
