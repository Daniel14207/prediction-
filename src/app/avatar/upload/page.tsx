'use client';

import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Upload Avatar (Vercel Blob)</h1>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!inputFileRef.current?.files) return;

            setLoading(true);
            const file = inputFileRef.current.files[0];

            try {
              const response = await fetch(
                `/api/avatar/upload?filename=${file.name}`,
                {
                  method: 'POST',
                  body: file,
                },
              );

              const newBlob = await response.json();
              setBlob(newBlob);
            } catch (err) {
              console.error("Blob upload failed", err);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl text-center hover:border-blue-500 transition-colors">
            <input 
              name="file" 
              ref={inputFileRef} 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              required 
              className="hidden"
              id="avatar-input"
            />
            <label htmlFor="avatar-input" className="cursor-pointer block">
               {blob ? "Changer de fichier" : "Sélectionner une image"}
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {loading ? "Chargement..." : "Uploader sur Vercel"}
          </button>
        </form>

        {blob && (
          <div className="p-4 bg-slate-800 rounded-xl border border-blue-500/30 text-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm text-slate-400 mb-2">Image hébergée avec succès :</p>
            <a href={blob.url} target="_blank" className="text-blue-400 underline break-all text-xs">
              {blob.url}
            </a>
            <img src={blob.url} className="mt-4 rounded-lg w-full max-h-48 object-cover" alt="Avatar" />
          </div>
        )}
      </div>
    </div>
  );
}