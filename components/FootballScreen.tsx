
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Target, AlertTriangle, TrendingUp, Info, RefreshCw, CheckCircle2, Layers, Star, List, Zap } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Nouvelle structure de données stricte selon demande
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

  // Validation State
  const [shake, setShake] = useState(false);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

  // STRICT VALIDATION: Both images mandatory
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
        
        if (statusMessage === "Veuillez charger les deux images requises.") setStatusMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    if (result || loading) {
        setConfirmDialog({
            isOpen: true,
            message: "Quitter l'analyse ? Les résultats actuels seront perdus.",
            onConfirm: () => {
                setConfirmDialog(null);
                onBack();
            }
        });
    } else {
        onBack();
    }
  };

  const handleRunAnalysis = () => {
      if (result) {
          setConfirmDialog({
              isOpen: true,
              message: "Lancer une nouvelle analyse ? Les résultats actuels seront écrasés.",
              onConfirm: () => {
                  setConfirmDialog(null);
                  setResult(null);
                  runFootballAnalysis();
              }
          });
      } else {
          runFootballAnalysis();
      }
  };

  const runFootballAnalysis = async () => {
    if (!isFormValid) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setStatusMessage("Veuillez charger les deux images requises (Historique + Match).");
        return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        TU ES LE MOTEUR VICK V4 - ANALYSEUR DE MATCHS VIRTUELS.
        
        INPUT : 
        - Image 1 : Historique (pour tendance).
        - Image 2 : LISTE DES MATCHS ACTUELS (Source des noms d'équipes).

        RÈGLES STRICTES (OCR):
        1. Tu dois LIRE les noms EXACTS des équipes sur l'image 2.
        2. INTERDICTION d'inventer des noms (pas de Team A, Team B).
        3. Si tu vois "Liverpool vs Arsenal", tu écris "Liverpool vs Arsenal".

        TACHE : Générer un JSON avec 3 blocs distincts.

        BLOC 1 : RÉSULTATS SIMPLES
        - Liste de TOUS les matchs détectés.
        - Format : "Equipe1 vs Equipe2" -> "Prédiction courte" (ex: 1-0, Over 2.5).

        BLOC 2 : MULTIPLES (Minimum 10 choix)
        - Générer 10 combinaisons.
        - Chaque combinaison contient EXACTEMENT 3 matchs issus de l'image.
        - Format par ligne : "Equipe1 vs Equipe2 : Choix".

        BLOC 3 : COTES ÉLEVÉES (> 10.00)
        - Chercher ou calculer des scores exacts/mi-temps fin improbables.
        - Format : "Numéro - Option @ Cote".

        FORMAT JSON ATTENDU (Exemple structurel, utiliser vrais noms) :
        {
          "simpleResults": [
             { "match": "Real vs Barca", "prediction": "2-1" },
             { "match": "City vs Chelsea", "prediction": "Over 2.5" }
          ],
          "multiples": [
             { "id": 1, "selections": ["Real vs Barca : 1", "City vs Chelsea : Over 2.5", "Juve vs Milan : X"] },
             ... (jusqu'à 10)
          ],
          "highOdds": [
             { "id": 1, "label": "Real gagne 4-0", "odd": "15.00" },
             { "id": 2, "label": "City/Nul (HT/FT)", "odd": "12.50" }
          ]
        }
      `;

      const parts: any[] = [{ text: prompt }];
      if (historyImage) parts.push({ inlineData: { data: historyImage.split(',')[1], mimeType: 'image/png' } });
      if (matchesImage) parts.push({ inlineData: { data: matchesImage.split(',')[1], mimeType: 'image/png' } });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      
      if(data.simpleResults && data.multiples && data.highOdds) {
          setResult(data);
      } else {
          throw new Error("Structure JSON invalide");
      }
      
      if ("vibrate" in navigator) navigator.vibrate(20);
    } catch (err) {
      console.error(err);
      setStatusMessage("Erreur d'analyse. Vérifiez la netteté des images.");
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
        
        {/* INPUT PANEL - S'affiche toujours si pas de résultat, ou caché si résultat ? 
            L'UX standard demande de garder les inputs accessibles ou de les minimiser.
            Ici on cache si résultat pour laisser place aux données denses. */}
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
                transition={{ duration: 0.4 }}
                onClick={() => handleUploadClick('history')}
                className={`p-5 rounded-3xl flex flex-col items-center space-y-3 transition-all duration-300 border
                    ${historyImage 
                        ? 'bg-green-900/40 border-green-500/40' 
                        : shake && !historyImage 
                        ? 'bg-red-900/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-black/40 border-white/5'}`}
                >
                <div className={`p-2 rounded-xl ${historyImage ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    <TrendingUp size={20} className={historyImage ? 'text-green-500' : 'text-white/20'} />
                </div>
                <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${historyImage ? 'text-white' : shake && !historyImage ? 'text-red-400' : 'text-white/30'}`}>
                    {historyImage ? 'CHARGÉ' : 'HISTORIQUE'}
                </span>
                </motion.button>

                <motion.button 
                whileTap={{ scale: 0.95 }}
                animate={shake && !matchesImage ? { x: [0, -5, 5, -5, 5, 0], borderColor: "#ef4444" } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => handleUploadClick('matches')}
                className={`p-5 rounded-3xl flex flex-col items-center space-y-3 transition-all duration-300 border
                    ${matchesImage 
                        ? 'bg-green-900/40 border-green-500/40' 
                        : shake && !matchesImage 
                        ? 'bg-red-900/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-black/40 border-white/5'}`}
                >
                <div className={`p-2 rounded-xl ${matchesImage ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    <Target size={20} className={matchesImage ? 'text-green-500' : 'text-white/20'} />
                </div>
                <span className={`text-[9px] font-bold tracking-widest uppercase text-center ${matchesImage ? 'text-white' : shake && !matchesImage ? 'text-red-400' : 'text-white/30'}`}>
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
            onClick={handleRunAnalysis}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-orbitron font-bold text-sm tracking-[0.3em] shadow-xl transition-all duration-500 btn-premium text-white
                ${loading ? 'opacity-80' : isFormValid ? '' : 'opacity-90 grayscale-[0.2]'}`}
            >
            {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'LANCER ANALYSE V4'}
            </motion.button>
            </div>
        )}

        {/* RESULTS PANEL - BLOCKS STRICTS */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-12"
            >
                {/* Header Re-run button small */}
                <div className="flex justify-end">
                    <button onClick={handleRunAnalysis} className="flex items-center space-x-2 text-[10px] font-bold text-white/50 uppercase hover:text-white transition-colors">
                        <RefreshCw size={12} /> <span>Relancer Analyse</span>
                    </button>
                </div>

              {/* BLOC 1 : RÉSULTATS SIMPLES */}
              <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-2 border-b border-white/10 pb-2">
                      <List size={14} className="text-green-500" />
                      <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">RÉSULTATS DÉTECTÉS</h3>
                  </div>
                  <div className="grid gap-2">
                      {result.simpleResults.map((item, idx) => (
                          <div key={idx} className="glass p-3 rounded-xl border border-white/5 flex justify-between items-center bg-black/40">
                              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide truncate mr-2">{item.match}</span>
                              <span className="font-orbitron font-bold text-green-400 text-xs whitespace-nowrap">{item.prediction}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* BLOC 2 : MULTIPLES (Minimum 10) */}
              <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-2 border-b border-white/10 pb-2 pt-4">
                      <Layers size={14} className="text-green-500" />
                      <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">10 CHOIX MULTIPLES (COMBINÉS)</h3>
                  </div>
                  <div className="space-y-4">
                      {result.multiples.map((multiple) => (
                          <div key={multiple.id} className="glass p-4 rounded-xl border border-white/10 bg-gradient-to-br from-green-900/10 to-black relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-green-600 px-2 py-1 rounded-bl-xl">
                                  <span className="text-[9px] font-black text-white uppercase">Choix {multiple.id}</span>
                              </div>
                              <div className="space-y-2 mt-2">
                                  {multiple.selections.map((sel, sIdx) => (
                                      <div key={sIdx} className="flex items-center space-x-2">
                                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                                          <p className="text-[10px] font-bold text-white/80 uppercase font-rajdhani">{sel}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* BLOC 3 : COTES ÉLEVÉES */}
              <div className="space-y-3">
                 <div className="flex items-center space-x-2 px-2 border-b border-white/10 pb-2 pt-4">
                    <Star size={14} className="text-yellow-500" />
                    <h4 className="text-[10px] font-black text-yellow-400 tracking-[0.3em] uppercase">COTES ÉLEVÉES {'>'} 10</h4>
                 </div>
                 <div className="space-y-2">
                    {result.highOdds.map((m) => (
                        <div key={m.id} className="glass p-3 rounded-xl flex justify-between items-center border-l-2 border-yellow-500 bg-yellow-900/10">
                            <div className="flex items-center space-x-3">
                                <span className="text-[9px] font-black text-yellow-600 bg-yellow-500/10 w-5 h-5 flex items-center justify-center rounded-full border border-yellow-500/20">{m.id}</span>
                                <span className="text-[10px] font-bold text-white/90 uppercase">{m.label}</span>
                            </div>
                            <span className="font-orbitron font-black text-yellow-400 text-sm">@{m.odd}</span>
                        </div>
                    ))}
                 </div>
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

export default FootballScreen;
