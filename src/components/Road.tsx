import React from 'react';
import { Vehicle, LANES } from '../types';
import { Matatu } from './Matatu';
import { motion } from 'motion/react';

interface RoadProps {
  playerLane: number;
  traffic: Vehicle[];
  onSteer: (direction: 'left' | 'right') => void;
}

export const Road: React.FC<RoadProps> = ({ playerLane, traffic, onSteer }) => {
  const handleRoadClick = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const midpoint = rect.width / 2;

    if (relativeX < midpoint) {
      onSteer('left');
    } else {
      onSteer('right');
    }
  };

  return (
    <div 
      className="relative bg-slate-800 border-x-8 border-slate-700 rounded-lg shadow-2xl overflow-hidden w-[280px] sm:w-[300px] h-[500px] sm:h-[600px] cursor-pointer touch-none mx-auto"
      onClick={handleRoadClick}
      onTouchStart={handleRoadClick}
    >
      {/* Lane Markers */}
      <div className="absolute inset-0 flex justify-evenly pointer-events-none">
        {Array.from({ length: LANES - 1 }).map((_, i) => (
          <div key={i} className="h-full w-1 border-r-2 border-dashed border-white/20" />
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

      {/* Traffic */}
      {traffic.map((v) => (
        <div 
          key={v.id} 
          className="absolute w-14 h-20 sm:w-16 sm:h-24 z-0"
          style={{ 
            left: `${(v.lane * (100 / LANES)) + (100 / LANES / 2)}%`,
            top: `${v.y}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <Matatu color={v.color} type={v.type} />
        </div>
      ))}

      {/* Player */}
      <motion.div 
        animate={{ left: `${(playerLane * (100 / LANES)) + (100 / LANES / 2)}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="absolute w-14 h-20 sm:w-16 sm:h-24 top-[75%] z-10"
        style={{ 
          transform: 'translateX(-50%)'
        }}
      >
        <Matatu color="yellow" type="matatu" isPlayer />
      </motion.div>

      {/* Control Indicators (Visual feedback) */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-white/0 hover:bg-white/5 transition-colors pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-white/0 hover:bg-white/5 transition-colors pointer-events-none" />
    </div>
  );
};
