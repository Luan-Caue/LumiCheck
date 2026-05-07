import React, { useState } from 'react';
import { Camera, MessageSquare, Home as HomeIcon, History as HistoryIcon } from 'lucide-react';
import CameraAnalyzer from './components/CameraAnalyzer';
import Chatbot from './components/Chatbot';
import Home from './components/Home';
import History from './components/History';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'chat' | 'history'>('home');
  const isHome = activeTab === 'home';

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-50 overflow-hidden font-sans">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHome ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <Home onStart={() => setActiveTab('scanner')} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'scanner' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {/* Only render camera when tab is active to avoid keeping camera on in background */}
          {activeTab === 'scanner' && <CameraAnalyzer />}
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <Chatbot />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {activeTab === 'history' && <History />}
        </div>
      </main>

      {/* Bottom Navigation - Only show if not on home screen */}
      {!isHome && (
        <nav className="bg-white/80 backdrop-blur-md border-t border-zinc-200 px-6 py-3 pb-safe flex justify-center gap-8 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isHome 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'scanner' 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium text-center">Análise</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'history' 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <HistoryIcon className="w-6 h-6" />
            <span className="text-xs font-medium text-center">Histórico</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'chat' 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-medium text-center whitespace-nowrap">Assistente IA</span>
          </button>
        </nav>
      )}
    </div>
  );
}

