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
            message: "Quitter l'analyse ? Les données seront perdues.",
            onConfirm: () => { setConfirmDialog(null); onBack(); }
        });
    } else { onBack(); }
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

      const formData = new FormData();
      const historyBlob = await (await fetch(historyImage!)).blob();
      const matchesBlob = await (await fetch(matchesImage!)).blob();
      
      formData.append('image', matchesBlob, 'matches.png');
      formData.append('prompt', prompt);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.status === "ok") {
          try {
            const cleanJson = JSON.parse(data.analyser.replace(/```json|```/g, ''));
            setResult(cleanJson);
          } catch {
            setStatusMessage("ERREUR DE LECTURE IA. VEUILLEZ RÉESSAYER.");
          }
      } else {
          setStatusMessage(data.analyser || "ERREUR D'ANALYSE.");
      }
      
      if ("vibrate" in navigator) navigator.vibrate(20);
    } catch (err: any) {
      setStatusMessage("ERREUR SERVEUR. VÉRIFIEZ VOTRE CONNEXION.");
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
            <span className="text-[10px] font-bold text-green-500 tracking-[0.3em] uppercase">V4 Prediction Mode</span>
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
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUploadClick('history')} className={`p-5 rounded-3xl flex flex-col items-center space-y-3 border ${historyImage ? 'bg-green-900/40 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                    <TrendingUp size={20} className={historyImage ? 'text-green-500' : 'text-white/20'} />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">{historyImage ? 'CHARGÉ' : 'HISTORIQUE'}</span>
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUploadClick('matches')} className={`p-5 rounded-3xl flex flex-col items-center space-y-3 border ${matchesImage ? 'bg-green-900/40 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                    <Target size={20} className={matchesImage ? 'text-green-500' : 'text-white/20'} />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">{matchesImage ? 'CHARGÉ' : 'CIBLE'}</span>
                  </motion.button>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

              <div className="space-y-4">
                {statusMessage && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-3 bg-red-900/40 border border-red-500/50 rounded-2xl text-center">
                        <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">{statusMessage}</span>
                    </motion.div>
                )}

                <motion.button onClick={runFootballAnalysis} disabled={loading} className="w-full py-6 rounded-2xl font-orbitron font-bold text-sm tracking-[0.4em] btn-premium text-white shadow-2xl">
                  {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
                </motion.button>
              </div>
            </div>
        )}

        <AnimatePresence>
          {result && (
            <div className="space-y-6 pb-12">
                <button onClick={() => setResult(null)} className="ml-auto flex items-center space-x-2 text-[10px] font-bold text-white/50 uppercase"><RefreshCw size={12} /><span>Relancer</span></button>
                <div className="grid gap-2">
                    {result.simpleResults.map((item, idx) => (
                        <div key={idx} className="glass p-3 rounded-xl border border-white/5 flex justify-between items-center bg-black/40">
                            <span className="text-[10px] font-bold text-white/70 uppercase truncate">{item.match}</span>
                            <span className="font-orbitron font-bold text-green-400 text-xs">{item.prediction}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FootballScreen;