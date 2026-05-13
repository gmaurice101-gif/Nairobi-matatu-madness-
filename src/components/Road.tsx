import React from 'react';
import { Vehicle, LANES, PowerUp } from '../types';
import { Vehicle as VehicleComponent } from './Vehicle';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap } from 'lucide-react';

interface RoadProps {
  playerLane: number;
  traffic: Vehicle[];
  powerUps: PowerUp[];
  isNitroActive: boolean;
  onSteer: (direction: 'left' | 'right') => void;
}

export const Road: React.FC<RoadProps> = ({ playerLane, traffic, powerUps, isNitroActive, onSteer }) => {
  const handleSteerZone = (direction: 'left' | 'right') => {
    onSteer(direction);
  };

  return (
    <div 
      className={`relative bg-slate-800 border-x-8 border-slate-700 rounded-lg shadow-2xl overflow-hidden w-[220px] sm:w-[260px] h-[500px] sm:h-[600px] touch-none mx-auto transition-colors duration-300 ${isNitroActive ? 'ring-4 ring-yellow-400 ring-inset' : ''}`}
    >
      {/* Nitro Speed Lines Overlay */}
      <AnimatePresence>
        {isNitroActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ y: -100 }}
                animate={{ y: 600 }}
                transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05, ease: "linear" }}
                className="absolute w-0.5 h-20 bg-yellow-400/30"
                style={{ left: `${(i + 1) * 15}%` }}
              />
            ))}
            <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Lane Markers */}
      <div className="absolute inset-0 flex justify-evenly pointer-events-none">
        {Array.from({ length: LANES - 1 }).map((_, i) => (
          <div key={i} className="h-full w-0.5 border-r border-dashed border-white/20" />
        ))}
      </div>

      {/* Road Texture/Scrolling effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="h-[200%] w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] animate-scroll-road" />
      </div>

      {/* Kenyan Road Themes: Signs and Markings */}
      <div className="absolute top-20 -left-4 w-12 h-12 bg-yellow-500 rounded-sm rotate-45 border-2 border-black flex items-center justify-center opacity-40">
        <span className="text-[8px] font-bold text-black -rotate-45">NAIROBI</span>
      </div>
      <div className="absolute top-80 -right-4 w-12 h-12 bg-yellow-500 rounded-sm rotate-45 border-2 border-black flex items-center justify-center opacity-40">
        <span className="text-[8px] font-bold text-black -rotate-45">MOMBASA</span>
      </div>

      {/* Potholes (Kenyan theme detail) */}
      <div className="absolute top-40 left-10 w-8 h-4 bg-black/20 rounded-full blur-sm" />
      <div className="absolute top-[500px] right-12 w-10 h-6 bg-black/20 rounded-full blur-sm" />

      {/* Street Lights */}
      {[100, 250, 400, 550].map((y) => (
        <div key={`light-${y}`} className="absolute w-0.5 h-6 bg-slate-600 -left-1" style={{ top: `${y}px` }}>
          <div className="absolute -top-1 -right-1.5 w-2 h-0.5 bg-slate-500 rounded-full" />
          <div className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-yellow-200/40 rounded-full blur-[1px] animate-pulse" />
        </div>
      ))}

      {/* Road Signs */}
      <div className="absolute top-[15%] -right-2 w-6 h-6 bg-white border-2 border-red-600 rounded-full flex items-center justify-center shadow-md rotate-12">
        <span className="text-[8px] font-bold text-black">80</span>
      </div>
      <div className="absolute top-[60%] -left-2 w-6 h-6 bg-blue-600 border-2 border-white rounded-sm flex items-center justify-center shadow-md -rotate-12">
        <div className="w-3 h-1 bg-white" />
      </div>

      {/* Pedestrians (on the "sidewalk" edges) */}
      <div className="absolute top-[150px] -left-3 flex flex-col items-center opacity-60">
        <div className="w-2 h-2 bg-orange-400 rounded-full" />
        <div className="w-3 h-4 bg-blue-500 rounded-t-sm" />
      </div>
      <div className="absolute top-[450px] -right-3 flex flex-col items-center opacity-60">
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <div className="w-3 h-4 bg-red-500 rounded-t-sm" />
      </div>

      {/* Traffic */}
      {traffic.map((v) => (
        <div 
          key={v.id} 
          className="absolute w-10 h-14 sm:w-12 sm:h-18 z-0"
          style={{ 
            left: `${(v.lane * (100 / LANES)) + (100 / LANES / 2)}%`,
            top: `${v.y}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <VehicleComponent color={v.color} type={v.type} />
        </div>
      ))}

      {/* Power Ups */}
      {powerUps.map((p) => (
        <motion.div 
          key={p.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-8 h-8 sm:w-10 sm:h-10 z-10 flex items-center justify-center"
          style={{ 
            left: `${(p.lane * (100 / LANES)) + (100 / LANES / 2)}%`,
            top: `${p.y}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md animate-pulse" />
            <div className="relative bg-yellow-400 p-2 rounded-full border-2 border-white shadow-lg">
              <Zap className="text-slate-950 w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Player */}
      <motion.div 
        animate={{ 
          left: `${(playerLane * (100 / LANES)) + (100 / LANES / 2)}%`,
          scale: isNitroActive ? 1.1 : 1
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="absolute w-10 h-14 sm:w-12 sm:h-18 top-[75%] z-10"
        style={{ 
          transform: 'translateX(-50%)'
        }}
      >
        <div className="relative h-full w-full">
          {isNitroActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1.2, y: 10 }}
              transition={{ repeat: Infinity, duration: 0.1, repeatType: "reverse" }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-orange-500"
            >
              <Flame size={24} fill="currentColor" />
            </motion.div>
          )}
          <VehicleComponent color="yellow" type="matatu" isPlayer />
        </div>
      </motion.div>

      {/* Explicit Steering Zones (Side Controls) */}
      <div className="absolute inset-0 flex z-30">
        <div 
          onPointerDown={() => handleSteerZone('left')}
          className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
          aria-label="Steer Left"
        />
        <div 
          onPointerDown={() => handleSteerZone('right')}
          className="w-1/2 h-full cursor-pointer active:bg-white/5 transition-colors"
          aria-label="Steer Right"
        />
      </div>
    </div>
  );
};
