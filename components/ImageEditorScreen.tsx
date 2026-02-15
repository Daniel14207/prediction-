
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Wand2, Image as ImageIcon, Download, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ImageEditorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt.trim()) {
        if(!image || !prompt.trim()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
        return;
    }
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png', // Assuming png/jpeg standard
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64 = part.inlineData.data;
                const url = `data:image/png;base64,${base64}`;
                setResultImage(url);
                foundImage = true;
                break;
            }
          }
      }
      
      if (!foundImage) {
          console.error("No image found in response");
      }

    } catch (error) {
      console.error(error);
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
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">REALITY SHIFT</h2>
            <span className="text-[10px] font-bold text-pink-400 tracking-[0.3em] uppercase">Confirmation de Signal</span>
          </div>
        </div>
        <Wand2 size={20} className="text-pink-400/50" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
         <div className="glass p-6 rounded-[32px] bg-black/60 border border-white/10 space-y-6">
            <motion.div 
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.98 }}
                className={`w-full aspect-square max-h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative
                ${image ? 'border-pink-500/50 bg-black/40' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
                {image ? (
                    <img src={image} alt="Original" className="w-full h-full object-contain" />
                ) : (
                    <>
                        <Upload className="text-pink-400 mb-2" size={32} />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">
                            Charger Source
                        </span>
                    </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </motion.div>

            <motion.div
                animate={shake && !prompt ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
            >
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Highlight winning patterns, Show risk areas..."
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all
                    ${shake && !prompt ? 'border-red-500/50 placeholder:text-red-400' : 'border-white/10 focus:border-pink-500/50'}`}
                />
            </motion.div>

            <motion.button
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                onClick={handleEdit}
                className={`w-full py-5 rounded-2xl font-orbitron font-bold tracking-[0.3em] flex items-center justify-center space-x-3 transition-all
                  ${!image || !prompt || loading ? 'bg-white/5 text-white/20 border border-white/5' : 'bg-pink-600 text-white shadow-[0_0_20px_#DB2777] border border-pink-400'}`}
            >
                {loading ? <Wand2 className="animate-spin" /> : <ImageIcon />}
                <span>{loading ? 'CALCUL...' : 'CONFIRMER SIGNAL'}</span>
            </motion.button>
         </div>

         <AnimatePresence>
            {resultImage && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-4 rounded-[32px] border-2 border-pink-500/50 shadow-[0_0_30px_#DB2777]"
                >
                    <div className="flex items-center space-x-2 mb-3 px-2">
                         <AlertTriangle size={14} className="text-pink-500" />
                         <span className="text-[9px] font-black text-white/60 tracking-[0.3em] uppercase">Visualisation Modifiée</span>
                    </div>
                    <img src={resultImage} alt="Edited" className="w-full rounded-[24px] mb-4" />
                    <a href={resultImage} download="vick_signal.png" className="block w-full py-3 bg-white/10 rounded-xl text-center text-xs font-bold uppercase tracking-widest hover:bg-white/20">
                        Sauvegarder Preuve
                    </a>
                </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageEditorScreen;
