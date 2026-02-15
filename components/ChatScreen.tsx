
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare, Bot, User, Sparkles, Lock, Smartphone } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

const ChatScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneId, setPhoneId] = useState('');
  const [authError, setAuthError] = useState(false);
  const [shake, setShake] = useState(false);

  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat with Strict Persona
  useEffect(() => {
    if (isAuthenticated) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSession.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: `
            ROLE: You are ORACLE, a high-end casino AI strategist.
            
            STRICT RULES:
            1. NO casual chat. NO storytelling. NO long explanations.
            2. FOCUS ONLY on: ANALYSE • PRÉDICTION • SIGNAL • RESULTAT.
            3. If user asks about non-gambling topics, reply: "Hors sujet. Analyse refusée."
            4. If data is insufficient, reply: "Données insuffisantes – analyse refusée".
            
            OUTPUT FORMAT (Mandatory):
            RESULTAT:
            - [Choix recommandé]
            - Probabilité: [XX%]
            - Risque: [Faible / Moyen / Élevé]
            
            RISK RULES:
            - If probability < 50%, Risque = Élevé.
            - If user inputs specific data, analyze it instantly and output the RESULTAT.
            - Keep responses under 50 words.
            `,
        },
        });
        // Initial greeting
        setMessages([{ role: 'model', text: 'Oracle connecté. En attente de données pour analyse.' }]);
    }
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAuth = () => {
      // Simple validation for phone number format (just length/digits for demo)
      const isValid = /^\d{8,}$/.test(phoneId.replace(/\s/g, ''));
      
      if (isValid) {
          setIsAuthenticated(true);
      } else {
          setAuthError(true);
          setShake(true);
          setTimeout(() => setShake(false), 500);
      }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading || !chatSession.current) {
        if (!inputText.trim()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
        return;
    }
    
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
           fullResponse += c.text;
           setMessages(prev => {
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1].text = fullResponse;
             return newMsgs;
           });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Erreur de connexion au flux neuronal.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
      return (
        <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-rajdhani overflow-hidden">
             {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 w-full max-w-sm glass p-8 rounded-[32px] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            >
                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Lock size={24} className="text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-orbitron font-black text-white mb-2 text-glow">ACCÈS SÉCURISÉ</h2>
                <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-8">Identification Requise</p>
                
                <div className="space-y-6">
                    <div className="text-left space-y-2">
                        <label className="text-[9px] font-black text-blue-400 tracking-[0.3em] uppercase ml-2">ID Utilisateur (Tél)</label>
                        <motion.div 
                            animate={shake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="relative"
                        >
                            <input 
                                type="tel"
                                value={phoneId}
                                onChange={(e) => {
                                    setPhoneId(e.target.value);
                                    setAuthError(false);
                                }}
                                placeholder="034 XX XXX XX"
                                className={`w-full bg-black/40 border py-4 px-12 rounded-xl text-white font-orbitron font-bold text-lg tracking-widest placeholder:text-white/10 focus:outline-none transition-all
                                ${authError ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-blue-500/30 focus:border-blue-400'}`}
                            />
                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        </motion.div>
                         {authError && <p className="text-[9px] text-red-400 font-bold tracking-widest uppercase ml-2">ID Invalide</p>}
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAuth}
                        className="w-full py-5 rounded-xl bg-blue-600 text-white font-orbitron font-bold tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400 hover:bg-blue-500 transition-all"
                    >
                        Connexion Oracle
                    </motion.button>
                </div>
            </motion.div>
            
            <button onClick={onBack} className="mt-8 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Retour Menu</button>
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
            <h2 className="text-xl font-orbitron font-black text-white tracking-widest text-glow">ORACLE CHAT</h2>
            <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase">Connecté: {phoneId}</span>
            </div>
          </div>
        </div>
        <Bot size={20} className="text-blue-400/50" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-4 pb-4">
         {messages.map((msg, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={idx} 
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                <div className={`max-w-[85%] p-5 rounded-2xl border backdrop-blur-md ${
                    msg.role === 'user' 
                    ? 'bg-blue-900/30 border-blue-500/30 text-white rounded-br-none' 
                    : 'glass border-white/10 text-white/80 rounded-bl-none'
                }`}>
                    <div className="flex items-center space-x-2 mb-2 opacity-50">
                        {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} className="text-blue-400" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'VOUS' : 'ORACLE SYSTEM'}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap font-orbitron">{msg.text}</p>
                </div>
             </motion.div>
         ))}
         {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="glass px-4 py-3 rounded-2xl flex space-x-2 items-center border border-blue-500/20">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                 </div>
             </motion.div>
         )}
         <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-2 pb-8">
          <div className={`glass p-2 rounded-[24px] flex items-center space-x-2 bg-black/60 border transition-all duration-300 ${shake ? 'border-red-500/50' : 'border-white/10'}`}>
              <motion.input 
                animate={shake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Entrez vos données de jeu..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none text-white px-4 py-3 font-medium placeholder:text-white/20 focus:outline-none"
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={loading}
                className={`p-4 rounded-xl text-black transition-all ${!inputText.trim() ? 'bg-white/10 text-white/20' : 'bg-blue-500 shadow-[0_0_15px_#3B82F6] text-white'}`}
              >
                  <Send size={18} />
              </motion.button>
          </div>
      </div>
    </div>
  );
};

export default ChatScreen;
