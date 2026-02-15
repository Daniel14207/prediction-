
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, ScanEye, Search, CheckCircle2, AlertTriangle, Layers, Zap } from 'lucide-react';

const ScannerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameMode, setGameMode] = useState<'simple' | 'multiple'>('simple');
  const [shake, setShake] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        // Max width 1024 to reduce payload size for Netlify Functions (6MB limit)
        const scale = 1024 / bmp.width;
        // If image is smaller than 1024, don't scale up
        const finalScale = scale < 1 ? scale : 1;
        
        canvas.width = bmp.width * finalScale;
        canvas.height = bmp.height * finalScale;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");
        
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob then base64 to ensure JPEG format and compression
        canvas.toBlob((blob) => {
          if (!blob) {
             reject(new Error("Compression failed"));
             return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
             resolve(reader.result as string);
          };
          reader.onerror = reject;
        }, "image/jpeg", 0.7); // 70% quality JPEG
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Just show preview initially, compression happens on send if desired, 
        // but for UI responsiveness let's just show raw first or compress immediately.
        // Let's compress immediately to ensure 'image' state is ready for API.
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
        setResult(null);
      } catch (err) {
        console.error("Image processing error", err);
      }
    }
  };

  const handleScan = async () => {
    if (!image) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
    }
    setLoading(true);
    setResult(null);

    try {
      // Extract Base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = image.split(',')[1];
      
      const prompt = `
      TASK: Analyze this casino game screenshot.
      CONTEXT: Game Mode is "${gameMode === 'simple' ? 'Simple' : 'Multiple'}".
      
      STRICT OUTPUT FORMAT (No intro, no outro):
      
      RESULTAT:
      - [Primary Prediction/Pattern Detected]
      - Cote Cible: [e.g. >2.00x]
      - Risque: [Faible / Moyen / Élevé]
      - SIGNAL: [PRENDRE / ÉVITER]
      
      RULES:
      - If visual quality is poor, reply "Image illisible".
      - Keep it under 60 words.
      `;

      // Call Netlify Function
      const response = await fetch('/api/analyse', { // Using the redirect path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64: base64Data,
          mimeType: "image/jpeg", // We converted to jpeg in compressImage
          prompt: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      setResult(data.result || data.text || "Aucune donnée détectée.");

    } catch (error: any) {
      console.error("Scan failed:", error);
      setResult(`Erreur: ${error.message || "Analyse impossible"}`);
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
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">VISUAL SCANNER</h2>
            <span className="text-[10px] font-bold text-purple-400 tracking-[0.3em] uppercase">Gemini Vision Cloud</span>
          </div>
        </div>
        <ScanEye size={20} className="text-purple-400/50" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
         <div className="glass p-6 rounded-[32px] bg-black/60 border border-white/10 space-y-6">
            
            {/* Game Mode Selector */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/5">
                <button 
                    onClick={() => setGameMode('simple')}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all
                    ${gameMode === 'simple' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                    <Zap size={14} />
                    <span>Simple</span>
                </button>
                <button 
                    onClick={() => setGameMode('multiple')}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all
                    ${gameMode === 'multiple' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                    <Layers size={14} />
                    <span>Multiple</span>
                </button>
            </div>

            <motion.div 
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.98 }}
                className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative
                ${image ? 'border-purple-500/50 bg-black/40' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
                {image ? (
                    <img src={image} alt="Upload" className="w-full h-full object-contain" />
                ) : (
                    <>
                        <Upload className="text-purple-400 mb-2" size={32} />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">
                            Upload Capture
                        </span>
                    </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </motion.div>

            <motion.button
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                onClick={handleScan}
                className={`w-full py-5 rounded-2xl font-orbitron font-bold tracking-[0.3em] flex items-center justify-center space-x-3 transition-all
                  ${loading ? 'bg-white/5 text-white/20 border border-white/5' : 'bg-purple-600 text-white shadow-[0_0_20px_#9333EA] border border-purple-400'}`}
            >
                {loading ? <ScanEye className="animate-spin" /> : <Search />}
                <span>{loading ? 'CLOUD ANALYSE...' : 'LANCER ANALYSE'}</span>
            </motion.button>
         </div>

         <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-[32px] border-l-4 border-l-purple-500 bg-black/80 shadow-[0_0_30px_rgba(147,51,234,0.2)]"
                >
                    <div className="flex items-center space-x-2 mb-4">
                        <CheckCircle2 size={16} className="text-purple-500" />
                        <h3 className="text-xs font-orbitron font-black text-white tracking-[0.3em] uppercase">Rapport Signal</h3>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-orbitron">
                        {result}
                    </p>
                </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default ScannerScreen;
