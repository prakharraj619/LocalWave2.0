import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, RefreshCw, Send, Users, AlertTriangle, LogOut } from 'lucide-react';
import { useLocalWave } from '../context/LocalWaveContext';
import { useAuth } from '../context/AuthContext';
import NetworkStatus from './ui/network-status';
import DeviceCard from './ui/device-card';
import MessageBubble from './ui/message-bubble';
import { fadeIn, slideUp } from '../lib/animations';
import { useLocation } from 'wouter';

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
    setDiscoveredDevices
  } = useLocalWave();
  
  const { username, signOut, isOnline } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const navigateToLanding = () => setCurrentView('landing');
  
  // Count online users
  const onlineDevices = discoveredDevices.filter(device => device.status === 'online').length;
  
  const refreshDevices = async () => {
    try {
      // Trigger network scan
      await fetch('/api/devices/scan', { method: 'POST' });
      // Get updated device list
      const response = await fetch('/api/devices');
      if (response.ok) {
        const devices = await response.json();
        setDiscoveredDevices(devices);
      }
    } catch (error) {
      console.error('Error refreshing devices:', error);
    }
  };
  
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
                <NetworkStatus type="internet" connected={false} />
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
              <NetworkStatus type="internet" connected={false} mobile />
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
          className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0"
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
                  <DeviceCard key={device.id} device={device} />
                ))
              ) : (
                <div className="p-6 text-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-600">No devices discovered yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Make sure other devices are on the same network.</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
        
        {/* Chat Section */}
        <motion.section 
          className="md:w-2/3 lg:w-3/4 flex flex-col"
          variants={slideUp}
        >
          {/* User is set - Always show chat UI with authentication */}
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
              {messages.length > 0 ? (
                messages.map(message => (
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
            </div>
            
            {/* Message Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..." 
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleEnterKey}
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
        </motion.section>
      </main>
    </motion.div>
  );
};

export default DevicesPage;
