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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message & Sync</h3>
                  <p className="text-gray-600">Exchange messages locally and let them automatically sync to the cloud when internet is available.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Illustration */}
          <motion.div 
            className="mt-16 bg-white rounded-2xl shadow-lg p-6 md:p-8"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Transition</h3>
                <p className="text-gray-600 mb-6">LocalWave handles the complex networking so you don't have to. Messages flow seamlessly whether you're online or offline.</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">Local</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">Cloud</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Syncing</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  {/* Offline Devices */}
                  <div className="col-span-1 bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Offline Mode</h4>
                    <div className="space-y-2">
                      <div className="bg-green-50 p-2 rounded flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs">Laptop</span>
                      </div>
                      <div className="bg-green-50 p-2 rounded flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs">Phone</span>
                      </div>
                      <div className="bg-gray-100 p-2 rounded flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        <span className="text-xs">Tablet</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Exchange */}
                  <div className="col-span-2 bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Local Messaging</h4>
                    <div className="space-y-2">
                      <div className="bg-green-50 p-2 rounded-lg text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Laptop</span>
                          <span className="text-gray-500">10:45 AM</span>
                        </div>
                        <p>Hey, can you see this message?</p>
                        <div className="flex items-center justify-end mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-lg text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Phone</span>
                          <span className="text-gray-500">10:46 AM</span>
                        </div>
                        <p>Yes! Working without internet!</p>
                        <div className="flex items-center justify-end mt-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Bar */}
                <div className="mt-4 bg-white p-2 rounded-lg shadow-sm flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 text-green-500 mr-1" />
                      <span>LAN Connected</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path>
                        <path d="M18 2v6h6"></path>
                        <path d="M18 8 8 18"></path>
                        <path d="m8 8 10 10"></path>
                      </svg>
                      <span>Internet Offline</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 2a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H3a2 2 0 0 1-2-2V6a4 4 0 0 1 4-4Zm0 0H7"></path>
                      <path d="M11 14h4"></path>
                      <path d="M11 18h4"></path>
                      <path d="M6 10h.01"></path>
                      <path d="M6 14h.01"></path>
                      <path d="M6 18h.01"></path>
                    </svg>
                    <span>2 Messages Pending Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="bg-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about LocalWave</p>
          </div>
          
          <motion.div 
            className="space-y-6"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* FAQ 1 */}
            <motion.div 
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">How does LocalWave work without internet?</h3>
              <p className="text-gray-600">LocalWave uses your device's local network capabilities to discover and communicate with other devices on the same network. It leverages WebRTC, mDNS, and other local communication protocols to establish direct connections.</p>
            </motion.div>
            
            {/* FAQ 2 */}
            <motion.div 
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Is my data secure when using LocalWave?</h3>
              <p className="text-gray-600">Yes! Messages sent while offline stay within your local network. When syncing to Firebase, all data is encrypted in transit and at rest, following industry best practices for security.</p>
            </motion.div>
            
            {/* FAQ 3 */}
            <motion.div 
              className="bg-gray-50 rounded-xl p-6"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">What happens if I lose connection during a conversation?</h3>
              <p className="text-gray-600">LocalWave automatically handles connection changes. If you lose internet but maintain LAN connectivity, you'll continue messaging without interruption. All messages are stored locally and will sync when internet is restored.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to stay connected, no matter what?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">Join thousands of users who rely on LocalWave for reliable communication in any network condition.</p>
          <button 
            onClick={navigateToDevices}
            className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition font-bold text-lg">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">LocalWave</span>
              </div>
              <p className="text-gray-400">Connect locally. Communicate instantly.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">© 2024 LocalWave. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .typing-indicator::after {
          content: '...';
          animation: typing 1.5s infinite;
        }
        
        @keyframes typing {
          0%, 100% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
        }
        
        .message-enter {
          animation: message-slide-in 0.3s ease-out forwards;
        }
        
        @keyframes message-slide-in {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default LandingPage;
