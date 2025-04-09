import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Device, Message } from '@/context/LocalWaveContext';
import MessageBubble from './message-bubble';

interface ChatViewProps {
  device: Device;
  messages: Message[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  handleSendMessage: () => void;
  onBack: () => void;
  username: string | null;
  socket?: WebSocket | null;
  isTyping?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  device,
  messages,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  onBack,
  username,
  socket,
  isTyping = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter messages for the selected device
  const deviceMessages = messages.filter(
    message => 
      (message.recipient === device.id && message.sender === username) || 
      (message.sender === device.id && message.recipient === username)
  );

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send typing indicator when user is typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentMessage(newValue);
    
    // Send typing indicator via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN && username) {
      // If we're starting to type, send typing indicator
      if (!currentMessage && newValue) {
        socket.send(JSON.stringify({
          type: 'typing',
          content: 'typing',
          sender: username,
          recipient: device.id,
          timestamp: Date.now()
        }));
      }
      
      // Clear any existing typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // Set a new timer to send "stopped typing" after 2 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'typing',
            content: 'stopped',
            sender: username,
            recipient: device.id,
            timestamp: Date.now()
          }));
        }
      }, 2000);
    }
  };
  
  // Update typing indicator when isTyping prop changes
  useEffect(() => {
    setTypingIndicator(isTyping);
  }, [isTyping]);

  // Scroll to bottom when messages change or when typing indicator changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [deviceMessages, typingIndicator]);
  
  // Clean up the typing timer when unmounting
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 mr-2 rounded-full hover:bg-indigo-100 transition"
        >
          <ArrowLeft className="h-5 w-5 text-indigo-600" />
        </button>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${device.status === 'online' ? 'bg-indigo-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
            <div className={`w-3 h-3 ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{device.name}</h3>
            <p className="text-xs text-gray-500">{device.ip} • {device.status}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
        {deviceMessages.length > 0 ? (
          deviceMessages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender === username}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-indigo-500 text-xl font-bold">
                {device.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Start a conversation</h3>
            <p className="text-gray-500 max-w-md">Send a message to {device.name}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Message ${device.name}...`}
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={currentMessage}
            onChange={handleInputChange}
            onKeyDown={handleEnterKey}
          />
          {typingIndicator && (
            <div className="text-xs text-indigo-600 animate-pulse absolute -mt-6 ml-2">
              {device.name} is typing...
            </div>
          )}
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
  );
};

export default ChatView;