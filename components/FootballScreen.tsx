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
  const [shake, setShake] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

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

  const handleBack = () => {
    if (result || loading) {
        setConfirmDialog({
            isOpen: true,
            message: "Quitter l'analyse ? Les résultats actuels seront perdus.",
            onConfirm: () => { setConfirmDialog(null); onBack(); }
        });
    } else {
        onBack();
    }
  };

  const runFootballAnalysis = async () => {
    if (!isFormValid) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setStatusMessage("Veuillez charger les deux images requises.");
        return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const prompt = `
        MOTEUR VICK V4 - ANALYSEUR VIRTUEL.
        Analysez les images pour extraire les matchs et prédire.
        Renvoyez uniquement un JSON valide avec simpleResults, multiples (10), highOdds.
      `;

      // Préparation du FormData pour l'API backend
      const formData = new FormData();
      const historyBlob = await (await fetch(historyImage!)).blob();
      const matchesBlob = await (await fetch(matchesImage!)).blob();
      
      formData.append('image', matchesBlob, 'matches.png'); // On envoie l'image principale
      formData.append('prompt', prompt);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur serveur Vercel");

      const data = await response.json();
      
      if (data.status === "ok") {
          // On tente de parser le texte de l'IA en JSON si nécessaire
          try {
            const cleanJson = JSON.parse(data.analyser.replace(/```json|```/g, ''));
            setResult(cleanJson);
          } catch {
            setStatusMessage("L'IA a produit un format texte. Relancez.");
          }
      } else {
          setStatusMessage(data.analyser || "Erreur lors de l'analyse.");
      }
      
      if ("vibrate" in navigator) navigator.vibrate(20);
    } catch (err: any) {
      setStatusMessage("Échec : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden flex flex-col font-rajdhani">
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center space-x-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack} className="p-3 glass rounded-2xl text-white shadow-lg border border-white/20">
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">VIRTUEL FOOT</h2>
            <span className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase">V4 Analysis</span>
          </div>
        </div>
        <Info size={20} className="text-white/30" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        {!result && (
            <div className="glass p-6 rounded-[32px] border-l-4 border-l-green-600 space-y-6 bg-black/60 shadow-2xl">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Sources Indissociables</span>
                {isFormValid && <CheckCircle2 size={16} className="text-green-500 animate-bounce" />}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <motion.button 
                whileTap={{ scale: 0.95 }}
                animate={shake && !historyImage ? { x: [0, -5, 5, -5, 5, 0], borderColor: "#ef4444" } : {}}
                onClick={() => handleUploadClick('history')}
                className={`p-5 rounded-3xl flex flex-col items-center space-y-3 transition-all duration-300 border
                    ${historyImage ? 'bg-green-900/40 border-green-500/40' : 'bg-black/40 border-white/5'}`}
                >
                <TrendingUp size={20} className={historyImage ? 'text-green-500' : 'text-white/20'} />
                <span className="text-[9px] font-bold tracking-widest uppercase text-center text-white/30">
                    {historyImage ? 'CHARGÉ' : 'HISTORIQUE'}
                </span>
                </motion.button>

                <motion.button 
                whileTap={{ scale: 0.95 }}
                animate={shake && !matchesImage ? { x: [0, -5, 5, -5, 5, 0], borderColor: "#ef4444" } : {}}
                onClick={() => handleUploadClick('matches')}
                className={`p-5 rounded-3xl flex flex-col items-center space-y-3 transition-all duration-300 border
                    ${matchesImage ? 'bg-green-900/40 border-green-500/40' : 'bg-black/40 border-white/5'}`}
                >
                <Target size={20} className={matchesImage ? 'text-green-500' : 'text-white/20'} />
                <span className="text-[9px] font-bold tracking-widest uppercase text-center text-white/30">
                    {matchesImage ? 'CHARGÉ' : 'MATCH CIBLE'}
                </span>
                </motion.button>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

            {statusMessage && (
                <div className="text-center">
                    <span className="text-red-400 text-[10px] font-bold tracking-widest uppercase bg-red-900/20 px-4 py-2 rounded-full border border-red-500/20">
                        {statusMessage}
                    </span>
                </div>
            )}

            <motion.button
            onClick={runFootballAnalysis}
            disabled={loading}
            className="w-full py-5 rounded-2xl font-orbitron font-bold text-sm tracking-[0.3em] shadow-xl transition-all duration-500 btn-premium text-white"
            >
            {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
            </motion.button>
            </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
                <div className="flex justify-end">
                    <button onClick={() => setResult(null)} className="flex items-center space-x-2 text-[10px] font-bold text-white/50 uppercase">
                        <RefreshCw size={12} /> <span>Relancer</span>
                    </button>
                </div>

              <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase px-2 border-b border-white/10 pb-2">RÉSULTATS</h3>
                  <div className="grid gap-2">
                      {result.simpleResults.map((item, idx) => (
                          <div key={idx} className="glass p-3 rounded-xl border border-white/5 flex justify-between items-center bg-black/40">
                              <span className="text-[10px] font-bold text-white/70 uppercase truncate">{item.match}</span>
                              <span className="font-orbitron font-bold text-green-400 text-xs">{item.prediction}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase px-2 border-b border-white/10 pb-2">MULTIPLES</h3>
                  {result.multiples.map((multiple) => (
                      <div key={multiple.id} className="glass p-4 rounded-xl border border-white/10 bg-black/20">
                          <div className="space-y-2">
                              {multiple.selections.map((sel, sIdx) => (
                                  <p key={sIdx} className="text-[10px] font-bold text-white/80 uppercase">• {sel}</p>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
            {confirmDialog && confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                    <div className="glass p-6 rounded-[32px] border border-white/10 shadow-2xl w-full max-w-sm bg-black/90">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <AlertTriangle className="text-red-500" size={24} />
                            <p className="text-white/60 text-xs font-bold tracking-wider uppercase leading-relaxed">{confirmDialog.message}</p>
                            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                <button onClick={() => setConfirmDialog(null)} className="py-3 rounded-xl bg-white/5 text-white/60 font-bold text-xs uppercase">Annuler</button>
                                <button onClick={confirmDialog.onConfirm} className="py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase">Confirmer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FootballScreen;