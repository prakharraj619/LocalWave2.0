import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import isOnline from 'is-online';
import { firebaseDB } from './firebase';

type Message = {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
};

type Data = {
  messages: Message[];
};

const dbFile = join(process.cwd(), 'offline-messages.json');
const adapter = new JSONFile<Data>(dbFile);
const db = new Low<Data>(adapter);

const syncInterval = 10 * 1000; // every 10 seconds

async function syncOfflineMessages() {
  await db.read();
  db.data ||= { messages: [] };

  const offlineMessages = db.data.messages;

  if (offlineMessages.length === 0) return;

  const online = await isOnline();
  if (!online) {
    console.log('[Sync] Offline. Will retry...');
    return;
  }

  console.log(`[Sync] Internet is back. Syncing ${offlineMessages.length} messages...`);

  try {
    const batch = firebaseDB.batch();

    offlineMessages.forEach((msg) => {
      const docRef = firebaseDB.collection('messages').doc(msg.id);
      batch.set(docRef, msg);
    });

    await batch.commit();

    // Clear local messages after sync
    db.data.messages = [];
    await db.write();

    console.log('[Sync] Successfully synced messages to Firebase.');
  } catch (err) {
    console.error('[Sync] Failed to sync messages:', err);
  }
}

// Run periodically
setInterval(syncOfflineMessages, syncInterval);
