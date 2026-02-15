
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-transparent overflow-hidden perspective-container"
    >
      {/* Stronger overlay for text pop against the complex gradient */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 text-center px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotateX: -45 }}
          animate={{ 
            opacity: [0, 1, 1],
            scale: [0.7, 1.1, 1],
            rotateX: [ -45, 0, 0],
          }}
          transition={{ 
            duration: 8,
            ease: "easeOut",
          }}
          className="text-5xl md:text-7xl font-orbitron font-black text-white tracking-[0.2em] leading-tight uppercase text-glow"
        >
          BIENVENUE AU SIGNAL
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, delay: 0.5 }}
          className="h-[2px] mt-8 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80"
        />
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 2 }}
          className="mt-6 text-white font-rajdhani tracking-[0.5em] text-xs uppercase"
        >
          Calibration du Quantum Core...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
