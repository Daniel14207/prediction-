
import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Zap, Activity, Trophy, Disc, MessageSquare, Eye, Clapperboard, Wand2, ChevronRight, Lock } from 'lucide-react';
import { Screen } from '../types';

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden flex flex-col font-rajdhani">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 z-20 flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-orbitron font-black text-white text-glow">DASHBOARD</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#008A3D]" />
              <p className="text-white/60 font-bold tracking-[0.3em] text-[10px] uppercase">
                V4 System Online
              </p>
            </div>
         </div>
         <div className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10">
            <Activity size={18} className="text-green-500" />
         </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-8 z-10">
        
        {/* === MAIN MODULES (BANNERS) === */}
        <section className="space-y-5">
           <div className="flex items-center space-x-2 opacity-60 mb-2">
              <Zap size={12} className="text-white" />
              <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">Modules Principaux</span>
           </div>

           <BannerButton 
              title="AVIATOR STUDIO" 
              subtitle="Analyse Volatilité V4" 
              icon={<Plane size={24} className="text-white transform -rotate-45" />} 
              image="/aviator.jpg"
              fallbackImage="https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?q=80&w=2000&auto=format&fit=crop"
              color="red"
              onClick={() => onNavigate(Screen.AVIATOR)}
           />

           <BannerButton 
              title="VIRTUEL FOOT" 
              subtitle="Score Exact & Multiples" 
              icon={<Trophy size={24} className="text-white" />} 
              image="/football.jpg"
              fallbackImage="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop"
              color="green"
              onClick={() => onNavigate(Screen.FOOTBALL)}
           />

           <BannerButton 
              title="ROULETTE FR" 
              subtitle="Analyse Sectorielle" 
              icon={<Disc size={24} className="text-white" />} 
              image="/roulette.jpg"
              fallbackImage="https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2000&auto=format&fit=crop"
              color="yellow"
              onClick={() => onNavigate(Screen.ROULETTE)}
           />
        </section>

        {/* === AI TOOLS (GRID) === */}
        <section className="space-y-4">
           <div className="flex items-center space-x-2 opacity-60 mb-2 mt-4">
              <Lock size={12} className="text-white" />
              <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">Outils Expérimentaux</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <ToolButton 
                title="Oracle" 
                subtitle="Chat IA" 
                icon={<MessageSquare size={20} />} 
                color="blue" 
                onClick={() => onNavigate(Screen.CHAT)} 
              />
              <ToolButton 
                title="Scanner" 
                subtitle="Vision" 
                icon={<Eye size={20} />} 
                color="purple" 
                onClick={() => onNavigate(Screen.SCANNER)} 
              />
              <ToolButton 
                title="Holo-Gen" 
                subtitle="Veo Video" 
                icon={<Clapperboard size={20} />} 
                color="yellow" 
                onClick={() => onNavigate(Screen.VEO)} 
              />
              <ToolButton 
                title="Editor" 
                subtitle="Neural" 
                icon={<Wand2 size={20} />} 
                color="pink" 
                onClick={() => onNavigate(Screen.EDITOR)} 
              />
           </div>
        </section>

        {/* Footer License */}
        <div className="text-center opacity-30 pt-4">
            <p className="text-[9px] font-black tracking-[0.3em] uppercase">Licence: MG-2025-VITAL</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---

const BannerButton: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  image: string; 
  fallbackImage?: string;
  color: 'red' | 'green' | 'yellow'; 
  onClick: () => void 
}> = ({ title, subtitle, icon, image, fallbackImage, color, onClick }) => {
  
  const getColorClasses = () => {
    switch(color) {
      case 'red': return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      case 'green': return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]';
      case 'yellow': return 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]';
      default: return 'border-white/20';
    }
  };

  const getBadgeColor = () => {
    switch(color) {
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative w-full h-32 rounded-[24px] overflow-hidden border transition-all duration-300 ${getColorClasses()}`}
    >
      {/* Background Image with Slow Zoom Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 4, ease: "linear" }}
            src={image} 
            onError={(e) => { e.currentTarget.src = fallbackImage || '' }}
            alt={title} 
            className="w-full h-full object-cover opacity-80" 
        />
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex items-center h-full px-6 space-x-5">
        {/* Icon Badge */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm ${getBadgeColor()}`}>
           {icon}
        </div>

        {/* Text */}
        <div className="flex-1 text-left">
           <h3 className="text-2xl font-orbitron font-black text-white italic tracking-wider drop-shadow-lg">{title}</h3>
           <div className="flex items-center mt-1 space-x-2">
              <span className={`h-0.5 w-6 ${getBadgeColor()}`} />
              <p className="text-[10px] font-bold text-white/90 tracking-[0.2em] uppercase text-shadow-sm">{subtitle}</p>
           </div>
        </div>

        {/* Action Icon */}
        <div className="w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
            <ChevronRight size={16} className="text-white" />
        </div>
      </div>
    </motion.button>
  );
};

const ToolButton: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  color: string; 
  onClick: () => void 
}> = ({ title, subtitle, icon, color, onClick }) => {
    
    const getColor = () => {
        switch(color) {
            case 'blue': return 'text-blue-400 group-hover:text-blue-300';
            case 'purple': return 'text-purple-400 group-hover:text-purple-300';
            case 'yellow': return 'text-yellow-400 group-hover:text-yellow-300';
            case 'pink': return 'text-pink-400 group-hover:text-pink-300';
            default: return 'text-white';
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="glass p-4 rounded-[24px] flex flex-col items-center justify-center space-y-2 border border-white/5 hover:bg-white/5 transition-colors group"
        >
            <div className={`p-3 rounded-full bg-black/40 border border-white/5 ${getColor()}`}>
                {icon}
            </div>
            <div className="text-center">
                <span className="block text-sm font-orbitron font-bold text-white">{title}</span>
                <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest">{subtitle}</span>
            </div>
        </motion.button>
    );
};

export default MainMenu;
