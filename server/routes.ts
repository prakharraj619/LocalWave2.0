import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { handleWebSocketConnection } from "./websocket";
import deviceRoutes from "./devices";
import syncRoutes from "./sync";
import { networkInterfaces } from "os";
import cors from "cors";
import { type Message, messages } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { syncMessagesToFirestore } from "./firebase";

// Get local IP address
function getLocalIPAddress(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS
  app.use(cors());
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', handleWebSocketConnection);
  
  // Use device routes
  app.use('/api/devices', deviceRoutes);
  
  // Use sync routes
  app.use('/api/sync', syncRoutes);
  
  // Network status endpoints
  app.get('/api/network/lan', (req, res) => {
    try {
      const localIP = getLocalIPAddress();
      res.json({ status: 'connected', ip: localIP });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ status: 'disconnected', error: errorMessage });
    }
  });
  
  // Get pending sync count
  app.get('/api/network/pending-sync', async (req, res) => {
    try {
      // Get messages that are not synced
      const pendingMessages = await db.select().from(messages).where(eq(messages.synced, false));
      console.log(`Found ${pendingMessages.length} pending messages for sync`);
      
      res.json({ count: pendingMessages.length });
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  });
  
  // Store messages API
  app.post('/api/messages', async (req, res) => {
    try {
      const message = req.body;
      
      if (!message.id || !message.content || !message.sender) {
        return res.status(400).json({ error: 'Invalid message format' });
      }
      
      // Convert to database message format
      const newMessage = {
        id: message.id,
        content: message.content,
        sender: message.sender,
        recipient: message.recipient || 'all',
        timestamp: new Date(message.timestamp || Date.now()),
        synced: false, // Initially not synced to Firebase
        userId: message.userId || 1, // Default to user ID 1 if not provided
      };
      
      // Add message to database
      const savedMessage = await storage.createMessage(newMessage);
      
      // Try to sync immediately if possible
      try {
        // Sync message to Firebase
        await syncMessagesToFirestore([savedMessage]);
        
        // Mark as synced in local database
        await db.update(messages)
          .set({ synced: true })
          .where(eq(messages.id, savedMessage.id));
        
        console.log(`Message synced to Firebase: ${savedMessage.id}`);
        savedMessage.synced = true;
      } catch (syncError) {
        console.log(`Message will be synced later: ${savedMessage.id}`);
        // Will be synced later during sync operation
      }
      
      console.log(`Message stored successfully: ${JSON.stringify(savedMessage)}`);
      res.status(201).json({ message: 'Message stored successfully', data: savedMessage });
    } catch (error) {
      console.error('Error storing message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  });
  
  // Get all messages
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  });

  return httpServer;
}
