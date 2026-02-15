
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, EyeOff, Lock, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    setTimeout(() => {
      if (user.toUpperCase() === 'VITAL' && pass.toUpperCase() === 'PRONOSTIC') {
        onLogin();
      } else {
        setIsSubmitting(false);
        setError(true);
      }
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-transparent overflow-hidden font-rajdhani"
    >
      <div className="w-full max-w-sm relative z-10 glass rounded-[40px] p-8 shadow-2xl border border-white/20">
        <header className="text-center space-y-4 mb-10">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-orbitron font-black text-white text-glow tracking-tighter"
          >
            VICK V4
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-900 shadow-lg"
          >
            <p className="text-white font-bold tracking-[0.3em] uppercase text-[10px]">
              VITAL PRONO
            </p>
          </motion.div>
        </header>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="space-y-8"
        >
          <div className="space-y-5">
            <div className="relative group">
              <input
                type="password"
                placeholder="VITAL"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 py-5 px-6 rounded-2xl text-white placeholder:text-white/20 text-center tracking-[1em] focus:outline-none focus:border-red-500/50 transition-all text-xl backdrop-blur-md shadow-inner"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40">
                <User size={18} />
              </div>
            </div>

            <div className="relative group">
              <input
                type="password"
                placeholder="PRONOSTIC"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 py-5 px-6 rounded-2xl text-white placeholder:text-white/20 text-center tracking-[1em] focus:outline-none focus:border-green-500/50 transition-all text-xl backdrop-blur-md shadow-inner"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: [0, -5, 5, 0] }} 
              className="flex items-center justify-center space-x-2 text-red-400"
            >
               <span className="text-xs font-bold tracking-widest uppercase bg-red-900/30 px-3 py-1 rounded-full border border-red-500/30">Accès Refusé</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-orbitron font-bold text-lg tracking-[0.2em] flex items-center justify-center space-x-3 btn-premium text-white`}
          >
            {isSubmitting ? (
              <div className="flex space-x-1">
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            ) : (
              <span className="flex items-center space-x-2">
                <ShieldCheck size={20} />
                <span>CONNECTER</span>
              </span>
            )}
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default LoginScreen;
