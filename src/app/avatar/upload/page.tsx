'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, Globe } from 'lucide-react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputFileRef.current?.files?.[0]) return;

    setLoading(true);
    setError(null);
    const file = inputFileRef.current.files[0];

    try {
      const response = await fetch(
        `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        },
      );

      if (!response.ok) throw new Error("Échec de l'upload vers Vercel Blob");

      const newBlob = await response.json();
      setBlob(newBlob);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-rajdhani flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-orbitron font-black tracking-widest text-glow uppercase">Avatar Core</h1>
          <p className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase italic">Vercel Blob Storage Integration</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div 
            onClick={() => inputFileRef.current?.click()}
            className="group relative w-full aspect-square rounded-[32px] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden"
          >
            {blob ? (
              <img src={blob.url} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" alt="Avatar" />
            ) : (
              <>
                <div className="p-4 rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
                   <Upload className="text-blue-500" size={32} />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Sélectionner Image</span>
              </>
            )}
            <input name="file" ref={inputFileRef} type="file" accept="image/*" required className="hidden" />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 rounded-2xl font-orbitron font-bold tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
            <span>{loading ? "TRANSFERT..." : "DÉPLOYER SUR CLOUD"}</span>
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          {blob && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-900/10 border border-green-500/30 rounded-2xl space-y-3"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Succès : Signal Cloud Actif</span>
              </div>
              <p className="text-[9px] text-white/40 break-all font-mono">{blob.url}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}