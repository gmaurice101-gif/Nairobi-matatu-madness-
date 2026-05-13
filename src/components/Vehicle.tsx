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
      case 'ambulance':
        return (
          <div className="w-full h-full relative bg-white rounded-md overflow-hidden shadow-lg border-2 border-red-500/50">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-8 h-2 bg-red-600 rotate-90" />
              <div className="w-8 h-2 bg-red-600" />
            </div>
            {/* Flashing Lights */}
            <div className="absolute -top-1 left-2 w-3 h-2 bg-red-500 animate-pulse" />
            <div className="absolute -top-1 right-2 w-3 h-2 bg-blue-500 animate-pulse delay-75" />
            <div className="absolute top-2 left-1 right-1 h-3 bg-slate-800/80 rounded-sm" />
          </div>
        );
      case 'probox':
        return (
          <div className="w-full h-full relative rounded-md overflow-hidden shadow-lg bg-white" style={{ backgroundColor: baseColor }}>
            <div className="absolute top-2 left-1 right-1 h-2 bg-slate-800/80 rounded-sm" />
            <div className="absolute bottom-1 left-1 right-1 h-4 bg-slate-900/10 border-t border-black/10" /> {/* Extended cargo */}
            <div className="absolute -bottom-1 left-1 w-2 h-1 bg-red-600" />
            <div className="absolute -bottom-1 right-1 w-2 h-1 bg-red-600" />
          </div>
        );
      case 'hilux':
        return (
          <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-2/5 bg-slate-700 rounded-t-lg relative" style={{ backgroundColor: baseColor }}>
              <div className="absolute top-2 left-1 right-1 h-1.5 bg-slate-800/80 rounded-sm" />
            </div>
            <div className="w-full h-3/5 bg-slate-600 border-x-2 border-slate-800 relative shadow-inner overflow-hidden">
               {/* Truck bed */}
              <div className="absolute inset-x-1 top-0 bottom-1 bg-black/20 rounded-sm" />
            </div>
          </div>
        );
      case 'canter':
        return (
          <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-1/4 bg-slate-100 rounded-t-sm" style={{ backgroundColor: baseColor }}>
              <div className="absolute top-1 left-1 right-1 h-1.5 bg-slate-800/80 rounded-sm" />
            </div>
            <div className="w-full h-3/4 bg-slate-300 border-t-2 border-slate-800 relative">
              <div className="absolute inset-0 flex flex-col gap-1 p-1">
                <div className="w-full h-1 bg-black/10" />
                <div className="w-full h-1 bg-black/10" />
                <div className="w-full h-1 bg-black/10" />
              </div>
            </div>
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
        return (
          <div className="w-full h-full relative rounded-b-md shadow-lg overflow-hidden flex flex-col" style={{ backgroundColor: baseColor }}>
            {/* Bus roof */}
            <div className="absolute inset-x-2 top-4 bottom-4 border border-black/10 rounded-sm" />
            <div className="h-1/5 bg-slate-800/20" /> {/* Front */}
            <div className="flex-1 flex flex-col gap-2 p-1 pt-4">
              <div className="h-1 bg-white/20 w-full" />
              <div className="h-1 bg-white/20 w-full" />
              <div className="h-1 bg-white/20 w-full" />
            </div>
            {/* Destination Board */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded-sm">
              <span className="text-[4px] text-yellow-400 font-bold uppercase">CITY HOPPER</span>
            </div>
          </div>
        );
      case 'matatu':
      default:
        const isSmall = type === 'taxi' || type === 'suv' || type === 'probox' || type === 'ambulance';
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
