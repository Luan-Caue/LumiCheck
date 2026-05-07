import React from 'react';
import { Camera, ArrowRight, Lightbulb } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white relative overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12 relative z-10 min-h-full">
        {/* Logo Area */}
        <div className="mb-12 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full scale-150 animate-pulse group-hover:opacity-40 transition-opacity" />
            <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900/50 backdrop-blur-xl rounded-[32px] md:rounded-[40px] flex items-center justify-center mb-6 md:mb-8 shadow-2xl border border-white/10 animate-float relative z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10" />
              <Lightbulb className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </div>
          </div>
          
          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
              LumiCheck
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-xs mx-auto font-medium leading-relaxed px-4">
              Análise inteligente de iluminação com o auxílio do <span className="text-indigo-400 font-bold">Lumizinho</span>.
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 gap-3 md:gap-4 mb-12 w-full max-w-sm px-4">
          <div className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-sm p-4 rounded-3xl border border-white/5 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg">
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Análise em tempo real</h3>
              <p className="text-[10px] md:text-xs text-zinc-500 font-medium">Use a câmera do seu dispositivo</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-sm p-4 rounded-3xl border border-white/5 hover:bg-white/[0.05] transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 shadow-lg">
              <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Dicas do Lumizinho</h3>
              <p className="text-[10px] md:text-xs text-zinc-500 font-medium">Melhore seu conforto visual</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-sm px-4 mb-8">
          <button
            onClick={onStart}
            className="group relative w-full bg-white text-zinc-950 font-black text-lg md:text-xl py-4 md:py-5 px-8 rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_70px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Iniciar Análise</span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Footer Status */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            IA Ativa
          </div>
          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span>v1.0.3</span>
        </div>
      </div>
    </div>
  );
}
