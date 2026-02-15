
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, PhoneCall } from 'lucide-react';

interface ActivationScreenProps {
  onActivate: () => void;
}

const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivate }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivating(true);
    setError(false);

    setTimeout(() => {
      // Secret internal code: 400v4
      if (code.toLowerCase() === '400v4') {
        onActivate();
      } else {
        setError(true);
        setIsActivating(false);
      }
    }, 1000);
  };

  const handleCallAdmin = () => {
    window.location.href = "tel:+261342594678";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-transparent overflow-hidden font-rajdhani"
    >
      <div className="w-full max-w-sm glass rounded-[40px] p-8 shadow-2xl border border-white/20 relative z-10">
        <header className="text-center space-y-4 mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-red-600/20 to-transparent rounded-full border border-red-500/30 mb-2">
            <ShieldAlert size={40} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
          <h2 className="text-3xl font-orbitron font-black text-white tracking-[0.2em] uppercase text-glow">
            ACTIVATION
          </h2>
          <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase">
            Veuillez entrer le code unique
          </p>
        </header>

        <form onSubmit={handleActivation} className="space-y-8">
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full bg-black/40 py-6 px-6 rounded-2xl text-white text-center text-2xl tracking-[1em] focus:outline-none border transition-all duration-300 shadow-inner
                ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-green-500/50'}`}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30">
              <KeyRound size={20} />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ x: -10 }} 
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              className="text-red-400 text-center text-[10px] font-black tracking-[0.4em] uppercase bg-red-900/20 py-2 rounded-lg"
            >
              Code invalide
            </motion.p>
          )}

          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isActivating || !code}
              className={`w-full py-5 rounded-2xl font-orbitron font-bold text-sm tracking-[0.4em] transition-all duration-500 btn-premium text-white
                ${!code && 'opacity-50 grayscale'}`}
            >
              {isActivating ? 'VALIDATION...' : 'ACTIVER'}
            </motion.button>

            <div className="text-center">
              <button 
                type="button"
                onClick={handleCallAdmin}
                className="group inline-flex flex-col items-center space-y-2 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">Contact Admin</span>
                <div className="flex items-center space-x-2 text-white bg-green-900/40 px-3 py-1 rounded-full border border-green-500/30">
                  <PhoneCall size={12} />
                  <span className="text-xs font-bold tracking-widest">+261 34 25 946 78</span>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ActivationScreen;
