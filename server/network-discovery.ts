/**
 * Network Discovery Module
 * 
 * IMPORTANT: These methods will only work when deployed on an actual
 * local network device (not in cloud environments like Replit).
 * 
 * This module contains methods for discovering devices on a local network
 * using various protocols and techniques.
 */

import { exec } from 'child_process';
import util from 'util';
import { networkInterfaces } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Convert exec to use promises
const execPromise = util.promisify(exec);

// Interface for discovered devices
export interface DiscoveredDevice {
  id: string;
  name: string;
  status: 'online' | 'offline';
  ip: string;
  lastSeen: string;
  mac?: string;
  manufacturer?: string;
  deviceType?: string;
}

/**
 * Get the local IP address of the current device
 */
export function getLocalIPAddress(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // Check for family as string or number due to differences in Node.js versions
      const isIPv4 = net.family === 'IPv4' || net.family === 4;
      if (isIPv4 && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

/**
 * Get the local network subnet (e.g., "192.168.1")
 */
export function getLocalSubnet(): string {
  const ip = getLocalIPAddress();
  const parts = ip.split('.');
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

/**
 * Scan network using ARP tables
 * This will only work on actual network devices, not in cloud environments
 */
export async function scanArpTable(): Promise<DiscoveredDevice[]> {
  try {
    // This command works on Linux/macOS, would need adaptation for Windows
    const { stdout } = await execPromise('arp -a');
    
    // Parse ARP table results
    const lines = stdout.split('\n');
    const devices: DiscoveredDevice[] = [];
    
    for (const line of lines) {
      // Parse lines like: "? (192.168.1.1) at 00:11:22:33:44:55 on en0 ifscope [ethernet]"
      const ipMatch = line.match(/\(([0-9.]+)\)/);
      const macMatch = line.match(/at ([0-9A-Fa-f:]+)/);
      
      if (ipMatch && macMatch) {
        const ip = ipMatch[1];
        const mac = macMatch[1];
        
        // Try to get hostname (may require additional DNS lookup)
        let name = `Device-${ip.split('.').pop()}`;
        try {
          const { stdout: hostnameResult } = await execPromise(`host ${ip}`);
          const hostnameMatch = hostnameResult.match(/domain name pointer ([^\s]+)/);
          if (hostnameMatch) {
            name = hostnameMatch[1];
          }
        } catch (e) {
          // Hostname lookup failed, keep the default name
        }
        
        devices.push({
          id: `net-${uuidv4().substring(0, 8)}`,
          name,
          status: 'online',
          ip,
          mac,
          lastSeen: new Date().toISOString()
        });
      }
    }
    
    return devices;
  } catch (error) {
    console.error('Error scanning ARP table:', error);
    return [];
  }
}

/**
 * Scan the network using Ping (ICMP)
 * This will only work on actual network devices with appropriate permissions
 */
export async function scanNetworkWithPing(): Promise<DiscoveredDevice[]> {
  try {
    const subnet = getLocalSubnet();
    const devices: DiscoveredDevice[] = [];
    const pingPromises = [];
    
    // Ping all addresses in the subnet (1-254)
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}.${i}`;
      pingPromises.push(
        execPromise(`ping -c 1 -W 1 ${ip}`)
          .then(() => ({
            id: `ping-${uuidv4().substring(0, 8)}`,
            name: `Device-${i}`,
            status: 'online',
            ip,
            lastSeen: new Date().toISOString()
          }))
          .catch(() => null) // Ignore failed pings
      );
    }
    
    // Wait for all pings to complete
    const results = await Promise.all(pingPromises);
    
    // Filter out null results (failed pings)
    for (const result of results) {
      if (result) {
        // Ensure the status is the correct type
        const device: DiscoveredDevice = {
          ...result,
          status: result.status as 'online' | 'offline'
        };
        devices.push(device);
      }
    }
    
    return devices;
  } catch (error) {
    console.error('Error scanning network with ping:', error);
    return [];
  }
}

/**
 * This function would use the mDNS (Multicast DNS) protocol to discover
 * devices that support this protocol, like Apple devices, Chromecasts, etc.
 * 
 * Note: This is a stub that would require a library like bonjour or mdns
 */
export async function scanMdns(): Promise<DiscoveredDevice[]> {
  // This would require a library like 'bonjour' or 'mdns'
  // Example implementation (pseudo-code):
  /*
  const bonjour = require('bonjour')();
  return new Promise((resolve) => {
    const devices: DiscoveredDevice[] = [];
    bonjour.find({}, service => {
      devices.push({
        id: `mdns-${uuidv4().substring(0, 8)}`,
        name: service.name,
        status: 'online',
        ip: service.addresses[0],
        lastSeen: new Date().toISOString(),
        deviceType: service.type
      });
    });
    
    // Give some time for discovery
    setTimeout(() => {
      bonjour.destroy();
      resolve(devices);
    }, 5000);
  });
  */
  
  console.log('mDNS scanning would be implemented here with appropriate libraries');
  return [];
}

/**
 * This function would use UPnP (Universal Plug and Play) to discover
 * compatible devices like smart TVs, game consoles, etc.
 * 
 * Note: This is a stub that would require a library like node-ssdp
 */
export async function scanUpnp(): Promise<DiscoveredDevice[]> {
  // This would require a library like 'node-ssdp'
  // Example implementation (pseudo-code):
  /*
  const { Client } = require('node-ssdp');
  return new Promise((resolve) => {
    const devices: DiscoveredDevice[] = [];
    const client = new Client();
    
    client.on('response', (headers, statusCode, rinfo) => {
      devices.push({
        id: `upnp-${uuidv4().substring(0, 8)}`,
        name: headers['SERVER'] || `UPnP Device at ${rinfo.address}`,
        status: 'online',
        ip: rinfo.address,
        lastSeen: new Date().toISOString(),
        deviceType: headers['ST']
      });
    });
    
    client.search('ssdp:all');
    
    // Give some time for discovery
    setTimeout(() => {
      client.stop();
      resolve(devices);
    }, 5000);
  });
  */
  
  console.log('UPnP scanning would be implemented here with appropriate libraries');
  return [];
}

/**
 * Combine all available discovery methods to get a comprehensive list of devices
 */
export async function discoverAllNetworkDevices(): Promise<DiscoveredDevice[]> {
  const allDevices: Map<string, DiscoveredDevice> = new Map();
  
  try {
    // Use multiple discovery methods
    const arpDevices = await scanArpTable();
    const pingDevices = await scanNetworkWithPing();
    // We would add mDNS and UPnP devices here as well
    
    // Combine all devices, using IP as a unique key to avoid duplicates
    [...arpDevices, ...pingDevices].forEach(device => {
      if (!allDevices.has(device.ip)) {
        allDevices.set(device.ip, device);
      } else {
        // If device already exists, combine and enrich the information
        const existingDevice = allDevices.get(device.ip)!;
        allDevices.set(device.ip, {
          ...existingDevice,
          ...device,
          // Prefer non-generated names
          name: existingDevice.name.startsWith('Device-') ? device.name : existingDevice.name,
          // If either record shows online, the device is online
          status: existingDevice.status === 'online' || device.status === 'online' ? 'online' : 'offline',
          // Use the more recent lastSeen time
          lastSeen: new Date(Math.max(
            new Date(existingDevice.lastSeen).getTime(),
            new Date(device.lastSeen).getTime()
          )).toISOString()
        });
      }
    });
    
    return Array.from(allDevices.values());
  } catch (error) {
    console.error('Error discovering network devices:', error);
    return [];
  }
}