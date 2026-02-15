
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Video, Film, Loader2, AlertTriangle, Key, Plane, Trophy, Disc } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const VeoScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasKey, setHasKey] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [activeContext, setActiveContext] = useState<string | null>(null);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(has);
    } else {
        setHasKey(true); 
    }
  };

  const selectKey = async () => {
      if ((window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
          await checkKey();
      }
  };

  const setContext = (ctx: string, defaultPrompt: string) => {
      setActiveContext(ctx);
      setPrompt(defaultPrompt);
  }

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setVideoUrl(null);
    setProgress(0);
    setStatus('Initialisation Veo Signal...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prefix prompt to force a "Holographic Signal" style if not already present
      const finalPrompt = `A futuristic neon hologram visualization of a casino prediction signal: ${prompt}. High tech, cyberpunk HUD style, 3D data visualization.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '9:16'
        }
      });

      setStatus('Génération du Signal Holographique (Patientez)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
        setProgress(prev => Math.min(prev + 5, 95));
      }

      setStatus('Signal Prêt.');
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
          const finalUrl = `${uri}&key=${process.env.API_KEY}`;
          setVideoUrl(finalUrl);
          setProgress(100);
      } else {
          throw new Error("No video URI returned");
      }

    } catch (error) {
      console.error(error);
      setStatus("Erreur de génération du signal.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
      return (
        <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-rajdhani">
            <AlertTriangle className="text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-orbitron font-black text-white mb-2">Clé API Requise</h2>
            <p className="text-white/60 mb-6">Le module Veo nécessite une clé API payante sélectionnée.</p>
            <button onClick={selectKey} className="btn-premium py-4 px-8 rounded-2xl text-white font-bold tracking-widest flex items-center space-x-2">
                <Key size={18} />
                <span>SÉLECTIONNER CLÉ</span>
            </button>
            <button onClick={onBack} className="mt-8 text-white/30 text-xs font-bold uppercase tracking-widest">Retour</button>
        </div>
      );
  }

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden flex flex-col font-rajdhani">
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center space-x-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-3 glass rounded-2xl text-white shadow-lg border border-white/20">
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">HOLO GEN</h2>
            <span className="text-[10px] font-bold text-yellow-400 tracking-[0.3em] uppercase">Visualiseur de Signal</span>
          </div>
        </div>
        <Video size={20} className="text-yellow-400/50" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
        <div className="glass p-6 rounded-[32px] bg-black/60 border border-white/10 space-y-4">
            <label className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase ml-1">Contexte d'Analyse</label>
            
            {/* Context Buttons */}
            <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                <button 
                    onClick={() => setContext('aviator', 'Aviator plane flying high reaching 100x multiplier with green success sparks')}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${activeContext === 'aviator' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                    <Plane size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Aviator</span>
                </button>
                <button 
                    onClick={() => setContext('football', 'Football match scoreboard showing 3-1 win prediction with trophy hologram')}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${activeContext === 'football' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                    <Trophy size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Football</span>
                </button>
                <button 
                    onClick={() => setContext('roulette', 'Roulette wheel landing on Red 7 with winning chips stacking up')}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${activeContext === 'roulette' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                    <Disc size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Roulette</span>
                </button>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ou décrivez le signal attendu..."
                className="w-full h-24 bg-white/5 rounded-2xl p-4 text-white text-sm font-medium focus:outline-none border border-white/10 focus:border-yellow-500/50 resize-none"
            />
            
            <motion.button
                disabled={loading || !prompt.trim()}
                whileTap={{ scale: 0.98 }}
                onClick={generateVideo}
                className={`w-full py-5 rounded-2xl font-orbitron font-bold tracking-[0.3em] flex items-center justify-center space-x-3 transition-all
                  ${loading || !prompt.trim() ? 'bg-white/5 text-white/20 border border-white/5' : 'bg-yellow-600 text-white shadow-[0_0_20px_#CA8A04] border border-yellow-400'}`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <Film />}
                <span>{loading ? 'RENDERING...' : 'GÉNÉRER VISUEL'}</span>
            </motion.button>
        </div>

        <AnimatePresence>
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                    <p className="text-yellow-400 text-[10px] font-black tracking-widest uppercase animate-pulse">{status}</p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-yellow-500" 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </motion.div>
            )}

            {videoUrl && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="rounded-[32px] overflow-hidden border-2 border-yellow-500 shadow-[0_0_30px_#CA8A04]">
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full h-auto bg-black"
                        />
                    </div>
                    <div className="glass p-4 rounded-2xl border-l-2 border-yellow-500">
                        <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                            Signal Holographique Généré.
                            <br/><span className="text-white">Analyse visuelle terminée.</span>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VeoScreen;
