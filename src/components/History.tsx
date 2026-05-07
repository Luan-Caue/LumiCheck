import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Calendar, MapPin, ChevronRight, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function History() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('lumicheck_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.sort((a: any, b: any) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm("Tem certeza que deseja apagar todo o histórico?")) {
      localStorage.removeItem('lumicheck_history');
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem('lumicheck_history', JSON.stringify(updated));
    setHistory(updated);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getStatusIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('adequada')) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (cat.includes('baixa') || cat.includes('escura')) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (cat.includes('excessiva')) return <Zap className="w-4 h-4 text-orange-500" />;
    return <Info className="w-4 h-4 text-zinc-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-zinc-900">Histórico</h1>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <HistoryIcon className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-zinc-900 font-semibold mb-1">Nenhuma análise salva</h3>
            <p className="text-zinc-500 text-sm">Suas análises de iluminação aparecerão aqui.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color.replace('text-', 'bg-').replace('500', '100')}`}>
                        <div className={item.color}>
                          {getStatusIcon(item.category)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{item.roomName}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Luminosidade</span>
                      <span className="text-lg font-black text-zinc-900">{Math.round(item.avgLuminance)} <span className="text-xs font-normal text-zinc-400">LUX*</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Status</span>
                      <div className={`text-xs font-bold ${item.color}`}>{item.category}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-zinc-400 uppercase font-medium tracking-widest">
          *Valores aproximados baseados em sensores de imagem
        </p>
      </div>
    </div>
  );
}
