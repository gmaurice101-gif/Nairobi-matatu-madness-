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
    const Wheels = ({ large = false } = {}) => (
      <>
        <div className={`absolute top-4 -left-1 ${large ? 'w-2.5 h-6' : 'w-2 h-5'} bg-slate-950 rounded-sm z-[-1] shadow-sm`} />
        <div className={`absolute top-4 -right-1 ${large ? 'w-2.5 h-6' : 'w-2 h-5'} bg-slate-950 rounded-sm z-[-1] shadow-sm`} />
        <div className={`absolute bottom-4 -left-1 ${large ? 'w-2.5 h-6' : 'w-2 h-5'} bg-slate-950 rounded-sm z-[-1] shadow-sm`} />
        <div className={`absolute bottom-4 -right-1 ${large ? 'w-2.5 h-6' : 'w-2 h-5'} bg-slate-950 rounded-sm z-[-1] shadow-sm`} />
      </>
    );

    const Mirrors = () => (
      <>
        <div className="absolute top-3 -left-1.5 w-2 h-1 bg-slate-800 rounded-full" />
        <div className="absolute top-3 -right-1.5 w-2 h-1 bg-slate-800 rounded-full" />
      </>
    );

    const GlassReflect = () => (
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-[-20deg]" />
    );

    switch (type) {
      case 'boda-boda':
      case 'bicycle':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Frame */}
            <div className="w-1.5 h-12 bg-slate-800 rounded-full shadow-sm" />
            {/* Handlebars */}
            <div className="absolute top-4 w-7 h-1.5 bg-slate-900 rounded-full" />
            {/* Rider (top view) */}
            <div className="absolute top-6 w-5 h-5 bg-slate-500 rounded-full shadow-md border border-slate-600" />
            {/* Wheels */}
            <div className="absolute top-1 w-1 h-5 bg-black rounded-full" />
            <div className="absolute bottom-1 w-1 h-5 bg-black rounded-full" />
          </div>
        );
      case 'tuk-tuk':
        return (
          <div className="w-full h-full relative rounded-t-2xl rounded-b-lg overflow-hidden shadow-xl" style={{ backgroundColor: baseColor }}>
            <div className="absolute top-0 left-0 right-0 h-5 bg-slate-800/90 flex overflow-hidden">
               <GlassReflect />
            </div>
            <div className="absolute top-7 left-1 right-1 bottom-1 border-t-2 border-x-2 border-black/20 rounded-t-sm" />
            <div className="absolute -left-1.5 top-10 w-2.5 h-5 bg-slate-950 rounded-sm" />
            <div className="absolute -right-1.5 top-10 w-2.5 h-5 bg-slate-950 rounded-sm" />
            <div className="absolute -bottom-1 left-1/2 -track-x-1/2 w-3 h-4 bg-slate-950 rounded-sm" />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_10px_rgba(254,249,195,0.5)]" />
          </div>
        );
      case 'ambulance':
        return (
          <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border-2 border-red-500/30">
            <Wheels />
            <Mirrors />
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-10 h-2.5 bg-red-600 rotate-90" />
              <div className="w-10 h-2.5 bg-red-600" />
            </div>
            {/* Siren */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-3 h-1.5 bg-red-500 animate-pulse" />
              <div className="w-3 h-1.5 bg-blue-500 animate-pulse delay-75" />
            </div>
            <div className="absolute top-5 left-1 right-1 h-3 bg-slate-900 overflow-hidden rounded-sm">
              <GlassReflect />
            </div>
          </div>
        );
      case 'probox':
        return (
          <div className="w-full h-full relative rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: baseColor }}>
            <Wheels />
            <Mirrors />
            <div className="absolute top-2 left-1 right-1 h-3 bg-slate-900 rounded-sm overflow-hidden">
              <GlassReflect />
            </div>
            <div className="absolute bottom-2 left-1 right-1 h-6 bg-black/5 border-t border-black/10 rounded-sm" />
            {/* Trunk line */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-black/10" />
            <div className="absolute -bottom-0.5 left-1 w-3 h-1.5 bg-red-600 rounded-full" />
            <div className="absolute -bottom-0.5 right-1 w-3 h-1.5 bg-red-600 rounded-full" />
          </div>
        );
      case 'hilux':
        return (
          <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-[45%] bg-slate-700 rounded-t-xl relative shadow-md" style={{ backgroundColor: baseColor }}>
              <Mirrors />
              <div className="absolute top-2 left-1.5 right-1.5 h-3 bg-slate-900 rounded-sm overflow-hidden">
                <GlassReflect />
              </div>
            </div>
            <div className="w-full h-[55%] bg-slate-600 border-x-4 border-slate-800 relative shadow-inner overflow-hidden">
              <div className="absolute inset-1 bg-black/20 rounded-sm shadow-inner" />
              {/* Tailgate handle */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full" />
            </div>
            <Wheels large />
          </div>
        );
      case 'canter':
        return (
          <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-1/4 bg-slate-200 rounded-t-sm shadow-md" style={{ backgroundColor: baseColor }}>
              <Mirrors />
              <div className="absolute top-1 left-1 right-1 h-2 bg-slate-800 rounded-sm" />
            </div>
            <div className="w-full h-3/4 bg-slate-300 border-t-4 border-slate-800 relative shadow-inner">
              <div className="absolute inset-0 flex flex-col gap-1.5 p-2 bg-slate-400/20">
                <div className="w-full h-1 bg-black/5" />
                <div className="w-full h-1 bg-black/5" />
                <div className="w-full h-1 bg-black/5" />
              </div>
            </div>
            <Wheels large />
          </div>
        );
      case 'truck':
      case 'lorry':
        return (
          <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-1/3 bg-slate-800 rounded-t-lg relative shadow-lg overflow-hidden" style={{ backgroundColor: baseColor }}>
              <Mirrors />
              <div className="absolute top-1.5 left-1 right-1 h-3 bg-slate-950 flex overflow-hidden">
                <GlassReflect />
              </div>
              <div className="absolute top-0.5 left-2 right-2 flex justify-between">
                <div className="w-3 h-1 bg-orange-400/50 rounded-full" />
                <div className="w-3 h-1 bg-orange-400/50 rounded-full" />
              </div>
            </div>
            <div className="w-full h-2/3 bg-slate-700 border-t-4 border-slate-900 relative shadow-inner overflow-hidden">
              <div className="absolute inset-2 border-2 border-white/5 opacity-20" />
              <div className="absolute inset-0 flex justify-center gap-2 pt-2">
                <div className="w-px h-full bg-black/10" />
                <div className="w-px h-full bg-black/10" />
              </div>
            </div>
            <div className="absolute top-8 -left-1.5 w-3 h-8 bg-slate-950 rounded-sm" />
            <div className="absolute top-8 -right-1.5 w-3 h-8 bg-slate-950 rounded-sm" />
            <div className="absolute bottom-4 -left-1.5 w-3 h-8 bg-slate-950 rounded-sm" />
            <div className="absolute bottom-4 -right-1.5 w-3 h-8 bg-slate-950 rounded-sm" />
          </div>
        );
      case 'bus':
        return (
          <div className="w-full h-full relative rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: baseColor }}>
            <div className="absolute inset-x-2 top-4 bottom-4 border-2 border-black/10 rounded-md" />
            <div className="h-[15%] bg-slate-950 flex overflow-hidden">
              <GlassReflect />
            </div>
            <div className="flex-1 flex flex-col gap-3 p-2 pt-6 bg-gradient-to-b from-transparent to-black/10">
              <div className="h-1.5 bg-white/10 w-full rounded-full" />
              <div className="h-1.5 bg-white/10 w-full rounded-full" />
              <div className="h-1.5 bg-white/10 w-full rounded-full" />
            </div>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950 px-3 py-1 rounded-sm border border-yellow-500/30">
              <span className="text-[5px] text-yellow-400 font-black uppercase tracking-widest">CITY HOPPER</span>
            </div>
            <div className="absolute top-8 -left-1.5 w-3 h-10 bg-slate-950 rounded-sm" />
            <div className="absolute top-8 -right-1.5 w-3 h-10 bg-slate-950 rounded-sm" />
            <div className="absolute bottom-8 -left-1.5 w-3 h-10 bg-slate-950 rounded-sm" />
            <div className="absolute bottom-8 -right-1.5 w-3 h-10 bg-slate-950 rounded-sm" />
          </div>
        );
      case 'matatu':
      default:
        const isSmall = type === 'taxi' || type === 'suv' || type === 'probox' || type === 'ambulance';
        return (
          <div
            className={`w-full h-full relative rounded-xl shadow-2xl ${isSmall ? 'scale-90' : ''}`}
            style={{ 
              backgroundColor: baseColor,
              border: `2px solid rgba(0,0,0,0.4)`,
              boxShadow: `inset 0 4px 10px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.3)`
            }}
          >
            <Wheels />
            <Mirrors />

            {/* Windshield */}
            <div className="absolute top-2 left-1.5 right-1.5 h-4 bg-slate-950 rounded-sm overflow-hidden">
              <GlassReflect />
            </div>
            
            {/* Rear Window */}
            <div className="absolute bottom-2 left-2 right-2 h-2.5 bg-slate-950 rounded-sm overflow-hidden">
              <GlassReflect />
            </div>

            {/* Roof Detail/Rails for SUV */}
            {type === 'suv' && (
               <div className="absolute inset-x-4 top-8 bottom-8 flex justify-between">
                 <div className="w-1 h-full bg-slate-800/40 rounded-full" />
                 <div className="w-1 h-full bg-slate-800/40 rounded-full" />
               </div>
            )}

            {/* Roof Graffiti (Only for Matatus) */}
            {type === 'matatu' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                <div className="w-full h-2/3 border-2 border-white/30 rounded-xl bg-black/10 flex items-center justify-center overflow-hidden backdrop-blur-[1px]">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter rotate-6 scale-150 drop-shadow-lg">
                    {pattern}
                  </span>
                </div>
                {/* Dynamic Decals */}
                <div className="flex gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full shadow-sm animate-pulse" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-sm animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-green-600 rounded-full shadow-sm animate-pulse delay-150" />
                </div>
              </div>
            )}

            {/* Headlights */}
            <div className="absolute -top-1 left-1.5 w-3 h-2.5 bg-yellow-100 rounded-full blur-[0.8px] shadow-[0_0_12px_rgba(254,249,195,0.6)]" />
            <div className="absolute -top-1 right-1.5 w-3 h-2.5 bg-yellow-100 rounded-full blur-[0.8px] shadow-[0_0_12px_rgba(254,249,195,0.6)]" />

            {/* Turn Signals */}
            <div className="absolute top-1 left-0.5 w-1 h-2 bg-orange-500 rounded-full" />
            <div className="absolute top-1 right-0.5 w-1 h-2 bg-orange-500 rounded-full" />

            {/* Taillights */}
            <div className="absolute -bottom-1 left-2 w-4 h-2 bg-red-700 rounded-full shadow-lg" />
            <div className="absolute -bottom-1 right-2 w-4 h-2 bg-red-700 rounded-full shadow-lg" />

            {/* Player Indicator Aura */}
            {isPlayer && (
              <div className="absolute -inset-1 border-[3px] border-white/60 animate-pulse rounded-2xl z-20" />
            )}

            {/* Branding/License Plate */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-yellow-400 rounded-t-sm flex items-center justify-center">
              <div className="w-4 h-[1px] bg-black/20" />
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
