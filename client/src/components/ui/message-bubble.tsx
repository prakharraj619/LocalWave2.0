import React from 'react';
import { Message } from '../../context/LocalWaveContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Animation variants
  const variants = {
    hidden: { 
      opacity: 0,
      x: isOwnMessage ? 20 : -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    }
  };

  return (
    <motion.div 
      className={`flex items-start gap-3 ${isOwnMessage ? 'justify-end' : ''}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {!isOwnMessage && (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
          <span className="text-xs font-bold">
            {message.sender.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      <div className={`${isOwnMessage ? 'bg-indigo-100' : 'bg-green-50'} p-3 rounded-lg ${isOwnMessage ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm max-w-md`}>
        <div className="flex justify-between items-start mb-1">
          <span className={`font-medium ${isOwnMessage ? 'text-indigo-700' : 'text-green-700'}`}>
            {isOwnMessage ? 'Me' : message.sender}
          </span>
          <div className="flex items-center">
            {!message.synced && (
              <Loader2 className="h-3 w-3 text-gray-400 animate-spin mr-1" />
            )}
            <span className="text-xs text-gray-500">{formattedTime}</span>
          </div>
        </div>
        <p className="text-gray-700">{message.content}</p>
      </div>

      {isOwnMessage && (
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
          <span className="text-xs font-bold">ME</span>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
