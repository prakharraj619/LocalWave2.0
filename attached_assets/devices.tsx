import express from 'express';
import { authenticatedClients } from './index';
import { networkInterfaces } from 'os';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  ip: string;
  lastSeen: string;
}

const router = express.Router();
const discoveredDevices = new Map<string, Device>();

// Helper function to get local IP address
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

// Scan for devices in the LAN
router.post('/scan', async (req, res) => {
  try {
    // Get current user's device info
    const localIP = getLocalIPAddress();
    
    // Clear old devices
    discoveredDevices.clear();
    
    // Add all currently authenticated clients as devices
    authenticatedClients.forEach((ws, uid) => {
      discoveredDevices.set(uid, {
        id: uid,
        name: `User-${uid.substring(0, 6)}`,
        status: 'online',
        ip: localIP,
        lastSeen: new Date().toISOString()
      });
    });

    res.status(200).json({ message: 'Scan complete' });
  } catch (error) {
    console.error('Error scanning devices:', error);
    res.status(500).json({ error: 'Failed to scan devices' });
  }
});

// Get list of discovered devices
router.get('/', (req, res) => {
  const devices = Array.from(discoveredDevices.values());
  res.json(devices);
});

export default router;