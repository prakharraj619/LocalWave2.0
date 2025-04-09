import WebSocket from 'ws';
import { firebaseAuth } from './firebase';
import { addMessageToLocalDB } from './sync';
import isOnline from 'is-online';
import { authenticatedClients } from './index';

interface Message {
  type: 'message' | 'status';
  content: string;
  sender: string;
  recipient?: string;
  timestamp: number;
}

interface ClientInfo {
  socket: WebSocket;
  uid: string;
  deviceId: string;
}

const clients = new Map<string, ClientInfo>();

export const handleWebSocketConnection = async (ws: WebSocket, req: any) => {
  let clientInfo: ClientInfo | undefined;

  try {
    const token = req.url?.split('token=')[1];
    if (!token) throw new Error('No authentication token provided');

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const deviceId = req.headers['x-device-id'] || 'unknown';

    clientInfo = { socket: ws, uid, deviceId };
    clients.set(deviceId, clientInfo);
    authenticatedClients.set(uid, ws);

    console.log(`Client connected - UID: ${uid}, Device: ${deviceId}`);

    // Handle incoming messages
    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message: Message = JSON.parse(data.toString());
        const isNetworkAvailable = await isOnline();

        // Store message locally if offline
        if (!isNetworkAvailable) {
          console.log('Network offline - storing message locally');
          await addMessageToLocalDB(message);
        }

        // Broadcast message to intended recipient or all connected clients
        if (message.recipient) {
          // Direct message to specific recipient
          const recipientSocket = Array.from(clients.values())
            .find(client => client.uid === message.recipient)?.socket;

          if (recipientSocket?.readyState === WebSocket.OPEN) {
            recipientSocket.send(JSON.stringify(message));
          }
        } else {
          // Broadcast to all except sender
          clients.forEach((client) => {
            if (client.socket !== ws && client.socket.readyState === WebSocket.OPEN) {
              client.socket.send(JSON.stringify(message));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      if (clientInfo) {
        clients.delete(clientInfo.deviceId);
        authenticatedClients.delete(clientInfo.uid);
        console.log(`Client disconnected - UID: ${clientInfo.uid}, Device: ${clientInfo.deviceId}`);
      }
    });

  } catch (error) {
    console.error('WebSocket connection error:', error);
    ws.close(1008, 'Authentication failed');
  }
};

export const getConnectedClients = () => {
  return Array.from(clients.values()).map(({ uid, deviceId }) => ({ uid, deviceId }));
};