import express from 'express';
import { type Message, messages } from '@shared/schema';
import { eq } from 'drizzle-orm';
import isOnline from 'is-online';
import { syncMessagesToFirestore, getMessagesFromFirestore } from './firebase';
import { db } from './db';

const router = express.Router();

// Endpoint to trigger syncing manually
router.post('/to-cloud', async (req, res) => {
  try {
    // Check if we're online
    const online = await isOnline();
    if (!online) {
      return res.status(503).json({ error: 'Cannot sync, internet is offline' });
    }
    
    // Get unsynced messages from database
    const unsyncedMessages = await db.select().from(messages).where(eq(messages.synced, false));
    
    if (unsyncedMessages.length === 0) {
      return res.json({ message: 'No messages to sync' });
    }
    
    // Sync to Firestore
    await syncMessagesToFirestore(unsyncedMessages);
    
    // Update local messages to mark as synced
    for (const message of unsyncedMessages) {
      await db.update(messages)
        .set({ synced: true })
        .where(eq(messages.id, message.id));
    }
    
    res.json({ message: `Successfully synced ${unsyncedMessages.length} messages` });
  } catch (error) {
    console.error('Error syncing messages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Endpoint to get messages from cloud
router.get('/from-cloud', async (req, res) => {
  try {
    // Check if we're online
    const online = await isOnline();
    if (!online) {
      return res.status(503).json({ error: 'Cannot sync, internet is offline' });
    }
    
    // Get messages from Firestore
    const cloudMessages = await getMessagesFromFirestore();
    
    res.json(cloudMessages);
  } catch (error) {
    console.error('Error getting cloud messages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Background sync process
let syncInterval: NodeJS.Timeout | null = null;

// Start background sync
const startBackgroundSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(async () => {
    try {
      // Check if online
      const online = await isOnline();
      if (!online) {
        return;
      }
      
      // Get unsynced messages from database
      const unsyncedMessages = await db.select().from(messages).where(eq(messages.synced, false));
      
      if (unsyncedMessages.length === 0) {
        console.log('Found 0 pending messages for sync');
        return;
      }
      
      console.log(`Background sync: syncing ${unsyncedMessages.length} messages`);
      
      // Sync to Firestore
      await syncMessagesToFirestore(unsyncedMessages);
      
      // Update local messages to mark as synced
      for (const message of unsyncedMessages) {
        await db.update(messages)
          .set({ synced: true })
          .where(eq(messages.id, message.id));
      }
      
      console.log('Background sync completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Background sync error:', errorMessage);
    }
  }, 30000); // Run every 30 seconds
};

// Start the background sync immediately
startBackgroundSync();

export default router;
