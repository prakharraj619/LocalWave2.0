import { eq } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  devices, 
  messages, 
  type User, 
  type InsertUser,
  type Device,
  type InsertDevice,
  type Message,
  type InsertMessage 
} from "@shared/schema";

// Updated interface with additional CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device operations
  getDevice(id: string): Promise<Device | undefined>;
  getDevicesByUserId(userId: number): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(id: string, status: string): Promise<Device | undefined>;
  getAllDevices(): Promise<Device[]>;
  
  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesBySender(sender: string): Promise<Message[]>;
  getMessagesByRecipient(recipient: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageSyncStatus(id: string, synced: boolean): Promise<Message | undefined>;
  getPendingSyncMessages(): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Device operations
  async getDevice(id: string): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getDevicesByUserId(userId: number): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.userId, userId));
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const result = await db.insert(devices).values(device).returning();
    return result[0];
  }

  async updateDeviceStatus(id: string, status: string): Promise<Device | undefined> {
    const result = await db
      .update(devices)
      .set({ status })
      .where(eq(devices.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getMessagesBySender(sender: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.sender, sender));
  }

  async getMessagesByRecipient(recipient: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.recipient, recipient));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async updateMessageSyncStatus(id: string, synced: boolean): Promise<Message | undefined> {
    const result = await db
      .update(messages)
      .set({ synced })
      .where(eq(messages.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async getPendingSyncMessages(): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.synced, false));
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }
}

export const storage = new DatabaseStorage();
