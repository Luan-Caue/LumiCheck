import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Zap, AlertTriangle, CheckCircle, Info, Sparkles, Home, Briefcase, Coffee, Bed, Bath, Layout, Lightbulb, Save } from 'lucide-react';
import { analyzeImageWithAI } from '../services/gemini';
import Markdown from 'react-markdown';
import { RoomType, AnalysisResult } from '../types';

const ROOM_TYPES: RoomType[] = [
  { 
    id: 'bedroom', 
    name: 'Quarto', 
    icon: <Bed className="w-5 h-5" />, 
    minLuminance: 40, 
    maxLuminance: 80, 
    description: 'Ambiente para descanso, requer luz suave.',
    technicalStandard: 'ABNT NBR ISO/CIE 8995-1: ~100 Lux'
  },
  { 
    id: 'living', 
    name: 'Sala', 
    icon: <Home className="w-5 h-5" />, 
    minLuminance: 80, 
    maxLuminance: 120, 
    description: 'Ambiente social, requer luz equilibrada.',
    technicalStandard: 'ABNT NBR ISO/CIE 8995-1: 100-200 Lux'
  },
  { 
    id: 'kitchen', 
    name: 'Cozinha', 
    icon: <Coffee className="w-5 h-5" />, 
    minLuminance: 120, 
    maxLuminance: 180, 
    description: 'Ambiente de trabalho, requer boa visibilidade.',
    technicalStandard: 'ABNT NBR ISO/CIE 8995-1: 200-300 Lux'
  },
  { 
    id: 'office', 
    name: 'Escritório', 
    icon: <Briefcase className="w-5 h-5" />, 
    minLuminance: 150, 
    maxLuminance: 200, 
    description: 'Ambiente de foco, requer luz intensa e uniforme.',
    technicalStandard: 'ABNT NBR ISO/CIE 8995-1: 300-500 Lux'
  },
  { 
    id: 'bathroom', 
    name: 'Banheiro', 
    icon: <Bath className="w-5 h-5" />, 
    minLuminance: 80, 
    maxLuminance: 120, 
    description: 'Requer luz funcional para higiene.',
    technicalStandard: 'ABNT NBR ISO/CIE 8995-1: 100-200 Lux'
  },
  { 
    id: 'general', 
    name: 'Geral', 
    icon: <Layout className="w-5 h-5" />, 
    minLuminance: 100, 
    maxLuminance: 150, 
    description: 'Padrão geral de iluminação.',
    technicalStandard: 'Padrão Geral: ~150 Lux'
  },
];

export default function CameraAnalyzer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(ROOM_TYPES[3]); // Default to Office
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (result) {
      const classification = classifyLighting(result.avgLuminance, result.stdDev, selectedRoom);
      setResult(prev => prev ? ({
        ...prev,
        ...classification,
        roomName: selectedRoom.name
      }) : null);
    }
  }, [selectedRoom]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      // Usando 'ideal: environment' o navegador tenta usar a câmera traseira se existir.
      // Se não existir (como em um notebook), ele usa a webcam padrão sem dar erro.
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Handle play promise correctly to avoid interruption errors
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Ignore AbortError which happens when component unmounts or src changes
            if (err.name !== 'AbortError') {
              console.error("Erro no autoplay:", err);
            }
          });
        }
      }
    } catch (err: any) {
      console.error("Erro ao acessar a câmera:", err);
      setCameraError(`Não foi possível acessar a câmera: ${err.message || 'Verifique as permissões do navegador.'}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const getStatusIcon = (category: string, color: string) => {
    if (category.includes('adequada')) return <CheckCircle className={`w-6 h-6 ${color}`} />;
    if (category.includes('baixa') || category.includes('escura')) return <AlertTriangle className={`w-6 h-6 ${color}`} />;
    return <Zap className={`w-6 h-6 ${color}`} />;
  };

  const classifyLighting = (avgLuminance: number, stdDev: number, room: RoomType): Omit<AnalysisResult, 'id' | 'timestamp' | 'avgLuminance' | 'stdDev' | 'roomName' | 'imageBase64'> => {
    let category = "";
    let color = "";
    let message = "";
    let suggestions: string[] = [];

    const min = room.minLuminance;
    const max = room.maxLuminance;

    if (avgLuminance < min * 0.7) {
      category = "Muito escura";
      color = "text-red-500";
      message = `Iluminação crítica para ${room.name.toLowerCase()}. Risco de fadiga visual severa.`;
      suggestions = [
        "Ligue todas as fontes de luz disponíveis.",
        "Abra totalmente as cortinas e janelas.",
        "Considere instalar lâmpadas de maior potência (Lumens)."
      ];
    } else if (avgLuminance < min) {
      category = "Iluminação baixa";
      color = "text-yellow-500";
      message = `Abaixo do recomendado para ${room.name.toLowerCase()}.`;
      suggestions = [
        "Adicione uma luminária de apoio ou mesa.",
        "Aproxime-se da janela se for dia.",
        "Verifique se há lâmpadas queimadas ou sujas."
      ];
    } else if (avgLuminance <= max) {
      category = "Iluminação adequada";
      color = "text-green-500";
      message = `Nível de luz ideal para ${room.name.toLowerCase()} segundo normas técnicas.`;
      suggestions = [
        "Mantenha esta configuração de iluminação.",
        "A uniformidade da luz parece boa para este ambiente.",
        "Lembre-se de descansar os olhos por 5 minutos a cada hora."
      ];
    } else {
      category = "Iluminação excessiva";
      color = "text-orange-500";
      message = `Luz muito intensa para ${room.name.toLowerCase()}. Risco de ofuscamento.`;
      suggestions = [
        "Use cortinas translúcidas para difundir a luz solar.",
        "Reduza a intensidade de lâmpadas dimerizáveis.",
        "Evite reflexos diretos em telas ou superfícies brilhantes."
      ];
    }

    let distribution = "";
    if (stdDev > 50) {
      distribution = "Irregular (Sombras Fortes)";
      suggestions.push("Tente usar iluminação indireta para suavizar as sombras no ambiente.");
    } else {
      distribution = "Uniforme";
    }

    return { category, color, message, suggestions, distribution };
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    
    // Previne erro se o vídeo ainda não carregou os metadados (largura/altura = 0)
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("A câmera ainda está inicializando. Aguarde um momento e tente novamente.");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalLuminance = 0;
    const luminanceValues: number[] = [];

    // Process pixels (RGB to Grayscale)
    // Formula: L = 0.299*R + 0.587*G + 0.114*B
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += luminance;
      luminanceValues.push(luminance);
    }

    const avgLuminance = totalLuminance / luminanceValues.length;

    // Calculate standard deviation for distribution
    let varianceSum = 0;
    for (let i = 0; i < luminanceValues.length; i++) {
      varianceSum += Math.pow(luminanceValues[i] - avgLuminance, 2);
    }
    const stdDev = Math.sqrt(varianceSum / luminanceValues.length);

    const classification = classifyLighting(avgLuminance, stdDev, selectedRoom);
    
    // Get base64 image for AI analysis later
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    const newResult: AnalysisResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      avgLuminance,
      stdDev,
      ...classification,
      roomName: selectedRoom.name,
      imageBase64: base64Image
    };

    setResult(newResult);
    setIsSaved(false);
    setIsAnalyzing(false);
  };

  const handleManualSave = () => {
    if (result && !isSaved) {
      saveToHistory(result);
      setIsSaved(true);
    }
  };

  const saveToHistory = (analysis: AnalysisResult) => {
    try {
      const savedHistory = localStorage.getItem('lumicheck_history');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Create a copy without the heavy image data for history storage
      const { imageBase64, ...historyItem } = analysis;
      
      // Keep only last 20 analyses
      const updatedHistory = [historyItem, ...history].slice(0, 20);
      localStorage.setItem('lumicheck_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Erro ao salvar no histórico:", e);
      alert("Não foi possível salvar no histórico. O espaço de armazenamento pode estar cheio.");
    }
  };

  const runAiAnalysis = async () => {
    if (!result?.imageBase64) return;
    
    setIsAiAnalyzing(true);
    try {
      const analysis = await analyzeImageWithAI(result.imageBase64, 'image/jpeg');
      setAiAnalysis(analysis || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error("Erro na análise da IA:", error);
      setAiAnalysis("Ocorreu um erro ao comunicar com a IA.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setAiAnalysis(null);
    setIsSaved(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {!result ? (
        <div className="flex-1 flex flex-col relative">
          {cameraError ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>{cameraError}</p>
                <button 
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 bg-red-100 rounded-lg font-medium hover:bg-red-200"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex-1 bg-black overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Target Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <p className="bg-black/50 text-white inline-block px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  Aponte para o seu ambiente de estudo/trabalho
                </p>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <button
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing || !stream}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-zinc-200 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-8 h-8 text-zinc-800 animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-zinc-800" />
                  )}
                </button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 bg-gradient-to-b from-zinc-50 to-zinc-100">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Análise de Iluminação</h2>
                <p className="text-zinc-500 text-sm">Resultados baseados na captura atual</p>
              </div>
              <button 
                onClick={resetAnalysis}
                className="p-3 bg-white text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl shadow-sm border border-zinc-200 transition-all active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Main Result Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-zinc-200/50 border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="flex items-center gap-5 mb-6">
                <div className={`p-4 rounded-2xl ${result.color.replace('text-', 'bg-').replace('500', '100')} shadow-inner`}>
                  {getStatusIcon(result.category, result.color)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold ${result.color}`}>{result.category}</h3>
                  <p className="text-zinc-600">{result.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-zinc-100">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Intensidade</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-bold text-zinc-900">{Math.round(result.avgLuminance)}</span>
                    <span className="text-sm text-zinc-400 font-medium">/ 255</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Uniformidade</p>
                  <p className="text-lg font-semibold text-zinc-800">{result.distribution}</p>
                </div>
              </div>

              {/* Save to History Button */}
              <div className="mt-6">
                <button
                  onClick={handleManualSave}
                  disabled={isSaved}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isSaved 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Salvo no Histórico
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar no Histórico
                    </>
                  )}
                </button>
              </div>

              {/* Room Comparison Section */}
              <div className="mt-6 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-500" />
                    Adequação por Ambiente
                  </h4>
                  <button 
                    onClick={() => setShowRoomSelector(!showRoomSelector)}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    Alterar Sala
                  </button>
                </div>

                {showRoomSelector && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">Selecione o Ambiente</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ROOM_TYPES.map(room => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowRoomSelector(false);
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                            selectedRoom.id === room.id 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                              : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-indigo-200 hover:bg-white'
                          }`}
                        >
                          <div className={`${selectedRoom.id === room.id ? 'text-white' : 'text-indigo-500'}`}>
                            {room.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tighter">{room.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600">
                      {selectedRoom.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none mb-1">Ambiente Selecionado</p>
                      <h5 className="font-bold text-zinc-900 leading-none">{selectedRoom.name}</h5>
                    </div>
                  </div>

                  {/* Comparison Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                      <span>Recomendado: {selectedRoom.minLuminance} - {selectedRoom.maxLuminance}</span>
                      <span>Atual: {Math.round(result.avgLuminance)}</span>
                    </div>
                    
                    <div className="h-3 bg-zinc-200/50 rounded-full overflow-hidden relative">
                      {/* Ideal Range Highlight */}
                      <div 
                        className="absolute h-full bg-indigo-200/50"
                        style={{ 
                          left: `${(selectedRoom.minLuminance / 255) * 100}%`, 
                          width: `${((selectedRoom.maxLuminance - selectedRoom.minLuminance) / 255) * 100}%` 
                        }}
                      />
                      {/* Current Value Marker */}
                      <div 
                        className={`absolute h-full transition-all duration-1000 ease-out rounded-full shadow-sm ${
                          result.avgLuminance >= selectedRoom.minLuminance && result.avgLuminance <= selectedRoom.maxLuminance
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${(result.avgLuminance / 255) * 100}%` }}
                      />
                    </div>
                    
                    <p className={`text-xs font-bold text-center mt-2 ${
                      result.avgLuminance >= selectedRoom.minLuminance && result.avgLuminance <= selectedRoom.maxLuminance
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}>
                      {result.avgLuminance < selectedRoom.minLuminance 
                        ? `⚠️ Abaixo do recomendado para ${selectedRoom.name.toLowerCase()}.`
                        : result.avgLuminance > selectedRoom.maxLuminance
                        ? `⚠️ Acima do recomendado para ${selectedRoom.name.toLowerCase()}.`
                        : `✅ Iluminação ideal para ${selectedRoom.name.toLowerCase()}!`}
                    </p>

                    <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                      <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <div className="text-[11px] text-indigo-700 leading-relaxed">
                        <p className="font-bold mb-0.5">Norma Técnica:</p>
                        <p>{selectedRoom.technicalStandard || 'Padrões recomendados de ergonomia visual.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-zinc-200/50 border border-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-inner">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 uppercase tracking-tight">Dicas do Lumizinho</h4>
                  <p className="text-xs text-zinc-500 font-medium">Sugestões personalizadas para você</p>
                </div>
              </div>
              <ul className="space-y-4">
                {result.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                    </div>
                    <span className="text-zinc-700 text-sm leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-indigo-900">Análise Avançada com IA</h3>
                </div>
              </div>
              
              {!aiAnalysis ? (
                <div>
                  <p className="text-indigo-800/80 text-sm mb-4">
                    Obtenha uma análise detalhada da ergonomia visual do seu ambiente usando o modelo Gemini 3.1 Pro.
                  </p>
                  <button
                    onClick={runAiAnalysis}
                    disabled={isAiAnalyzing}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isAiAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analisando imagem...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Gerar Análise Detalhada
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="prose prose-sm prose-indigo max-w-none">
                  <div className="markdown-body text-indigo-950">
                    <Markdown>{aiAnalysis}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
