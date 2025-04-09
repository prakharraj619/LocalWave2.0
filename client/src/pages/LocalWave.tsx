import React, { useEffect } from 'react';
import { useLocalWave } from '../context/LocalWaveContext';
import LandingPage from './LandingPage';
import DevicesPage from './DevicesPage';
import { useAuth } from '../context/AuthContext';

const LocalWave: React.FC = () => {
  const { currentView, setCurrentView } = useLocalWave();
  const { user, username } = useAuth();

  // Set the initial view based on authentication status
  useEffect(() => {
    if (user || username) {
      setCurrentView('devices');
    } else {
      setCurrentView('landing');
    }
  }, [user, username, setCurrentView]);

  // Render the appropriate view
  switch (currentView) {
    case 'devices':
      return <DevicesPage />;
    case 'landing':
    default:
      return <LandingPage />;
  }
};

export default LocalWave;
