import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, RefreshCw, Send, Users, AlertTriangle, LogOut, CloudOff, CloudUpload, CloudDownload } from 'lucide-react';
import { useLocalWave } from '../context/LocalWaveContext';
import { useAuth } from '../context/AuthContext';
import NetworkStatus from '../components/ui/network-status';
import DeviceCard from '../components/ui/device-card';
import MessageBubble from '../components/ui/message-bubble';
import ChatView from '../components/ui/chat-view';
import { fadeIn, slideUp } from '../lib/animations';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';

const DevicesPage: React.FC = () => {
  const { 
    setCurrentView, 
    isLanConnected, 
    isSyncing,
    pendingSyncCount,
    discoveredDevices,
    messages,
    currentMessage,
    setCurrentMessage,
    handleSendMessage,
    refreshDevices,
    selectedDevice,
    setSelectedDevice,
    syncToCloud,
    syncFromCloud,
    isInternetConnected,
    webSocket,
    typingUsers
  } = useLocalWave();
  
  const { username, signOut, isOnline } = useAuth();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Track the typing timer for group chat
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle typing indicators for group chat
  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentMessage(newValue);
    
    // Send typing indicator via WebSocket for group chat
    if (webSocket && webSocket.readyState === WebSocket.OPEN && username) {
      // If we're starting to type, send typing indicator
      if (!currentMessage && newValue) {
        webSocket.send(JSON.stringify({
          type: 'typing',
          content: 'typing',
          sender: username,
          recipient: 'all', // Broadcast to all users
          timestamp: Date.now()
        }));
      }
      
      // Clear any existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Set a timer to send "stopped typing" after 2 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify({
            type: 'typing',
            content: 'stopped',
            sender: username,
            recipient: 'all',
            timestamp: Date.now()
          }));
        }
      }, 2000);
    }
  };
  
  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);
  
  const navigateToLanding = () => setCurrentView('landing');
  
  // Handle device selection for one-to-one chat
  const handleDeviceClick = (device: any) => {
    setSelectedDevice(device);
  };
  
  // Reset selected device to go back to group chat
  const handleBackToDevices = () => {
    setSelectedDevice(null);
  };
  
  // Filter to show messages for broadcast (all) when no device is selected
  const filteredMessages = selectedDevice 
    ? [] // ChatView will filter messages specific to the device
    : messages.filter(message => message.recipient === 'all' || !message.recipient);
  
  // Count online users
  const onlineDevices = discoveredDevices.filter(device => device.status === 'online').length;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);
  
  // Poll for devices periodically
  useEffect(() => {
    const pollInterval = setInterval(refreshDevices, 30000); // Poll every 30 seconds
    
    // Initial device scan
    refreshDevices();
    
    return () => clearInterval(pollInterval);
  }, []);
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Header with Network Status */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-3 px-4 md:px-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={navigateToLanding}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Radio className="h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">LocalWave</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="hidden md:flex items-center space-x-3">
                <NetworkStatus type="lan" connected={isLanConnected} />
                <NetworkStatus type="internet" connected={isOnline} />
                {pendingSyncCount > 0 && (
                  <NetworkStatus type="syncing" count={pendingSyncCount} />
                )}
              </div>
              
              {/* Username Display */}
              {username && (
                <div className="hidden md:block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {username}
                </div>
              )}
              
              {/* Menu Button */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Status Bar */}
          <div className="md:hidden flex items-center justify-between py-2 px-4 bg-gray-50 text-xs border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <NetworkStatus type="lan" connected={isLanConnected} mobile />
              <NetworkStatus type="internet" connected={isOnline} mobile />
            </div>
            {pendingSyncCount > 0 && (
              <NetworkStatus type="syncing" count={pendingSyncCount} mobile />
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:flex gap-6">
        {/* Devices Section */}
        <motion.section 
          className={`${selectedDevice && 'hidden md:block'} md:w-1/3 lg:w-1/4 mb-6 md:mb-0`}
          variants={slideUp}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Discovered Devices</h2>
              <button 
                onClick={refreshDevices}
                className="p-1.5 hover:bg-indigo-100 rounded-full transition"
              >
                <RefreshCw className="h-5 w-5 text-indigo-600" />
              </button>
            </div>
            
            {/* Device List */}
            <div className="divide-y divide-gray-100">
              {discoveredDevices.length > 0 ? (
                discoveredDevices.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onClick={() => handleDeviceClick(device)}
                  />
                ))
              ) : (
                <div className="p-6 text-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-600">No devices discovered yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Make sure other devices are on the same network.</p>
                </div>
              )}
            </div>
            
            {/* Cloud Sync Section */}
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Cloud Sync</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${isInternetConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-600">
                    {isInternetConnected ? 'Internet Connected' : 'Internet Disconnected'}
                  </span>
                </div>
                
                {pendingSyncCount > 0 && (
                  <div className="text-sm text-amber-600 mt-1 mb-2 flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    {pendingSyncCount} {pendingSyncCount === 1 ? 'message' : 'messages'} pending sync
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={syncToCloud}
                    disabled={!isInternetConnected || isSyncing}
                  >
                    <CloudUpload className="h-4 w-4 mr-1" />
                    <span>To Cloud</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={syncFromCloud}
                    disabled={!isInternetConnected || isSyncing}
                  >
                    <CloudDownload className="h-4 w-4 mr-1" />
                    <span>From Cloud</span>
                  </Button>
                </div>
                
                {isSyncing && (
                  <div className="text-center text-xs text-indigo-500 mt-1">
                    <RefreshCw className="h-3 w-3 inline-block mr-1 animate-spin" />
                    Syncing...
                  </div>
                )}
                
                {!isInternetConnected && (
                  <div className="text-center text-xs text-gray-500 mt-1 flex items-center justify-center">
                    <CloudOff className="h-3 w-3 mr-1" />
                    Internet connection required for sync
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Chat Section */}
        <motion.section 
          className={`${selectedDevice ? 'w-full' : 'md:w-2/3 lg:w-3/4'} flex flex-col`}
          variants={slideUp}
        >
          {selectedDevice ? (
            <ChatView
              device={selectedDevice}
              messages={messages}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              handleSendMessage={handleSendMessage}
              onBack={handleBackToDevices}
              username={username}
              socket={webSocket}
              isTyping={typingUsers[selectedDevice.id] || false}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Local Network Chat</h2>
                    <p className="text-xs text-gray-500">{onlineDevices} devices connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600">
                    {isOnline ? 'Online' : 'Offline Mode'}
                  </div>
                  <button 
                    onClick={async () => {
                      await signOut();
                      setLocation('/auth');
                    }}
                    className="p-2 hover:bg-indigo-100 rounded-full transition text-red-500"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Message Area */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map(message => (
                    <MessageBubble
                      key={message.id} 
                      message={message}
                      isOwnMessage={message.sender === username}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <Radio className="h-12 w-12 text-indigo-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No messages yet</h3>
                    <p className="text-gray-500 max-w-md">Start the conversation by sending a message to everyone on your local network!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2 relative">
                  {/* Typing indicators for group chat */}
                  {Object.entries(typingUsers)
                    .filter(([userId, isTyping]) => isTyping && userId !== username)
                    .map(([userId]) => {
                      // Find the device name for the typing user
                      const typingDevice = discoveredDevices.find(d => d.id === userId);
                      const typingName = typingDevice?.name || userId;
                      
                      return (
                        <div key={userId} className="text-xs text-indigo-600 animate-pulse absolute -mt-6 ml-2">
                          {typingName} is typing...
                        </div>
                      );
                    })
                  }
                  
                  <input
                    type="text"
                    placeholder="Type your message..." 
                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={currentMessage}
                    onChange={handleGroupInputChange}
                    onKeyDown={handleEnterKey}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </motion.div>
  );
};

export default DevicesPage;
