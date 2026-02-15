
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, RefreshCw, Zap, Settings, BarChart3, CheckCircle2, Copy, Check, PlayCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Interface locale correspondant strictement à la sortie JSON demandée
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

  // Validation State
  const [shake, setShake] = useState(false);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

  // Validation strictly HH:MM or HH:MM:SS
  const isTimeValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(lastTime);
  const isCoteValid = lastCote.trim().length > 0 && !isNaN(parseFloat(lastCote));
  // STRICT VALIDATION: Image is MANDATORY
  const isFormValid = image !== null && isCoteValid && isTimeValid;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        setImage(base64);
        if (statusMessage?.includes("incomplètes")) setStatusMessage(null);
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
            message: "Quitter le module ? Les données actuelles seront perdues.",
            onConfirm: () => {
                setConfirmDialog(null);
                onBack();
            }
        });
    } else {
        onBack();
    }
  };

  const handleResetCycle = () => {
    setConfirmDialog({
        isOpen: true,
        message: "Lancer une nouvelle analyse ? L'historique actuel sera effacé.",
        onConfirm: () => {
            setSignals([]);
            setImage(null);
            setLastCote('');
            setLastTime('');
            setStatusMessage(null);
            setConfirmDialog(null);
        }
    });
  };

  const runAnalysis = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image!.split(',')[1];
      
      const promptText = `
        MOTEUR AVIATOR V4 - GÉNÉRATION STRICTE 50 LIGNES.
        
        INPUT: Cote ${lastCote} à ${lastTime}.
        ANALYSE IMAGE: Volatilité détectée sur l'historique fourni.

        TACHE OBLIGATOIRE :
        Générer exactement 50 prédictions futures sous forme de liste JSON.

        FORMAT DE SORTIE JSON ATTENDU :
        {
          "predictions": [
            { "time": "HH:MM", "signal": "1.20 / 1.80 / 2.50" },
            { "time": "HH:MM", "signal": "2.10 / 3.00 / Risque 8.50" }
          ]
        }

        RÈGLES DE SIGNAL :
        - Toujours 3 valeurs séparées par " / ".
        - Si la 3ème valeur dépasse 5.00, ajouter le mot "Risque" devant la valeur.
        - Incrémenter l'heure logiquement ligne par ligne.
        - Pas de texte explicatif, uniquement le JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/png' } },
              { text: promptText }
            ]
          }
        ],
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.predictions && Array.isArray(data.predictions)) {
        setSignals(data.predictions);
      } else {
        throw new Error("Format invalide");
      }
      
      if ("vibrate" in navigator) navigator.vibrate(20);
    } catch (error) {
      console.error(error);
      setStatusMessage("Échec analyse V4. Image illisible ou erreur serveur.");
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
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-white/60 tracking-[0.3em] uppercase">V4 Engine Live</span>
            </div>
          </div>
        </div>
        <Settings size={20} className="text-white/40" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        <AnimatePresence mode="wait">
          {signals.length === 0 ? (
            <motion.div 
              key="inputs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass p-6 rounded-[32px] border-l-4 border-l-red-600 space-y-6 shadow-2xl bg-black/60">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Données Obligatoires</span>
                    {isFormValid && <CheckCircle2 size={16} className="text-green-500 animate-bounce" />}
                 </div>

                 <div className="space-y-4">
                    {/* Image Upload */}
                    <div className="relative">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full py-5 px-6 rounded-2xl border flex items-center justify-between transition-all duration-300
                          ${image 
                            ? 'bg-red-900/20 border-red-500/40 shadow-inner' 
                            : 'bg-black/40 border-white/10 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Upload size={18} className={image ? 'text-red-500' : 'text-white/20'} />
                          <span className={`text-xs font-bold tracking-widest uppercase ${image ? 'text-white' : 'text-white/40'}`}>
                            {image ? 'HISTORIQUE CHARGÉ' : 'UPLOAD HISTORIQUE (REQUIS)'}
                          </span>
                        </div>
                        {image && <Check size={14} className="text-red-500" />}
                      </motion.button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                        id="aviator-history-upload"
                      />
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black tracking-[0.4em] uppercase ml-2 text-white/30">Dernière Cote</label>
                        <input 
                          type="number"
                          step="0.01" 
                          placeholder="Ex: 2.18"
                          value={lastCote}
                          onChange={(e) => setLastCote(e.target.value)}
                          className={`w-full bg-black/40 border py-5 px-5 rounded-2xl text-white font-orbitron font-bold placeholder:text-white/10 focus:outline-none transition-all text-sm text-center
                            ${lastCote && !isCoteValid ? 'border-red-500/60' : 'border-white/10 focus:border-red-500/50'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black tracking-[0.4em] uppercase ml-2 text-white/30">Heure (HH:MM)</label>
                        <input 
                          type="time" 
                          value={lastTime}
                          onChange={(e) => setLastTime(e.target.value)}
                          className={`w-full bg-black/40 border py-5 px-5 rounded-2xl text-white font-orbitron font-bold placeholder:text-white/10 focus:outline-none transition-all text-sm text-center
                            ${lastTime && !isTimeValid ? 'border-red-500/60' : 'border-white/10 focus:border-green-500/50'}`}
                        />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Status or Error Message */}
              {statusMessage && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <span className="text-red-400 text-[10px] font-bold tracking-widest uppercase bg-red-900/20 px-4 py-2 rounded-full border border-red-500/20">
                      {statusMessage}
                    </span>
                 </motion.div>
              )}

              <motion.button
                disabled={loading || !isFormValid}
                whileHover={!loading && isFormValid ? { scale: 1.02 } : {}}
                whileTap={!loading && isFormValid ? { scale: 0.98 } : {}}
                onClick={runAnalysis}
                className={`w-full py-6 rounded-2xl font-orbitron font-bold tracking-[0.5em] flex items-center justify-center space-x-3 shadow-2xl transition-all duration-500 btn-premium text-white
                  ${loading || !isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} className={isFormValid ? 'animate-pulse' : ''} />}
                <span>{loading ? 'CALCUL V4...' : 'LANCER ANALYSE'}</span>
              </motion.button>

            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-12"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 px-2">
                <div>
                    <h3 className="text-white font-orbitron text-xs tracking-[0.4em] uppercase text-glow">Résultats V4</h3>
                    <p className="text-[9px] text-white/40 font-bold tracking-widest mt-1">50 SIGNAUX DÉTECTÉS</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <PlayCircle size={16} className="text-green-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                {signals.map((sig, idx) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    key={idx} 
                    className="glass p-3 rounded-xl border border-white/5 flex items-center justify-between bg-black/60 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3 w-full font-orbitron">
                         <span className="text-xs font-bold text-white/50 w-10 text-right">{sig.time}</span>
                         <ArrowRight size={12} className="text-white/20" />
                         <span className="text-sm font-black text-white tracking-wider flex-1 truncate">
                            {/* Formatage intelligent des parties */}
                            {sig.signal.split(' / ').map((part, pIdx) => {
                                const isRisk = part.includes('Risque');
                                return (
                                    <span key={pIdx} className={`${
                                        pIdx === 0 ? 'text-white' : 
                                        pIdx === 1 ? 'text-white' : 
                                        isRisk ? 'text-red-400' : 'text-white'
                                    }`}>
                                        {pIdx > 0 ? ' / ' : ''}{part}
                                    </span>
                                )
                            })}
                         </span>
                    </div>
                    <button 
                      onClick={() => handleCopy(`${sig.time} -> ${sig.signal}`, idx)}
                      className="ml-2 p-1.5 rounded-lg text-white/20 hover:text-green-500 hover:bg-white/5 transition-all"
                    >
                      {copiedId === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Next Prediction Button */}
              <div className="pt-4 pb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetCycle}
                    className="w-full py-6 btn-premium rounded-3xl font-orbitron font-black text-sm tracking-[0.4em] uppercase text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center space-x-3 border border-white/20"
                  >
                    <RefreshCw size={18} />
                    <span>NOUVELLE ANALYSE</span>
                  </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

export default AviatorScreen;
