import express from "express";
import expressWs from "express-ws";
import WebSocket from "ws";
import admin from "firebase-admin";
import session from "express-session";
import MemoryStore from "memorystore";
import lanRoutes from "./lan.js";
import deviceRoutes from "./devices.jsx";
import dotenv from "dotenv";
import './sync.js'; // Automatically starts syncing

dotenv.config();

const app = express();
const wsInstance = expressWs(app);
const PORT = process.env.PORT || 4000;

const MemoryStoreConstructor = MemoryStore(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "localwave",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStoreConstructor({ checkPeriod: 86400000 }),
  })
);

app.use(express.json());
app.use("/api/network", lanRoutes);
app.use("/api/devices", deviceRoutes);

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK as string)),
});

export const authenticatedClients = new Map<string, WebSocket>();

// Import WebSocket handler
import { handleWebSocketConnection } from './websocket.js';

// WebSocket endpoint
wsInstance.app.ws("/ws", handleWebSocketConnection);

app.listen(PORT, () => {
  console.log(`LocalWave backend is running on port ${PORT}`);
});
});
