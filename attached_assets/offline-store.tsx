// src/offline-store.ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// Define schema
type Message = {
  from: string;
  to: string;
  content: string;
  timestamp: string;
};

type Data = {
  messages: Message[];
};

// Create adapter for JSON file
const adapter = new JSONFile<Data>('offline-messages.json');
const db = new Low<Data>(adapter);

// Initialize with empty messages array if file is new
await db.read();
db.data ||= { messages: [] };
await db.write();

export default db;

