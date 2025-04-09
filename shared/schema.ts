import { pgTable, text, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  provider: varchar("provider", { length: 32 }).default("local"),
  providerUserId: text("provider_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Devices table
export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  ip: text("ip").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
});

// Messages table
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  recipient: text("recipient").default("all"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  synced: boolean("synced").default(false).notNull(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
});

// Establish relations for the users table
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  messages: many(messages),
}));

// Establish relations for the devices table
export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

// Establish relations for the messages table
export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  provider: true,
  providerUserId: true,
});

export const insertDeviceSchema = createInsertSchema(devices);

export const insertMessageSchema = createInsertSchema(messages);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
