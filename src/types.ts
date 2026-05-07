import React from 'react';

export interface RoomType {
  id: string;
  name: string;
  icon: React.ReactNode;
  minLuminance: number;
  maxLuminance: number;
  description: string;
  technicalStandard?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  avgLuminance: number;
  stdDev: number;
  category: string;
  color: string;
  message: string;
  suggestions: string[];
  distribution: string;
  roomName: string;
  imageBase64?: string;
}
