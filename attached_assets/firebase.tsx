// firebase.ts - initializes Firebase Admin SDK
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Load service account from environment or local file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || join(process.cwd(), 'firebase-service-account.json');

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const firebaseAuth = admin.auth();
export const firebaseDB = admin.firestore();
