import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

export async function analyzeImageWithAI(imageBase64: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          }
        },
        {
          text: "Você é um especialista em ergonomia visual e iluminação de ambientes, com profundo conhecimento nas normas técnicas brasileiras e internacionais, como a ABNT NBR ISO/CIE 8995-1. Analise esta imagem do ambiente. Avalie a qualidade da iluminação, presença de ofuscamento, sombras excessivas ou falta de luz de acordo com os padrões da indústria. Dê sugestões práticas e detalhadas para melhorar o conforto visual do usuário, citando recomendações técnicas quando apropriado."
        }
      ]
    }
  });
  return response.text;
}

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export async function chatWithAI(history: ChatMessage[], message: string) {
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents as any,
    config: {
      systemInstruction: "Você é o Lumizinho, um assistente IA amigável e especialista em iluminação, ergonomia visual e normas técnicas como a ABNT NBR ISO/CIE 8995-1. Você ajuda usuários a entenderem a qualidade da luz em seus ambientes e auxilia desenvolvedores no projeto LumiCheck. Responda em português de forma clara, técnica e amigável. Sempre que possível, fundamente suas dicas em padrões da indústria de iluminação, explicando conceitos como iluminância (Lux), uniformidade e índice de reprodução de cor (IRC).",
    }
  });

  return response.text;
}
