import WebSocket from 'ws';

// Map to store authenticated clients and their WebSocket connections
export const authenticatedClients = new Map<string, WebSocket>();