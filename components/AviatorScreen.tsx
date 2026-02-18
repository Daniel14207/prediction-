
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, RefreshCw, Zap, Settings, CheckCircle2, Copy, Check, AlertTriangle } from 'lucide-react';

interface AviatorPrediction {
  time: string;
  signal: string;
}

const AviatorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [signals, setSignals] = useState<AviatorPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCote, setLastCote] = useState('');
  const [lastTime, setLastTime] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTimeValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(lastTime);
  const isCoteValid = lastCote.trim().length > 0 && !isNaN(parseFloat(lastCote));
  const isFormValid = image !== null && isCoteValid && isTimeValid;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
        setStatusMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runAnalysis = async () => {
    if (!isFormValid) {
        setStatusMessage("Complétez tous les champs et l'image.");
        return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const promptText = `
        ACTION: MOTEUR AVIATOR V4 - ANALYSEUR PRÉDICTIF.
        DONNÉES: Dernière cote de ${lastCote} à ${lastTime}.
        MISSION: Analysez l'historique visuel et générez exactement 50 prédictions de signaux futurs.
        FORMAT: Renvoyez uniquement un JSON avec cette structure: {"predictions": [{"time": "HH:MM", "signal": "Cote Cible / Probabilité"}]}.
        Pas de texte introductif.
      `;

      const formData = new FormData();
      const imageBlob = await (await fetch(image!)).blob();
      formData.append('image', imageBlob, 'aviator.png');
      formData.append('prompt', promptText);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.status === "ok") {
          // Nouveau format: data.analyser.resultats
          if (Array.isArray(data.analyser.resultats)) {
              setSignals(data.analyser.resultats);
          } else if (typeof data.analyser.raw_text === 'string') {
              // Fallback compatibilité ancienne logique
              try {
                  const cleanText = data.analyser.raw_text.replace(/```json/g, '').replace(/```/g, '').trim();
                  const parsed = JSON.parse(cleanText);
                  setSignals(parsed.predictions || []);
              } catch (e) {
                  setStatusMessage("FORMAT IA INVALIDE.");
              }
          }
      } else {
        setStatusMessage(data.analyser?.message || "ERREUR D'ANALYSE SERVEUR.");
      }
      
    } catch (error) {
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
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">AVIATOR STUDIO</h2>
            <span className="text-[10px] font-bold text-red-500 tracking-[0.3em] uppercase">V4 Engine Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        {signals.length === 0 ? (
          <div className="space-y-6">
            <div className="glass p-6 rounded-[32px] border-l-4 border-l-red-600 bg-black/60 shadow-2xl space-y-6">
              <button onClick={() => fileInputRef.current?.click()} className={`w-full p-8 rounded-3xl border-2 border-dashed flex flex-col items-center space-y-3 transition-all ${image ? 'border-red-500/50 bg-red-900/10' : 'border-white/10 bg-white/5'}`}>
                   <Upload size={32} className={image ? 'text-red-500' : 'text-white/20'} />
                   <span className="text-[10px] font-black tracking-widest uppercase text-white/40">{image ? 'IMAGE ANALYSÉE PRÊTE' : 'UPLOADER HISTORIQUE'}</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Cote" value={lastCote} onChange={e=>setLastCote(e.target.value)} className="bg-black/40 border border-white/10 py-5 rounded-2xl text-white text-center font-orbitron text-sm focus:border-red-500/50 outline-none" />
                <input type="time" value={lastTime} onChange={e=>setLastTime(e.target.value)} className="bg-black/40 border border-white/10 py-5 rounded-2xl text-white text-center font-orbitron text-sm focus:border-red-500/50 outline-none" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>

            {statusMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-3 bg-red-900/60 border border-red-500/50 rounded-2xl text-center">
                    <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">{statusMessage}</span>
                </motion.div>
            )}

            <motion.button onClick={runAnalysis} disabled={loading} className="w-full py-6 rounded-2xl font-orbitron font-bold text-sm tracking-[0.4em] btn-premium text-white shadow-2xl">
              {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-white/40 tracking-widest uppercase">{signals.length} SIGNAUX DÉTECTÉS</h3>
                <button onClick={() => setSignals([])} className="text-[10px] font-bold text-red-500 uppercase flex items-center space-x-1"><RefreshCw size={10}/><span>Relancer</span></button>
            </div>
            {signals.map((sig, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: idx * 0.01 }}
                className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center bg-black/60"
              >
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Heure Cible</span>
                    <span className="font-orbitron text-xs text-white font-bold">{sig.time || "--:--"}</span>
                </div>
                <span className="font-orbitron font-black text-red-500 text-sm tracking-wider">{sig.signal || "N/A"}</span>
                <button onClick={() => handleCopy(sig.signal || "", idx)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                    {copiedId === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AviatorScreen;
