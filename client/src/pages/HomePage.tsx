import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users } from 'lucide-react';
import { useLocalWave } from '../context/LocalWaveContext';
import DevicesPage from './DevicesPage';
import { fadeIn } from '../lib/animations';

const HomePage: React.FC = () => {
  const { setCurrentView } = useLocalWave();

  // Set the current view to devices on component mount
  useEffect(() => {
    setCurrentView('devices');
  }, [setCurrentView]);

  return (
    <motion.div
      className="min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <DevicesPage />
    </motion.div>
  );
};

export default HomePage;
