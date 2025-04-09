import React from 'react';
import { motion } from 'framer-motion';
import { Send, Radio, Wifi, Network, Shield, Users, LogIn } from 'lucide-react';
import { useLocalWave } from '../context/LocalWaveContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';
import { 
  fadeIn, 
  slideUp, 
  floatAnimation,
  staggerChildren
} from '../lib/animations';

const LandingPage: React.FC = () => {
  const { setCurrentView } = useLocalWave();
  const { user, username } = useAuth();
  const [, setLocation] = useLocation();
  
  // If user is authenticated, go to home page
  // Otherwise go to auth page
  const navigateToDevices = () => {
    if (user || username) {
      setLocation('/home');
    } else {
      setLocation('/auth');
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 px-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-indigo-600 rounded-full animate-pulse opacity-50"></div>
              <Radio className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-800">LocalWave</span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-gray-700 hover:text-indigo-600 transition font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 transition font-medium">How It Works</a>
            <a href="#faq" className="text-gray-700 hover:text-indigo-600 transition font-medium">FAQ</a>
            <button 
              onClick={navigateToDevices}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md shadow-md hover:shadow-lg transition font-medium">
              Get Started
            </button>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-indigo-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-8 items-center">
        <motion.div 
          className="space-y-6"
          variants={slideUp}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            <span className="block text-indigo-600">Chat Offline.</span>
            <span className="block">Sync Online.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            LocalWave connects devices on the same network for messaging without internet. Your data stays local and syncs to the cloud only when you're back online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={navigateToDevices}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 font-medium">
              <Wifi className="h-5 w-5" />
              <span>Start Messaging</span>
            </button>
            <a href="#how-it-works" className="bg-white border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition flex items-center justify-center space-x-2 font-medium">
              <Network className="h-5 w-5" />
              <span>Learn More</span>
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="relative"
          variants={floatAnimation}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl blur opacity-30"></div>
          <div className="bg-white p-8 rounded-2xl shadow-xl relative">
            <div className="float-animation">
              <div className="flex items-start gap-3 mb-8">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div className="bg-green-50 p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs">
                  <p className="text-gray-700">Hey! Looks like we're both offline but still connected via WiFi!</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:42 AM</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 justify-end mb-8">
                <div className="bg-indigo-100 p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs">
                  <p className="text-gray-700">Yes! LocalWave works on our local network without internet 🙌</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:43 AM</span>
                </div>
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div className="bg-green-50 p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs relative typing-indicator">
                  <p className="text-gray-700">Typing</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">LAN Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Internet Offline</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Best of Both Worlds</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Local-first design with cloud synchronization gives you reliability offline and accessibility online.</p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Feature 1 */}
            <motion.div 
              className="bg-indigo-50 rounded-xl p-6 transition hover:shadow-lg"
              variants={fadeIn}
            >
              <div className="w-12 h-12 mb-4 bg-indigo-200 rounded-lg flex items-center justify-center">
                <Wifi className="h-6 w-6 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Network Messaging</h3>
              <p className="text-gray-600">Exchange messages with nearby devices even without internet connection. Perfect for remote locations or during outages.</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-indigo-50 rounded-xl p-6 transition hover:shadow-lg"
              variants={fadeIn}
            >
              <div className="w-12 h-12 mb-4 bg-indigo-200 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Automatic Sync</h3>
              <p className="text-gray-600">Messages sync automatically to Firebase when internet becomes available, ensuring you never lose important conversations.</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-indigo-50 rounded-xl p-6 transition hover:shadow-lg"
              variants={fadeIn}
            >
              <div className="w-12 h-12 mb-4 bg-indigo-200 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-gray-600">Your messages stay on your local network when offline, providing enhanced privacy and security for sensitive communications.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How LocalWave Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A seamless transition between offline and online messaging.</p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6 md:gap-4"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Step 1 */}
            <motion.div 
              className="relative"
              variants={slideUp}
            >
              <div className="flex md:flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl z-10">1</div>
                <div className="hidden md:block absolute top-6 left-[calc(50%+12px)] h-0.5 w-[calc(50%-12px)] bg-indigo-300"></div>
                <div className="md:mt-4 ml-4 md:ml-0 md:text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Connect to LAN</h3>
                  <p className="text-gray-600">Join the same WiFi or local network as other LocalWave users to establish connectivity.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="relative"
              variants={slideUp}
            >
              <div className="flex md:flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl z-10">2</div>
                <div className="hidden md:block absolute top-6 right-[calc(50%+12px)] h-0.5 w-[calc(50%-12px)] bg-indigo-300"></div>
                <div className="hidden md:block absolute top-6 left-[calc(50%+12px)] h-0.5 w-[calc(50%-12px)] bg-indigo-300"></div>
                <div className="md:mt-4 ml-4 md:ml-0 md:text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Discover Devices</h3>
                  <p className="text-gray-600">LocalWave automatically finds and displays nearby devices that are available for messaging.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="relative"
              variants={slideUp}
            >
              <div className="flex md:flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl z-10">3</div>
                <div className="hidden md:block absolute top-6 right-[calc(50%+12px)] h-0.5 w-[calc(50%-12px)] bg-indigo-300"></div>
                <div className="md:mt-4 ml-4 md:ml-0 md:text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Start Messaging</h3>
                  <p className="text-gray-600">Send and receive messages in real-time through your local network. Messages sync to the cloud when internet is available.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about LocalWave.</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">How does LocalWave work without internet?</h3>
              <p className="text-gray-700">LocalWave uses your device's WiFi or ethernet connection to discover and communicate with other devices on the same local network. Messages are stored locally and transmitted directly between devices without requiring internet access.</p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Do my messages sync when I go back online?</h3>
              <p className="text-gray-700">Yes! When your internet connection is restored, LocalWave automatically syncs your offline messages to our secure cloud storage, ensuring that your conversation history is preserved and accessible from any device.</p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-700">Absolutely. Your offline messages never leave your local network until you're back online. We use industry-standard encryption for all cloud synchronization, and authenticate users through Firebase for added security.</p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">What devices are compatible with LocalWave?</h3>
              <p className="text-gray-700">LocalWave works on any device with a modern web browser and network capabilities, including laptops, desktops, tablets, and smartphones. Simply access the web app on your device while connected to the same network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start messaging offline?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">Join the growing community of LocalWave users and experience the freedom of network-independent communication.</p>
          <button 
            onClick={navigateToDevices}
            className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition font-bold text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">LocalWave</span>
              </div>
              <p className="mb-4">Chat offline. Sync online. Stay connected everywhere.</p>
              <div className="flex space-x-4">
                {/* Social Links */}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} LocalWave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
