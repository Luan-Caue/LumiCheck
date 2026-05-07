import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Lightbulb } from 'lucide-react';
import { chatWithAI, ChatMessage } from '../services/gemini';
import Markdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Olá! Eu sou o **Lumizinho**, o assistente inteligente do projeto LumiCheck! 💡\n\nPosso te ajudar com dúvidas técnicas sobre a arquitetura do app, bibliotecas de processamento de imagem, algoritmos de calibração para Lux, ou qualquer outra questão do seu projeto acadêmico. Como posso ajudar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Pass history excluding the new message, and the new message separately
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(historyForApi, userMsg);
      
      setMessages([...newHistory, { role: 'model', content: response || 'Desculpe, não consegui gerar uma resposta.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newHistory, { role: 'model', content: 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h2 className="font-bold text-zinc-900">Lumizinho</h2>
          <p className="text-xs text-zinc-500">Assistente IA do LumiCheck</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-zinc-900' : 'bg-yellow-100'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Lightbulb className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white rounded-tr-none' 
                : 'bg-zinc-50 text-zinc-800 border border-zinc-100 rounded-tl-none prose prose-sm max-w-none'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-zinc-500 ml-2">Lumizinho está pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-zinc-100 sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo ao Lumizinho..."
            className="w-full pl-5 pr-14 py-4 bg-zinc-50 border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-yellow-500 text-white rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:hover:bg-yellow-500 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
