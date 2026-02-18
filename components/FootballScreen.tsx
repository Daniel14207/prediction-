
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Target, AlertTriangle, TrendingUp, Info, RefreshCw, CheckCircle2, Layers, Star, List, Zap } from 'lucide-react';

interface FootballAnalysisResult {
  simpleResults: { match: string; prediction: string }[];
  multiples: { id: number; selections: string[] }[];
  highOdds: { id: number; label: string; odd: string }[];
}

const FootballScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [result, setResult] = useState<FootballAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyImage, setHistoryImage] = useState<string | null>(null);
  const [matchesImage, setMatchesImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<'history' | 'matches' | null>(null);

  const isFormValid = historyImage !== null && matchesImage !== null;

  const handleUploadClick = (type: 'history' | 'matches') => {
    setActiveUploadType(type);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadType) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (activeUploadType === 'history') setHistoryImage(base64);
        else setMatchesImage(base64);
        setStatusMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runFootballAnalysis = async () => {
    if (!isFormValid) {
        setStatusMessage("Veuillez charger les deux images requises.");
        return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const prompt = `
        ACTION: MOTEUR VICK V4 - ANALYSEUR VIRTUEL FOOTBALL.
        CONTEXTE: Capture d'écran de matchs virtuels.
        MISSION: Extraire les matchs et fournir des prédictions (Score Exact, Vainqueur).
        FORMAT: Renvoyez UNIQUEMENT un objet JSON valide. Pas de texte avant ou après.
        JSON STRUCTURE: {
          "simpleResults": [{"match": "Equipe A vs Equipe B", "prediction": "Score: 2-1"}],
          "multiples": [{"id": 1, "selections": ["Match 1: Over 2.5", "Match 2: 1X"]}],
          "highOdds": [{"id": 1, "label": "Grosse Cote", "odd": "14.50"}]
        }
      `;

      const formData = new FormData();
      const matchesBlob = await (await fetch(matchesImage!)).blob();
      formData.append('image', matchesBlob, 'matches.png');
      formData.append('prompt', prompt);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.status === "ok") {
          const analyzer = data.analyser;
          if (analyzer.resultats && !Array.isArray(analyzer.resultats[0])) {
               // On essaye de trouver les champs requis dans le premier element si resultats est un wrap
               const res = analyzer.resultats[0] || analyzer.resultats;
               setResult(res.simpleResults ? res : { simpleResults: analyzer.resultats, multiples: [], highOdds: [] });
          } else {
               setResult({ simpleResults: [], multiples: [], highOdds: [] });
          }
      } else {
          setStatusMessage(data.analyser?.message || "ERREUR SERVEUR.");
      }
      
    } catch (err: any) {
      setStatusMessage("ERREUR RÉSEAU.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden flex flex-col font-rajdhani">
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center space-x-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-3 glass rounded-2xl text-white shadow-lg border border-white/20">
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">VIRTUEL FOOT</h2>
            <span className="text-[10px] font-bold text-green-500 tracking-[0.3em] uppercase">V4 Prediction Mode</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        {!result ? (
            <div className="glass p-6 rounded-[32px] border-l-4 border-l-green-600 space-y-6 bg-black/60 shadow-2xl">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Sources Indissociables</span>
                  {isFormValid && <CheckCircle2 size={16} className="text-green-500 animate-bounce" />}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => handleUploadClick('history')} 
                    className={`p-5 rounded-3xl border flex flex-col items-center space-y-3 transition-all ${historyImage ? 'bg-green-900/40 border-green-500/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <TrendingUp size={20} className={historyImage ? 'text-green-500' : 'text-white/20'} />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-center text-white/30">{historyImage ? 'HISTORIQUE CHARGÉ' : 'HISTORIQUE'}</span>
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => handleUploadClick('matches')} 
                    className={`p-5 rounded-3xl border flex flex-col items-center space-y-3 transition-all ${matchesImage ? 'bg-green-900/40 border-green-500/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <Target size={20} className={matchesImage ? 'text-green-500' : 'text-white/20'} />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-center text-white/30">{matchesImage ? 'MATCHES CHARGÉS' : 'MATCH CIBLE'}</span>
                  </motion.button>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

              <div className="space-y-4">
                {statusMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="px-4 py-3 bg-red-900/60 border border-red-500/50 rounded-2xl text-center"
                    >
                        <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">{statusMessage}</span>
                    </motion.div>
                )}

                <motion.button 
                    onClick={runFootballAnalysis} 
                    disabled={loading} 
                    className={`w-full py-6 rounded-2xl font-orbitron font-bold text-sm tracking-[0.4em] text-white shadow-2xl transition-all
                    ${loading ? 'opacity-50 cursor-wait bg-gray-800' : 'btn-premium'}`}
                >
                  {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
                </motion.button>
              </div>
            </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">RÉSULTATS DÉTECTÉS</h3>
                <button onClick={() => setResult(null)} className="flex items-center space-x-2 text-[10px] font-bold text-green-500 uppercase">
                    <RefreshCw size={12} /> <span>Nouveau Scan</span>
                </button>
            </div>
            
            <div className="grid gap-3">
                {result.simpleResults?.map((item, idx) => (
                    <div key={idx} className="glass p-4 rounded-2xl border border-white/5 flex justify-between items-center bg-black/40">
                        <span className="text-xs font-bold text-white uppercase">{item.match}</span>
                        <span className="font-orbitron font-black text-green-400 text-sm tracking-widest">{item.prediction}</span>
                    </div>
                ))}
            </div>

            {result.multiples?.length > 0 && (
              <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase px-2">MULTIPLES V4</h3>
                  {result.multiples.map((m) => (
                      <div key={m.id} className="glass p-4 rounded-2xl border border-white/10 bg-green-950/10">
                          {m.selections.map((sel, sIdx) => (
                              <p key={sIdx} className="text-[11px] font-bold text-white/80 uppercase mb-1 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" /> {sel}
                              </p>
                          ))}
                      </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FootballScreen;
