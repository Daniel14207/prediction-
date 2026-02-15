
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen } from './types';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import ActivationScreen from './components/ActivationScreen';
import WelcomeScreen from './components/WelcomeScreen';
import MainMenu from './components/MainMenu';
import AviatorScreen from './components/AviatorScreen';
import FootballScreen from './components/FootballScreen';
import RouletteScreen from './components/RouletteScreen';
import ChatScreen from './components/ChatScreen';
import ScannerScreen from './components/ScannerScreen';
import VeoScreen from './components/VeoScreen';
import ImageEditorScreen from './components/ImageEditorScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);

  useEffect(() => {
    if (currentScreen === Screen.SPLASH) {
      const timer = setTimeout(() => {
        setCurrentScreen(Screen.LOGIN);
      }, 4000); // 4 seconds total for splash
      return () => clearTimeout(timer);
    }

    if (currentScreen === Screen.WELCOME) {
      const timer = setTimeout(() => {
        setCurrentScreen(Screen.MAIN_MENU);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleLogin = () => {
    setCurrentScreen(Screen.ACTIVATION);
  };

  const handleActivation = () => {
    setCurrentScreen(Screen.WELCOME);
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-premium-gradient select-none">
      {/* Overlay to ensure text readability on brighter bands if needed. Increased to 20% for better contrast. */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <AnimatePresence mode="wait">
        {currentScreen === Screen.SPLASH && <SplashScreen key="splash" />}
        {currentScreen === Screen.LOGIN && <LoginScreen key="login" onLogin={handleLogin} />}
        {currentScreen === Screen.ACTIVATION && <ActivationScreen key="activation" onActivate={handleActivation} />}
        {currentScreen === Screen.WELCOME && <WelcomeScreen key="welcome" />}
        {currentScreen === Screen.MAIN_MENU && <MainMenu key="main" onNavigate={navigateTo} />}
        {currentScreen === Screen.AVIATOR && <AviatorScreen key="aviator" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        {currentScreen === Screen.FOOTBALL && <FootballScreen key="football" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        {currentScreen === Screen.ROULETTE && <RouletteScreen key="roulette" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        
        {/* New AI Screens */}
        {currentScreen === Screen.CHAT && <ChatScreen key="chat" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        {currentScreen === Screen.SCANNER && <ScannerScreen key="scanner" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        {currentScreen === Screen.VEO && <VeoScreen key="veo" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
        {currentScreen === Screen.EDITOR && <ImageEditorScreen key="editor" onBack={() => navigateTo(Screen.MAIN_MENU)} />}
      </AnimatePresence>

      {currentScreen !== Screen.SPLASH && currentScreen !== Screen.LOGIN && currentScreen !== Screen.ACTIVATION && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <motion.span 
            animate={{ 
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-white text-[10px] font-rajdhani tracking-[0.5em] uppercase italic text-glow"
          >
            by Pronostic Vital
          </motion.span>
        </div>
      )}
    </div>
  );
};

export default App;
