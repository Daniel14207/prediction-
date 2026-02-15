import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Plane, Disc, Trophy, Circle } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Stage 0: Dark screen (initial state) -> 1s delay controlled by setTimeout
      await new Promise(r => setTimeout(r, 1000));
      setStage(1); // V appears

      await new Promise(r => setTimeout(r, 1000));
      setStage(2); // Icons appear

      await new Promise(r => setTimeout(r, 1000));
      setStage(3); // Icons align below
    };
    sequence();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden perspective-container"
    >
      <div className="relative flex flex-col items-center justify-center">
        
        {/* The V */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotateY: 180 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                y: stage === 3 ? -40 : 0
              }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="relative z-20"
            >
              <h1 className="text-9xl font-orbitron font-black text-white" 
                  style={{ 
                    textShadow: '0 0 10px #D10000, 0 0 20px #008A3D, 0 0 40px white' 
                  }}>
                V
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbiting Icons */}
        <AnimatePresence>
          {stage >= 2 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              
              {/* Soccer Ball */}
              <motion.div
                initial={{ x: -100, y: -100, opacity: 0, scale: 0 }}
                animate={stage === 3 
                  ? { x: -90, y: 60, opacity: 1, scale: 1 } 
                  : { x: -120, y: -80, opacity: 1, scale: 1.2, rotate: 360 }
                }
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_white]">
                  <Trophy size={24} className="text-black" />
                </div>
              </motion.div>

              {/* Casino Black Ball */}
              <motion.div
                initial={{ x: 100, y: -100, opacity: 0, scale: 0 }}
                animate={stage === 3 
                  ? { x: -30, y: 60, opacity: 1, scale: 1 } 
                  : { x: 120, y: -80, opacity: 1, scale: 1.2, rotate: -360 }
                }
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                className="absolute"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <span className="text-white font-black text-xs">8</span>
                </div>
              </motion.div>

              {/* Roulette */}
              <motion.div
                initial={{ x: -100, y: 100, opacity: 0, scale: 0 }}
                animate={stage === 3 
                  ? { x: 30, y: 60, opacity: 1, scale: 1 } 
                  : { x: -120, y: 80, opacity: 1, scale: 1.2, rotate: 720 }
                }
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                className="absolute"
              >
                 <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-900 rounded-full flex items-center justify-center shadow-[0_0_15px_#008A3D]">
                  <Disc size={24} className="text-white animate-spin-slow" />
                </div>
              </motion.div>

              {/* Plane */}
              <motion.div
                initial={{ x: 100, y: 100, opacity: 0, scale: 0 }}
                animate={stage === 3 
                  ? { x: 90, y: 60, opacity: 1, scale: 1 } 
                  : { x: 120, opacity: 1, scale: 1.2, y: [80, 60, 80] }
                }
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                className="absolute"
              >
                 <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center shadow-[0_0_15px_#D10000]">
                  <Plane size={24} className="text-white" />
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SplashScreen;