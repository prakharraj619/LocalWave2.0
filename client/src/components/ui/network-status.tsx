import React from 'react';
import { Wifi, Globe, RefreshCw } from 'lucide-react';

interface NetworkStatusProps {
  type: 'lan' | 'internet' | 'syncing';
  connected?: boolean;
  count?: number;
  mobile?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  type, 
  connected = false, 
  count = 0,
  mobile = false
}) => {
  const getStatusIcon = () => {
    switch (type) {
      case 'lan':
        return <Wifi className={`${mobile ? 'h-3 w-3' : 'h-4 w-4'} ${connected ? 'text-green-500' : 'text-gray-400'}`} />;
      case 'internet':
        return <Globe className={`${mobile ? 'h-3 w-3' : 'h-4 w-4'} ${connected ? 'text-green-500' : 'text-gray-400'}`} />;
      case 'syncing':
        return <RefreshCw className={`${mobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500 animate-spin`} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (type) {
      case 'lan':
        return mobile ? 'LAN' : 'LAN ' + (connected ? 'Connected' : 'Disconnected');
      case 'internet':
        return mobile ? 'Internet' : 'Internet ' + (connected ? 'Connected' : 'Disconnected');
      case 'syncing':
        return mobile ? `${count} pending` : `Syncing ${count}`;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-1.5">
      {getStatusIcon()}
      <span className={`${mobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{getStatusText()}</span>
    </div>
  );
};

export default NetworkStatus;
