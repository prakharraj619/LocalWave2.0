import WebSocket from 'ws';
import { authenticatedClients } from './shared';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { type Message } from '@shared/schema';
import { syncMessagesToFirestore } from './firebase';

interface WebSocketMessage {
  type: 'message' | 'status' | 'discovery' | 'typing' | 'delivery';
  content: string;
  sender: string;
  id?: string;
  recipient?: string;
  timestamp: number;
  synced?: boolean;
  deviceId?: string;
  deviceName?: string;
  delivered?: boolean;
  read?: boolean;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
}

// Map to track active typing status by user
const typingUsers = new Map<string, NodeJS.Timeout>();
const TYPING_TIMEOUT = 3000; // typing indicator expires after 3 seconds

// Track device information
interface ClientInfo {
  ws: WebSocket;
  username: string;
  deviceId: string;
  deviceName: string;
  isOnline: boolean;
  lastSeen: Date;
}

const connectedClients = new Map<string, ClientInfo>();

export async function handleWebSocketConnection(ws: WebSocket, req: any): Promise<void> {
  console.log('New WebSocket connection established');
  
  const clientId = uuidv4(); // Generate a unique client ID
  let username: string | null = null;
  
  // Handle authentication
  const params = new URLSearchParams(req.url.split('?')[1]);
  username = params.get('username');
  
  if (username) {
    // Store the connection in authenticated clients
    authenticatedClients.set(username, ws);
    
    // Send the client their username for confirmation
    ws.send(JSON.stringify({
      type: 'status',
      content: 'connected',
      sender: 'system',
      timestamp: Date.now()
    }));
    
    // Broadcast to other clients that a new user has joined
    broadcastToAll({
      type: 'status',
      content: `${username} has joined the chat`,
      sender: 'system',
      timestamp: Date.now()
    }, ws);
  } else {
    // No username provided, request one
    ws.send(JSON.stringify({
      type: 'status',
      content: 'authentication_required',
      sender: 'system',
      timestamp: Date.now()
    }));
  }
  
  // Handle incoming messages
  ws.on('message', async (message: WebSocket.Data) => {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
      
      // Make sure we have a valid sender
      if (!parsedMessage.sender && username) {
        parsedMessage.sender = username;
      }
      
      // Generate ID if not provided
      if (!parsedMessage.id) {
        parsedMessage.id = uuidv4();
      }
      
      // Get device info from URL params for better tracking
      const deviceId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('deviceId') || 'unknown-device';
      const deviceName = new URL(req.url, `http://${req.headers.host}`).searchParams.get('deviceName') || 'Unknown Device';
      
      // Add device info to message if not present
      if (!parsedMessage.deviceId) {
        parsedMessage.deviceId = deviceId;
      }
      if (!parsedMessage.deviceName) {
        parsedMessage.deviceName = deviceName;
      }
      
      // Register client info for better tracking
      if (username && !connectedClients.has(username)) {
        connectedClients.set(username, {
          ws,
          username,
          deviceId,
          deviceName,
          isOnline: true,
          lastSeen: new Date()
        });
      }
      
      // Update last seen timestamp
      if (username && connectedClients.has(username)) {
        connectedClients.get(username)!.lastSeen = new Date();
      }
      
      console.log(`Received ${parsedMessage.type} from ${parsedMessage.sender}${parsedMessage.deviceName ? ` (${parsedMessage.deviceName})` : ''}`);
      
      // Handle different message types
      if (parsedMessage.type === 'typing') {
        // Handle typing indicator - don't validate content/store it
        handleTypingIndicator(parsedMessage);
        return;
      }
      
      // Handle delivery status updates
      if (parsedMessage.type === 'delivery' || (parsedMessage.type === 'status' && ['delivered', 'read', 'failed'].includes(parsedMessage.content))) {
        // Update message delivery status in database
        if (parsedMessage.id) {
          try {
            const messageId = parsedMessage.id;
            const status = parsedMessage.deliveryStatus || parsedMessage.content;
            
            console.log(`Updating message ${messageId} delivery status to ${status}`);
            
            // Update in database
            if (status === 'delivered' || status === 'read') {
              // TODO: Implement storage.updateMessageDeliveryStatus 
              // For now, just log it
              console.log(`Message ${messageId} marked as ${status}`);
            }
            
            // Forward delivery status to the original sender if this is a direct message
            const message = await storage.getMessage(messageId);
            if (message && message.sender !== parsedMessage.sender) {
              const senderWs = authenticatedClients.get(message.sender);
              if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                senderWs.send(JSON.stringify({
                  type: 'delivery',
                  id: messageId,
                  content: status,
                  deliveryStatus: status,
                  sender: 'system',
                  timestamp: Date.now()
                }));
              }
            }
          } catch (error) {
            console.error('Error updating message delivery status:', error);
          }
        }
        return;
      }
      
      // For non-typing and non-delivery messages, validate
      if (!parsedMessage.content || !parsedMessage.sender) {
        return ws.send(JSON.stringify({
          type: 'status',
          content: 'error: invalid message format',
          sender: 'system',
          timestamp: Date.now()
        }));
      }
      
      // Only store message if it's an actual message (not status/discovery)
      if (parsedMessage.type === 'message') {
        await storeMessage({
          id: parsedMessage.id,
          from: parsedMessage.sender,
          to: parsedMessage.recipient || 'all',
          content: parsedMessage.content,
          timestamp: new Date(parsedMessage.timestamp || Date.now()),
          synced: false
        });
        
        // Attempt to sync to cloud immediately if it's a direct message
        if (parsedMessage.recipient && parsedMessage.recipient !== 'all') {
          try {
            await syncMessagesToFirestore([{
              id: parsedMessage.id!,
              content: parsedMessage.content,
              sender: parsedMessage.sender,
              recipient: parsedMessage.recipient,
              timestamp: new Date(parsedMessage.timestamp || Date.now()),
              synced: true,
              userId: 1 // Default user ID
            }]);
            console.log('Direct message synced to cloud immediately');
          } catch (error) {
            console.log('Could not sync direct message to cloud immediately, will sync later');
          }
        }
      }
      
      // If this is a direct message to a specific recipient
      if (parsedMessage.recipient && parsedMessage.recipient !== 'all') {
        console.log(`Sending direct message to recipient: ${parsedMessage.recipient}`);
        
        // Send to the specified recipient
        const recipientWs = authenticatedClients.get(parsedMessage.recipient);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          // Add delivery status to message
          const messageWithDeliveryStatus = {
            ...parsedMessage,
            deliveryStatus: 'sent'
          };
          
          // Send to recipient
          recipientWs.send(JSON.stringify(messageWithDeliveryStatus));
          console.log('Message sent to recipient successfully');
          
          // Send delivery confirmation back to sender
          ws.send(JSON.stringify({
            type: 'delivery',
            id: parsedMessage.id,
            content: 'delivered',
            deliveryStatus: 'delivered',
            sender: 'system',
            recipient: parsedMessage.sender,
            timestamp: Date.now()
          }));
        } else {
          console.log(`Recipient ${parsedMessage.recipient} is not connected or unavailable`);
          
          // Mark as failed delivery if recipient is not online
          ws.send(JSON.stringify({
            type: 'delivery',
            id: parsedMessage.id,
            content: 'failed',
            deliveryStatus: 'failed',
            sender: 'system',
            recipient: parsedMessage.sender,
            timestamp: Date.now()
          }));
          
          // Send status message back to sender
          ws.send(JSON.stringify({
            type: 'status',
            content: `User ${parsedMessage.recipient} is currently offline. Message will be delivered when they connect.`,
            sender: 'system',
            timestamp: Date.now()
          }));
        }
        
        // Also send a copy to the sender to display in their chat
        ws.send(JSON.stringify(parsedMessage));
      } else {
        // Otherwise broadcast to all except the sender
        console.log('Broadcasting message to all users');
        broadcastToAll(parsedMessage as WebSocketMessage, ws);
      }
    } catch (error: any) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'status',
        content: `error: ${error.message || 'Unknown error'}`,
        sender: 'system',
        timestamp: Date.now()
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    if (username) {
      authenticatedClients.delete(username);
      
      // Broadcast to others that user has left
      broadcastToAll({
        type: 'status',
        content: `${username} has left the chat`,
        sender: 'system',
        timestamp: Date.now()
      }, null);
    }
    
    console.log('WebSocket connection closed');
  });
  
  // Handle errors
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
    if (username) {
      authenticatedClients.delete(username);
    }
  });
}

// Broadcast a message to all connected clients except the sender
function broadcastToAll(message: WebSocketMessage, exclude: WebSocket | null): void {
  authenticatedClients.forEach((client, _) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Store a message in the database
async function storeMessage(messageData: any): Promise<void> {
  try {
    const message = {
      id: messageData.id,
      content: messageData.content,
      sender: messageData.from,
      recipient: messageData.to,
      timestamp: new Date(messageData.timestamp),
      synced: messageData.synced || false,
      userId: 1, // Default user ID for now
    };

    await storage.createMessage(message);
    console.log('Message stored in database:', message.id);
  } catch (error) {
    console.error('Error storing message in database:', error);
  }
}

// Handle typing indicator messages
function handleTypingIndicator(message: WebSocketMessage): void {
  const sender = message.sender;
  const recipient = message.recipient;
  
  // Set up a timeout to auto-clear typing status after a period of inactivity
  const TYPING_TIMEOUT = 3000; // 3 seconds
  
  // Clear any existing timeout for this user
  if (typingUsers.has(sender)) {
    clearTimeout(typingUsers.get(sender)!);
  }
  
  // Set a new timeout to automatically send "stopped typing" after the timeout
  const timeout = setTimeout(() => {
    typingUsers.delete(sender);
    
    // Send typing stopped notification
    const stoppedTypingMsg: WebSocketMessage = {
      type: 'typing',
      content: 'stopped',
      sender: sender,
      recipient: recipient,
      timestamp: Date.now()
    };
    
    if (recipient) {
      // Direct message typing indicator
      const recipientWs = authenticatedClients.get(recipient);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify(stoppedTypingMsg));
      }
    } else {
      // Group chat typing indicator
      broadcastToAll(stoppedTypingMsg, null);
    }
  }, TYPING_TIMEOUT);
  
  typingUsers.set(sender, timeout);
  
  // Forward typing indicator to appropriate recipients
  if (recipient) {
    // Direct message typing indicator
    const recipientWs = authenticatedClients.get(recipient);
    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
      recipientWs.send(JSON.stringify(message));
    }
  } else {
    // Group chat typing indicator - send to everyone except sender
    const senderWs = authenticatedClients.get(sender) || null;
    broadcastToAll(message, senderWs);
  }
  
  console.log(`Typing indicator: ${sender} ${message.content === 'typing' ? 'is typing' : 'stopped typing'} ${recipient ? `to ${recipient}` : 'in group chat'}`);
}

// Utility function to get all connected clients
export function getConnectedClients(): ClientInfo[] {
  return Array.from(connectedClients.values());
}
