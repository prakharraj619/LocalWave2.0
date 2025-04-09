// db.ts - handles local message storage using lowdb
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export type Message = {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  synced: boolean;
};

export type User = {
  uid: string;
  email: string;
};

export type Data = {
  messages: Message[];
  users: User[];
};

const dbFolder = join(process.cwd(), 'db');
const dbFile = join(dbFolder, 'db.json');

if (!existsSync(dbFolder)) mkdirSync(dbFolder);

const adapter = new JSONFile<Data>(dbFile);
export const db = new Low<Data>(adapter, {
  messages: [],
  users: [],
});

await db.read();
db.data ||= { messages: [], users: [] };
await db.write();
