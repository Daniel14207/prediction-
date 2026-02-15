
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Disc, RefreshCw, Zap, Binary, AlertTriangle, Crosshair } from 'lucide-react';

interface RouletteNumber {
    n: number;
    c: 'red' | 'black' | 'green';
    sector: string; // Voisins, Tiers, Orphelins
    special: string; // 0-0, 4G+, 88 tags
    dozen: string;
    column: string;
}

const RouletteScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [numbers, setNumbers] = useState<RouletteNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

  const handleBack = () => {
    if (numbers.length > 0 || loading) {
        setConfirmDialog({
            isOpen: true,
            message: "Quitter le module ? L'historique des tirages sera perdu.",
            onConfirm: () => {
                setConfirmDialog(null);
                onBack();
            }
        });
    } else {
        onBack();
    }
  };

  const handleGenerate = () => {
      if (numbers.length > 0) {
          setConfirmDialog({
              isOpen: true,
              message: "Générer une nouvelle série ? La série actuelle sera effacée.",
              onConfirm: () => {
                  setConfirmDialog(null);
                  generateRouletteCycle();
              }
          });
      } else {
          generateRouletteCycle();
      }
  };

  const generateRouletteCycle = () => {
    setLoading(true);
    setAnalysisStep(1);
    
    // Simulate steps
    setTimeout(() => setAnalysisStep(2), 500); // Sector Analysis
    setTimeout(() => setAnalysisStep(3), 1000); // Generating

    setTimeout(() => {
      const red = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const voisins = [22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25];
      const tiers = [27,13,36,11,30,8,23,10,5,24,16,33];
      
      const results: RouletteNumber[] = Array.from({ length: 10 }).map(() => {
        const n = Math.floor(Math.random() * 37);
        const c = n === 0 ? 'green' : red.includes(n) ? 'red' : 'black';
        
        // Sector Logic
        let sector = 'Orphelins';
        if (voisins.includes(n)) sector = 'Voisins';
        if (tiers.includes(n)) sector = 'Tiers';
        if (n === 0) sector = 'Jeu 0';

        // Dozen Logic
        let dozen = n === 0 ? '-' : n <= 12 ? '1st 12' : n <= 24 ? '2nd 12' : '3rd 12';
        
        // Column Logic
        let column = n === 0 ? '-' : n % 3 === 1 ? 'Col 1' : n % 3 === 2 ? 'Col 2' : 'Col 3';

        // Special Tags Logic (Simulating Strategies)
        let special = '';
        if (n === 0 || [26, 32, 15].includes(n)) special = '0-0';
        else if (n.toString().includes('8')) special = '88';
        else if (n === 4 || n === 14 || n === 24 || n === 34) special = '4G+';
        else if (n % 2 !== 0) special = 'IMPAIR';
        else special = 'PAIR';

        return { n, c, sector, special, dozen, column };
      });

      setNumbers(results);
      setLoading(false);
      setAnalysisStep(0);
      setRound(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden flex flex-col font-rajdhani">
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center space-x-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack} className="p-3 glass rounded-2xl text-white shadow-lg border border-white/20">
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow uppercase">Roulette FR</h2>
            <span className="text-[10px] font-bold text-white/50 tracking-[0.4em] uppercase">Séquence #{round}</span>
          </div>
        </div>
        <Disc size={20} className="text-white/30" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-8 pb-24">
        
        {/* Status Circle */}
        <div className="flex justify-center py-6">
          <motion.div 
            animate={{ rotate: loading ? 720 : 0 }}
            transition={{ repeat: Infinity, duration: loading ? 2 : 0, ease: "linear" }}
            className={`w-40 h-40 rounded-full glass border-4 flex items-center justify-center relative p-1 shadow-2xl bg-black/40 transition-colors duration-500
                ${loading ? 'border-yellow-500/50 shadow-[0_0_30px_#CA8A04]' : 'border-white/5'}`}
          >
            <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${loading ? 'border-yellow-500/30' : 'border-white/10'}`} />
            <div className="flex flex-col items-center justify-center">
               {loading ? (
                   <>
                     <Binary size={24} className="text-yellow-500 animate-pulse mb-2" />
                     <span className="text-[9px] font-black text-yellow-400 tracking-widest uppercase">
                        {analysisStep === 1 ? 'SECTEURS' : analysisStep === 2 ? 'VOISINS' : 'CALCUL...'}
                     </span>
                   </>
               ) : (
                   <>
                     <Crosshair size={24} className="text-white/20 mb-2" />
                     <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">PRÊT</span>
                   </>
               )}
            </div>
          </motion.div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-5 btn-premium rounded-3xl flex items-center justify-center space-x-4 shadow-xl text-white border border-yellow-500/30"
        >
          {loading ? <RefreshCw className="animate-spin text-white" /> : <RefreshCw className="text-white" />}
          <span className="font-orbitron font-bold text-sm tracking-[0.3em] uppercase">
             {loading ? 'ANALYSE...' : 'GÉNÉRER 10 NUMÉROS'}
          </span>
        </motion.button>

        {/* Results List */}
        <div className="space-y-3">
          {numbers.map((num, i) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className={`p-4 rounded-[20px] glass flex items-center justify-between border-l-4 bg-black/40 ${
                num.c === 'red' ? 'border-red-600' : num.c === 'black' ? 'border-zinc-500' : 'border-green-600'
              }`}
            >
              <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-orbitron font-black text-xl text-white shadow-inner ${
                      num.c === 'red' ? 'bg-red-600' : num.c === 'black' ? 'bg-zinc-800' : 'bg-green-600'
                  }`}>
                      {num.n}
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{num.sector}</span>
                      <div className="flex space-x-2 mt-1">
                          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/60 font-bold">{num.dozen}</span>
                          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/60 font-bold">{num.column}</span>
                      </div>
                  </div>
              </div>
              
              <div className="text-right">
                  <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded border ${
                      num.special === '0-0' || num.special === '88' ? 'border-yellow-500 text-yellow-500 bg-yellow-900/10' : 'border-white/10 text-white/30'
                  }`}>
                      {num.special}
                  </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
            {confirmDialog && confirmDialog.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass p-6 rounded-[32px] border border-white/10 shadow-2xl w-full max-w-sm bg-black/90"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-widest text-glow">Confirmation</h3>
                                <p className="text-white/60 text-xs font-bold tracking-wider mt-2 uppercase leading-relaxed">{confirmDialog.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                <button
                                    onClick={() => setConfirmDialog(null)}
                                    className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="py-3 rounded-xl bg-red-600 border border-red-400 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RouletteScreen;
