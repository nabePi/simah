import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sectorsEnum = pgEnum("sector", [
  "pendidikan",
  "pengusaha",
  "profesional",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "todo",
  "in_progress",
  "done",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "blocked"]);

export const notifTypeEnum = pgEnum("notif_type", [
  "text",
  "connect_request",
  "broadcast",
]);

export const notifVariantEnum = pgEnum("notif_variant", ["alert", "info"]);

export const connStatusEnum = pgEnum("conn_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  waNumber: text("wa_number").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mustChangePassword: boolean("must_change_password").default(true).notNull(),
  sector: sectorsEnum("sector"),
  role: text("role").default("Peserta"),
  organization: text("organization").default("-"),
  skills: text("skills").array().default([]),
  avatarUrl: text("avatar_url"),
  initials: text("initials"),
  offering: text("offering").default(""),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminAccounts = pgTable("admin_accounts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const manifestasiIwa = pgTable("manifestasi_iwa", {
  id: serial("id").primaryKey(),
  poin: text("poin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const manifestasiBreakdowns = pgTable("manifestasi_breakdowns", {
  id: serial("id").primaryKey(),
  manifestasiId: integer("manifestasi_id")
    .references(() => manifestasiIwa.id)
    .notNull(),
  label: text("label"),
  keterangan: text("keterangan").notNull(),
  dalil: text("dalil").notNull(),
  contoh: text("contoh").notNull(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: actionStatusEnum("status").default("todo").notNull(),
  createdById: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: date("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  votes: integer("votes").default(0).notNull(),
  background: text("background"),
  objectives: text("objectives"),
  needsFunding: boolean("needs_funding").default(false),
  isPic: boolean("is_pic").default(true),
  skills: text("skills").array().default([]),
  isPublished: boolean("is_published").default(false).notNull(),
  manifestasiId: integer("manifestasi_id").references(() => manifestasiIwa.id),
  breakdownId: integer("breakdown_id").references(
    () => manifestasiBreakdowns.id,
  ),
});

export const votes = pgTable(
  "votes",
  {
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    actionId: integer("action_id")
      .references(() => actions.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.actionId] }) }),
);

export const contributions = pgTable(
  "contributions",
  {
    id: serial("id").primaryKey(),
    actionId: integer("action_id")
      .references(() => actions.id)
      .notNull(),
    participantId: integer("participant_id")
      .references(() => users.id)
      .notNull(),
    types: text("types").array().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("uniq_user_action").on(t.actionId, t.participantId),
  }),
);

export const connections = pgTable(
  "connections",
  {
    id: serial("id").primaryKey(),
    requesterId: integer("requester_id")
      .references(() => users.id)
      .notNull(),
    requesteeId: integer("requestee_id")
      .references(() => users.id)
      .notNull(),
    status: connStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("uniq_pair").on(t.requesterId, t.requesteeId),
  }),
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: notifTypeEnum("type").notNull(),
  variant: notifVariantEnum("variant").default("info"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  actorId: integer("actor_id").references(() => users.id),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AdminAccount = typeof adminAccounts.$inferSelect;
export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
export type Contribution = typeof contributions.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type ManifestasiIwa = typeof manifestasiIwa.$inferSelect;
export type ManifestasiBreakdown = typeof manifestasiBreakdowns.$inferSelect;
