import React from 'react';
import { Color, COLORS, VehicleType } from '../types';

interface MatatuProps {
  color: Color;
  type: VehicleType;
  isPlayer?: boolean;
}

export const Matatu: React.FC<MatatuProps> = ({ color, type, isPlayer }) => {
  const baseColor = COLORS[color];
  
  // Kenyan-themed graffiti patterns
  const graffitiPatterns = [
    "NAIROBI", "254", "CITY HOOPA", "JAMBO", "KIBERA", "WESTLANDS", "MATWANA", "NGANYA"
  ];
  // Use a stable pattern based on color/type or just the first one for now to avoid re-render jitter
  const pattern = graffitiPatterns[color.length % graffitiPatterns.length];

  return (
    <div
      className="w-full h-full relative rounded-md overflow-hidden shadow-lg"
      style={{ 
        backgroundColor: baseColor,
        border: `2px solid rgba(0,0,0,0.3)`,
      }}
    >
      {/* Wheels */}
      <div className="absolute top-4 -left-1 w-2 h-4 bg-slate-900 rounded-sm" />
      <div className="absolute top-4 -right-1 w-2 h-4 bg-slate-900 rounded-sm" />
      <div className="absolute bottom-4 -left-1 w-2 h-4 bg-slate-900 rounded-sm" />
      <div className="absolute bottom-4 -right-1 w-2 h-4 bg-slate-900 rounded-sm" />

      {/* Windshield */}
      <div className="absolute top-2 left-1 right-1 h-2 bg-slate-800/80 rounded-sm" />
      
      {/* Rear Window */}
      <div className="absolute bottom-2 left-1 right-1 h-1 bg-slate-800/80 rounded-sm" />

      {/* Roof Graffiti */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
        <div className="w-4/5 h-1/2 border-2 border-white/20 rounded-sm flex items-center justify-center overflow-hidden">
          <span className="text-[8px] font-black text-white uppercase tracking-tighter rotate-12 scale-150">
            {pattern}
          </span>
        </div>
        <div className="flex gap-1 mt-1">
          <div className="w-1 h-1 bg-red-500 rounded-full" />
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <div className="w-1 h-1 bg-black rounded-full" />
        </div>
      </div>

      {/* Headlights */}
      <div className="absolute -top-1 left-1 w-2 h-2 bg-yellow-100 rounded-full blur-[1px] opacity-80" />
      <div className="absolute -top-1 right-1 w-2 h-2 bg-yellow-100 rounded-full blur-[1px] opacity-80" />

      {/* Taillights */}
      <div className="absolute -bottom-1 left-1 w-2 h-1 bg-red-600 rounded-full" />
      <div className="absolute -bottom-1 right-1 w-2 h-1 bg-red-600 rounded-full" />

      {/* Player Indicator */}
      {isPlayer && (
        <div className="absolute inset-0 border-2 border-white/50 animate-pulse rounded-md" />
      )}

      {/* Type Label */}
      <div className="absolute bottom-0 right-0 p-0.5">
        <span className="text-[5px] font-bold text-black/30 uppercase">
          {type}
        </span>
      </div>
    </div>
  );
};
