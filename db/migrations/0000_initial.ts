import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  provider: varchar("provider", { length: 32 }).default("local"),
  providerUserId: text("provider_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  ip: text("ip").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  recipient: text("recipient").default("all"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  synced: boolean("synced").default(false).notNull(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
});