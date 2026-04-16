import React from 'react';
import { Color, COLORS, VehicleType } from '../types';

interface VehicleProps {
  color: Color;
  type: VehicleType;
  isPlayer?: boolean;
}

export const Vehicle: React.FC<VehicleProps> = ({ color, type, isPlayer }) => {
  const baseColor = COLORS[color];
  
  // Kenyan-themed graffiti patterns (mostly for matatus)
  const graffitiPatterns = [
    "NAIROBI", "254", "CITY HOOPA", "JAMBO", "KIBERA", "WESTLANDS", "MATWANA", "NGANYA"
  ];
  const pattern = graffitiPatterns[color.length % graffitiPatterns.length];

  const renderVehicleBody = () => {
    switch (type) {
      case 'boda-boda':
      case 'bicycle':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Frame */}
            <div className="w-1 h-12 bg-slate-700 rounded-full" />
            {/* Handlebars */}
            <div className="absolute top-4 w-6 h-1 bg-slate-800 rounded-full" />
            {/* Rider (top view) */}
            <div className="absolute top-6 w-4 h-4 bg-slate-400 rounded-full shadow-md" />
            {/* Wheels */}
            <div className="absolute top-1 w-1 h-4 bg-black rounded-full" />
            <div className="absolute bottom-1 w-1 h-4 bg-black rounded-full" />
          </div>
        );
      case 'tuk-tuk':
        return (
          <div className="w-full h-full relative rounded-t-xl rounded-b-md overflow-hidden shadow-lg" style={{ backgroundColor: baseColor }}>
            <div className="absolute top-0 left-0 right-0 h-4 bg-slate-800/80" /> {/* Windshield */}
            <div className="absolute top-6 left-1 right-1 bottom-1 border border-white/20 rounded-sm" /> {/* Cabin */}
            <div className="absolute -left-1 top-8 w-2 h-4 bg-slate-900 rounded-sm" /> {/* Side wheels */}
            <div className="absolute -right-1 top-8 w-2 h-4 bg-slate-900 rounded-sm" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-100 rounded-full blur-[1px]" /> {/* Front light */}
          </div>
        );
      case 'truck':
      case 'lorry':
        return (
          <div className="w-full h-full relative flex flex-col">
            {/* Cab */}
            <div className="w-full h-1/3 bg-slate-700 rounded-t-md relative overflow-hidden">
              <div className="absolute top-1 left-1 right-1 h-2 bg-slate-800/80 rounded-sm" />
              <div className="absolute top-0 left-1 w-2 h-1 bg-yellow-100 rounded-full" />
              <div className="absolute top-0 right-1 w-2 h-1 bg-yellow-100 rounded-full" />
            </div>
            {/* Cargo Area */}
            <div className="w-full h-2/3 bg-slate-600 border-t-2 border-slate-800 relative shadow-inner" style={{ backgroundColor: type === 'truck' ? baseColor : '#4a5568' }}>
              <div className="absolute inset-2 border border-white/10 flex items-center justify-center">
                <div className="w-full h-px bg-white/5 rotate-45" />
                <div className="w-full h-px bg-white/5 -rotate-45" />
              </div>
            </div>
            {/* Wheels */}
            <div className="absolute top-4 -left-1 w-2 h-6 bg-slate-900 rounded-sm" />
            <div className="absolute top-4 -right-1 w-2 h-6 bg-slate-900 rounded-sm" />
            <div className="absolute bottom-4 -left-1 w-2 h-6 bg-slate-900 rounded-sm" />
            <div className="absolute bottom-4 -right-1 w-2 h-6 bg-slate-900 rounded-sm" />
          </div>
        );
      case 'bus':
      case 'matatu':
      default:
        const isSmall = type === 'taxi' || type === 'suv';
        return (
          <div
            className={`w-full h-full relative rounded-md overflow-hidden shadow-lg ${isSmall ? 'scale-90' : ''}`}
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

            {/* Roof Graffiti (Only for Matatus) */}
            {type === 'matatu' && (
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
            )}

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
    }
  };

  return (
    <div className="w-full h-full">
      {renderVehicleBody()}
    </div>
  );
};
