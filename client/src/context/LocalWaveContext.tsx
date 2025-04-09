import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { v4 as uuidv4 } from 'uuid';
import isOnline from 'is-online';
import { 
  registerServiceWorker, 
  requestNotificationPermission,
  sendMessageToServiceWorker
} from '@/lib/service-worker';

export interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  ip: string;
  lastSeen: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  recipient?: string;
  timestamp: number;
  synced: boolean;
  type?: 'message' | 'status' | 'typing';
  delivered?: boolean;
  read?: boolean;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
}

type ViewType = 'landing' | 'devices' | 'chat';

interface LocalWaveContextProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  discoveredDevices: Device[];
  messages: Message[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLanConnected: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  refreshDevices: () => Promise<void>;
  webSocket: WebSocket | null;
  typingUsers: Record<string, boolean>;
  isInternetConnected: boolean;
  setDiscoveredDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  hasServiceWorker: boolean;
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  updateMessageStatus: (id: string, status: 'delivered' | 'read' | 'failed') => void;
}

const LocalWaveContext = createContext<LocalWaveContextProps | undefined>(undefined);

export const LocalWaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLanConnected, setIsLanConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isInternetConnected, setIsInternetConnected] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [hasServiceWorker, setHasServiceWorker] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  const { toast } = useToast();
  const { user, username, isOnline: authIsOnline } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (user || username) {
      initializeWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user, username]);

  // Check LAN connection periodically
  useEffect(() => {
    const checkLanConnection = async () => {
      try {
        const response = await fetch('/api/network/lan');
        if (response.ok) {
          setIsLanConnected(true);
        } else {
          setIsLanConnected(false);
        }
      } catch (error) {
        setIsLanConnected(false);
      }
    };

    checkLanConnection();
    const interval = setInterval(checkLanConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check internet connection status
  useEffect(() => {
    const checkInternetConnection = async () => {
      try {
        const online = await isOnline();
        setIsInternetConnected(!!online);
      } catch (error) {
        setIsInternetConnected(false);
      }
    };
    
    checkInternetConnection();
    const interval = setInterval(checkInternetConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Check pending sync count
  useEffect(() => {
    const getPendingSyncCount = async () => {
      if (authIsOnline && isInternetConnected) {
        try {
          const response = await fetch('/api/network/pending-sync');
          if (response.ok) {
            const data = await response.json();
            setPendingSyncCount(data.count);
            setIsSyncing(data.count > 0);
          }
        } catch (error) {
          console.error('Error fetching pending sync count:', error);
        }
      }
    };

    getPendingSyncCount();
    const interval = setInterval(getPendingSyncCount, 10000);

    return () => clearInterval(interval);
  }, [authIsOnline, isInternetConnected]);
  
  // Initialize service worker
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        const registration = await registerServiceWorker();
        setHasServiceWorker(!!registration);
        setServiceWorkerRegistration(registration);
        
        if (registration) {
          // Check if notifications are already enabled
          if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
          }
          
          console.log('Service worker registered successfully');
        }
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    };
    
    initServiceWorker();
  }, []);

  const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Add username as a query parameter for authentication
    const userIdentifier = username || user?.uid || 'guest-' + Math.floor(Math.random() * 1000);
    const wsUrl = `${protocol}//${window.location.host}/ws?username=${encodeURIComponent(userIdentifier)}`;
    
    console.log('Connecting to WebSocket with URL:', wsUrl);
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setIsLanConnected(true);
      
      // Refresh devices after connection
      refreshDevices();
    };
    
    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'message') {
          // Handle regular messages
          setMessages(prev => [...prev, { 
            id: message.id || uuidv4(),
            content: message.content,
            sender: message.sender,
            recipient: message.recipient,
            timestamp: message.timestamp,
            synced: message.synced || false,
            type: 'message'
          }]);
        } 
        else if (message.type === 'typing') {
          // Handle typing indicators
          const senderId = message.sender;
          const isTyping = message.content === 'typing';
          
          console.log(`${senderId} is ${isTyping ? 'typing' : 'stopped typing'}`);
          
          setTypingUsers(prev => ({
            ...prev,
            [senderId]: isTyping
          }));
          
          // Auto-clear typing indicator after a timeout (as a fallback)
          if (isTyping) {
            setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [senderId]: false
              }));
            }, 5000);
          }
        }
        else if (message.type === 'status') {
          // Handle status updates (online/offline)
          console.log(`Status update from ${message.sender}: ${message.content}`);
          
          // Update device status if needed
          if (['online', 'offline'].includes(message.content)) {
            refreshDevices();
          }
          
          // If the system is telling us about new users/devices, refresh the device list
          if (message.content.includes('has joined') || message.content.includes('has left')) {
            refreshDevices();
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsLanConnected(false);
      // Try to reconnect after 5 seconds
      setTimeout(initializeWebSocket, 5000);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLanConnected(false);
    };
    
    setSocket(newSocket);
  };

  const refreshDevices = async () => {
    try {
      // Trigger network scan
      await apiRequest('POST', '/api/devices/scan', {});
      
      // Get updated device list
      const response = await fetch('/api/devices');
      if (response.ok) {
        const devices = await response.json();
        setDiscoveredDevices(devices);
      }
    } catch (error) {
      console.error('Error refreshing devices:', error);
      toast({
        title: "Failed to refresh devices",
        description: "Please check your network connection",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      content: currentMessage,
      sender: username || user?.uid || 'Anonymous',
      timestamp: Date.now(),
      synced: false,
      // If a device is selected, send to that device, otherwise broadcast
      recipient: selectedDevice ? selectedDevice.id : 'all'
    };
    
    // Add message to local state
    setMessages(prev => [...prev, newMessage]);
    
    // Send through WebSocket if connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        ...newMessage,
      }));
    } else {
      // Store locally if WebSocket is not connected
      // The server will handle sync later
      toast({
        title: "Offline mode",
        description: "Message stored locally and will sync when connection is restored",
      });
    }
    
    // Save message to API for persistence
    saveMessageToApi(newMessage).catch(error => {
      console.error('Failed to save message:', error);
    });
    
    // Clear input
    setCurrentMessage('');
  };
  
  const saveMessageToApi = async (message: Message) => {
    try {
      await apiRequest('POST', '/api/messages', message);
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Failed to save message",
        description: "Message will be saved when connection is restored",
        variant: "destructive",
      });
    }
  };
  
  // Sync messages to cloud (Firebase)
  const syncToCloud = async () => {
    if (!isInternetConnected) {
      toast({
        title: "Cannot sync to cloud",
        description: "Internet connection is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const response = await apiRequest('POST', '/api/sync/to-cloud', {});
      
      if (response && 'message' in response) {
        toast({
          title: "Sync successful",
          description: response.message as string,
        });
      }
      
      // Update pending count
      const pendingResponse = await fetch('/api/network/pending-sync');
      if (pendingResponse.ok) {
        const data = await pendingResponse.json();
        setPendingSyncCount(data.count);
      }
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      toast({
        title: "Sync failed",
        description: "Could not sync messages to cloud",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync messages from cloud (Firebase)
  const syncFromCloud = async () => {
    if (!isInternetConnected) {
      toast({
        title: "Cannot sync from cloud",
        description: "Internet connection is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/sync/from-cloud');
      
      if (response.ok) {
        const cloudMessages = await response.json() as Message[];
        
        // Add any new messages to the local state
        if (cloudMessages.length > 0) {
          // Only add messages we don't already have
          const existingIds = new Set(messages.map((m: Message) => m.id));
          const newMessages = cloudMessages.filter((m: Message) => !existingIds.has(m.id));
          
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
            
            toast({
              title: "Sync successful",
              description: `Retrieved ${newMessages.length} new messages from cloud`,
            });
          } else {
            toast({
              title: "Sync successful",
              description: "No new messages to sync",
            });
          }
        } else {
          toast({
            title: "Sync successful",
            description: "No messages in cloud",
          });
        }
      }
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      toast({
        title: "Sync failed",
        description: "Could not retrieve messages from cloud",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Enable notifications
  const enableNotifications = async (): Promise<boolean> => {
    if (!hasServiceWorker) {
      toast({
        title: "Notifications not available",
        description: "Service workers are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }
    
    // Request permission
    const permissionGranted = await requestNotificationPermission();
    setNotificationsEnabled(permissionGranted);
    
    if (permissionGranted) {
      toast({
        title: "Notifications enabled",
        description: "You will now receive notifications for new messages",
      });
      
      // Register for push notifications if supported
      // This is a stub - in a real implementation you would subscribe to push notifications
      // and send the subscription to your server
      if (serviceWorkerRegistration && 'pushManager' in serviceWorkerRegistration) {
        try {
          // This would be implemented with real push notification subscription
          console.log('Push notifications are supported');
        } catch (error) {
          console.error('Error subscribing to push notifications:', error);
        }
      }
    } else {
      toast({
        title: "Notifications disabled",
        description: "You will not receive notifications for new messages",
        variant: "destructive",
      });
    }
    
    return permissionGranted;
  };
  
  // Update message status (delivered, read, failed)
  const updateMessageStatus = (id: string, status: 'delivered' | 'read' | 'failed') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id 
          ? { ...msg, deliveryStatus: status, delivered: status !== 'failed', read: status === 'read' } 
          : msg
      )
    );
    
    // If the message is now delivered or read, update on the server
    if (status !== 'failed' && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'status',
        id,
        content: status,
        sender: username || user?.uid || 'Anonymous',
        timestamp: Date.now()
      }));
    }
    
    // Update status in the database
    apiRequest('PATCH', `/api/messages/${id}/status`, { status })
      .catch(error => console.error('Failed to update message status:', error));
  };

  return (
    <LocalWaveContext.Provider value={{
      currentView,
      setCurrentView,
      discoveredDevices,
      messages,
      currentMessage,
      setCurrentMessage,
      handleSendMessage,
      isLanConnected,
      isSyncing,
      pendingSyncCount,
      selectedDevice,
      setSelectedDevice,
      refreshDevices,
      setDiscoveredDevices,
      syncToCloud,
      syncFromCloud,
      isInternetConnected,
      webSocket: socket,
      typingUsers,
      hasServiceWorker,
      notificationsEnabled,
      enableNotifications,
      updateMessageStatus
    }}>
      {children}
    </LocalWaveContext.Provider>
  );
};

export const useLocalWave = () => {
  const context = useContext(LocalWaveContext);
  if (context === undefined) {
    throw new Error('useLocalWave must be used within a LocalWaveProvider');
  }
  return context;
};
