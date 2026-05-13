import React from 'react';
import { Vehicle, LANES, PowerUp, HIGHWAYS } from '../types';
import { Vehicle as VehicleComponent } from './Vehicle';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, MapPin } from 'lucide-react';

interface RoadProps {
  playerLane: number;
  traffic: Vehicle[];
  powerUps: PowerUp[];
  isNitroActive: boolean;
  isGameOver: boolean;
  highwayName: string;
  onSteer: (direction: 'left' | 'right') => void;
}

export const Road: React.FC<RoadProps> = ({ playerLane, traffic, powerUps, isNitroActive, isGameOver, highwayName, onSteer }) => {
  const [particles, setParticles] = React.useState<{id: number, x: number, y: number, life: number}[]>([]);
  
  const highwayInfo = HIGHWAYS.find(h => h.name === highwayName) || HIGHWAYS[0];
  
  // Tire smoke / exhaust effect
  React.useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev.map(p => ({ ...p, y: p.y + 2, life: p.life - 0.1 })).filter(p => p.life > 0),
        { id: Math.random() + Date.now(), x: (Math.random() - 0.5) * 15, y: -5, life: 1.5 }
      ].slice(-30));
    }, isNitroActive ? 30 : 80);
    return () => clearInterval(interval);
  }, [isNitroActive, isGameOver]);

  const handleSteerZone = (direction: 'left' | 'right') => {
    onSteer(direction);
  };

  return (
    <motion.div 
      onPanEnd={(_, info) => {
        const threshold = 30;
        if (info.offset.x > threshold) onSteer('right');
        else if (info.offset.x < -threshold) onSteer('left');
      }}
      animate={isGameOver ? {
        x: [0, -15, 15, -10, 10, -5, 5, 0],
        y: [0, 5, -5, 3, -3, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
      } : {}}
      className={`relative border-x-8 border-slate-700 rounded-lg shadow-2xl overflow-hidden w-[220px] sm:w-[260px] h-[500px] sm:h-[600px] touch-none mx-auto transition-colors duration-500 ${isNitroActive ? 'ring-4 ring-yellow-400 ring-inset shadow-[0_0_50px_rgba(250,204,21,0.2)]' : ''} ${isGameOver ? 'scale-[1.02]' : ''}`}
      style={{ backgroundColor: highwayInfo.color }}
    >
      {/* Impact Flash */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 pointer-events-none animate-impact-flash" />
      )}

      {/* Collision Sparks */}
      <AnimatePresence>
        {isGameOver && (
          <div className="absolute inset-x-0 top-[75%] h-20 z-40 pointer-events-none flex items-center justify-center">
            <div className="relative w-20 h-20">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`spark-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 80,
                    y: (Math.random() - 0.5) * 80,
                  }}
                  transition={{ duration: 0.5, delay: Math.random() * 0.2 }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-[1px]"
                  style={{ 
                    left: '50%',
                    top: '50%'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Highway Name Badge */}
      <motion.div 
        key={highwayName}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1 shadow-lg"
      >
        <MapPin size={10} className="text-red-500 fill-current" />
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white whitespace-nowrap">{highwayName}</span>
      </motion.div>

      {/* Nitro Speed Lines Overlay */}
      <AnimatePresence>
        {isNitroActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20"
          >
            {/* Rapid Speed Lines */}
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 800, opacity: [0, 1, 1, 0] }}
                transition={{ 
                  duration: 0.15 + (Math.random() * 0.1), 
                  repeat: Infinity, 
                  delay: Math.random() * 0.5, 
                  ease: "linear" 
                }}
                className={`absolute ${i % 3 === 0 ? 'w-1 h-32 bg-white/40' : 'w-0.5 h-20 bg-yellow-400/30'} blur-[1px]`}
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
            
            {/* Lateral Edge Glow */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-yellow-400/20 to-transparent animate-pulse" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-yellow-400/20 to-transparent animate-pulse" />
            
            <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay animate-[flicker_0.1s_infinite]" />
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
        <div className={`h-[200%] w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] ${isNitroActive ? 'animate-scroll-road-fast' : 'animate-scroll-road'}`} />
      </div>
      
      {/* Nitro Blur Effect */}
      {isNitroActive && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 via-transparent to-yellow-400/10 pointer-events-none z-10 animate-pulse" />
      )}

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
          scale: isNitroActive ? 1.15 : 1,
          rotate: isGameOver ? 20 : 0
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="absolute w-10 h-14 sm:w-12 sm:h-18 top-[75%] z-10"
        style={{ 
          transform: 'translateX(-50%)'
        }}
      >
        <div className="relative h-full w-full">
          {/* Exhaust Particles */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 pointer-events-none">
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0.6, scale: 0.5, x: p.x, y: p.y }}
                animate={{ opacity: 0, scale: 2, y: p.y + (isNitroActive ? 40 : 20) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`absolute w-3 h-3 rounded-full blur-[2px] ${isNitroActive ? 'bg-orange-500/40' : 'bg-slate-400/20'}`}
              />
            ))}
          </div>

          {isNitroActive && (
            <>
              {/* Nitro Aura */}
              <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1.2, y: 15 }}
                transition={{ repeat: Infinity, duration: 0.05, repeatType: "reverse" }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-yellow-500 flex flex-col items-center"
              >
                <Flame size={20} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(234,179,8,1)]" />
                <Flame size={12} fill="currentColor" className="-mt-2 opacity-60" />
              </motion.div>
            </>
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
    </motion.div>
  );
};
