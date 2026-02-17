import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, RefreshCw, Zap, Settings, BarChart3, CheckCircle2, Copy, Check, PlayCircle, AlertTriangle, ArrowRight } from 'lucide-react';

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
  const [shake, setShake] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

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

  const handleBack = () => {
    if (signals.length > 0 || loading) {
        setConfirmDialog({
            isOpen: true,
            message: "Quitter le module ? Les données seront perdues.",
            onConfirm: () => { setConfirmDialog(null); onBack(); }
        });
    } else { onBack(); }
  };

  const runAnalysis = async () => {
    if (!isFormValid) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const promptText = `
        MOTEUR AVIATOR V4.
        INPUT: Cote ${lastCote} à ${lastTime}.
        Analysez l'historique et générez exactement 50 prédictions futures en JSON.
        Format: {"predictions": [{"time": "HH:MM", "signal": "1.20 / 2.50 / Risque 8.00"}]}.
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
        try {
            const cleanText = data.analyser.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            setSignals(parsed.predictions || []);
        } catch {
            setStatusMessage("ERREUR DE FORMAT IA. VEUILLEZ RÉESSAYER.");
        }
      } else {
        setStatusMessage(data.analyser || "ERREUR D'ANALYSE.");
      }
      
      if ("vibrate" in navigator) navigator.vibrate(20);
    } catch (error) {
      setStatusMessage("ERREUR RÉSEAU. VÉRIFIEZ VOTRE CONNEXION.");
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
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">AVIATOR STUDIO</h2>
            <span className="text-[10px] font-bold text-red-500 tracking-[0.3em] uppercase">V4 Analysis Engine</span>
          </div>
        </div>
        <Settings size={20} className="text-white/40" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        {signals.length === 0 ? (
          <div className="space-y-6">
            <div className="glass p-6 rounded-[32px] border-l-4 border-l-red-600 bg-black/60 shadow-2xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className={`p-5 rounded-3xl border flex flex-col items-center space-y-2 transition-all ${image ? 'bg-red-900/40 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                   <Upload size={20} className={image ? 'text-red-500' : 'text-white/20'} />
                   <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">{image ? 'CHARGÉ' : 'HISTORIQUE'}</span>
                </button>
                <div className="bg-white/5 rounded-3xl border border-white/10 p-3 flex flex-col justify-center items-center">
                    <Zap size={20} className="text-red-500/50 mb-1" />
                    <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">AUTO SCAN</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Cote" value={lastCote} onChange={e=>setLastCote(e.target.value)} className="bg-black/40 border border-white/10 py-5 rounded-2xl text-white text-center font-orbitron text-sm focus:border-red-500/50" />
                <input type="time" value={lastTime} onChange={e=>setLastTime(e.target.value)} className="bg-black/40 border border-white/10 py-5 rounded-2xl text-white text-center font-orbitron text-sm focus:border-red-500/50" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>

            {statusMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-4 py-3 bg-red-900/40 border border-red-500/50 rounded-2xl">
                    <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">{statusMessage}</span>
                </motion.div>
            )}

            <motion.button onClick={runAnalysis} disabled={loading} className="w-full py-6 rounded-2xl font-orbitron font-bold text-sm tracking-[0.4em] btn-premium text-white shadow-2xl">
              {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-white/40 tracking-widest uppercase">50 Signaux Détectés</h3>
                <button onClick={() => setSignals([])} className="text-[10px] font-bold text-red-500 uppercase flex items-center space-x-1"><RefreshCw size={10}/><span>Reset</span></button>
            </div>
            {signals.map((sig, idx) => (
              <div key={idx} className="glass p-3 rounded-xl border border-white/5 flex justify-between items-center bg-black/60">
                <span className="font-orbitron text-xs text-white/50">{sig.time}</span>
                <span className="font-orbitron font-black text-white text-sm tracking-wider">{sig.signal}</span>
                <button onClick={() => handleCopy(sig.signal, idx)} className="p-2 text-white/20 hover:text-red-500">
                    {copiedId === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDialog?.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                <div className="glass p-6 rounded-[32px] border border-white/10 w-full max-w-sm bg-black">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="text-red-500 mx-auto" size={32} />
                        <p className="text-white text-xs font-bold tracking-widest uppercase">{confirmDialog.message}</p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setConfirmDialog(null)} className="py-3 bg-white/5 rounded-xl text-white/50 text-xs font-bold">ANNULER</button>
                            <button onClick={confirmDialog.onConfirm} className="py-3 bg-red-600 rounded-xl text-white text-xs font-bold">QUITTER</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AviatorScreen;