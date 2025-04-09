import React from 'react';
import { Device } from '../../context/LocalWaveContext';
import { Monitor, Smartphone, Laptop, Server } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick }) => {
  const getIcon = () => {
    // Simple device type estimation based on name
    const deviceName = device.name.toLowerCase();
    
    if (deviceName.includes('phone') || deviceName.includes('mobile')) {
      return <Smartphone className="h-6 w-6 text-indigo-600" />;
    } else if (deviceName.includes('laptop')) {
      return <Laptop className="h-6 w-6 text-indigo-600" />;
    } else if (deviceName.includes('server')) {
      return <Server className="h-6 w-6 text-indigo-600" />;
    } else {
      return <Monitor className="h-6 w-6 text-indigo-600" />;
    }
  };

  return (
    <div 
      className="p-4 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${device.status === 'online' ? 'bg-indigo-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{device.name}</h3>
          <p className="text-xs text-gray-500">{device.ip}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
        <span className="text-xs text-gray-500">{device.status}</span>
      </div>
    </div>
  );
};

export default DeviceCard;
