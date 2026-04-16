import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Road } from './components/Road';
import { Vehicle } from './components/Vehicle';
import { Messaging } from './components/Messaging';
import { Bluetooth } from './components/Bluetooth';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Zap, LogIn, User as UserIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const {
    playerLane,
    traffic,
    score,
    gameOver,
    level,
    isPaused,
    resetGame,
    setIsPaused
  } = useGame(gameStarted);

  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (gameOver) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#008751', '#BB0A1E']
      });
    }
  }, [gameOver]);

  const handleStart = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSteer = (direction: 'left' | 'right') => {
    if (gameOver || isPaused) return;
    const event = new KeyboardEvent('keydown', { 
      key: direction === 'left' ? 'ArrowLeft' : 'ArrowRight' 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start md:justify-center p-4 pb-32 font-sans relative overflow-y-auto overflow-x-hidden">
      {/* Nairobi Skyline Background */}
      <div className="fixed bottom-0 left-0 right-0 h-64 opacity-20 pointer-events-none z-0">
        <div className="absolute bottom-0 left-1/4 w-32 h-48 bg-slate-800 rounded-t-lg" />
        <div className="absolute bottom-0 left-1/3 w-24 h-64 bg-slate-700 rounded-t-lg" />
        <div className="absolute bottom-0 left-1/2 w-40 h-56 bg-slate-800 rounded-t-lg" />
        <div className="absolute bottom-0 left-2/3 w-28 h-72 bg-slate-700 rounded-t-lg" />
        <div className="absolute bottom-0 left-3/4 w-36 h-40 bg-slate-800 rounded-t-lg" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-900" />
      </div>

      {/* Auth Bar */}
      <div className="fixed top-4 right-4 z-50">
        {user ? (
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-xl">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user.displayName}</span>
            <button onClick={() => auth.signOut()} className="text-slate-500 hover:text-white transition-colors">
              <RotateCcw size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 bg-yellow-400 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-xl hover:scale-105 transition-transform"
          >
            <LogIn size={14} />
            LOGIN TO CHAT
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start mt-12 md:mt-0">
        
        {/* Left Side: Stats */}
        <div className="flex flex-row md:flex-col gap-2 sm:gap-4 w-full md:w-48">
          <div className="flex-1 bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Game</span>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Trophy size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest">Score</span>
            </div>
            <div className="text-xl sm:text-4xl font-display font-bold text-yellow-400">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="flex-1 bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <RotateCcw size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest">Level</span>
            </div>
            <div className="text-xl sm:text-4xl font-display font-bold text-green-400">
              {level}
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-2 mt-4">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Controls</div>
            <div className="flex flex-col gap-1 text-[10px] text-slate-400">
              <p>• Tap left/right side of road to steer</p>
              <p>• Arrow keys also work</p>
              <p>• P to pause</p>
            </div>
          </div>
        </div>

        {/* Center: Game Board */}
        <div className="relative flex justify-center w-full md:w-auto">
          <Road playerLane={playerLane} traffic={traffic} onSteer={handleSteer} />
          
          <AnimatePresence>
            {!gameStarted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 text-center rounded-lg z-[100]"
              >
                <h1 className="text-3xl sm:text-5xl font-display font-black text-white mb-1 sm:mb-2 tracking-tighter">
                  MATATU <span className="text-yellow-400">RACING</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-8">Nairobi Highway Edition</p>
                
                <div className="relative w-full h-10 sm:h-12 mb-4 sm:mb-8 overflow-hidden bg-slate-900 rounded-full border border-slate-800">
                  <motion.div 
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-2 w-12 h-8"
                  >
                    <Vehicle color="yellow" type="matatu" />
                  </motion.div>
                </div>

                <button 
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20 text-sm sm:text-base"
                >
                  <Play fill="currentColor" size={18} />
                  START ENGINE
                </button>
              </motion.div>
            )}

            {gameOver && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 text-center rounded-lg z-[100]"
              >
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-1 sm:mb-2">CRASHED!</h2>
                <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6">Nairobi traffic is ruthless.</p>
                <div className="text-3xl sm:text-5xl font-display font-bold text-yellow-400 mb-4 sm:mb-8">{score}</div>
                <button 
                  onClick={resetGame}
                  className="bg-white text-slate-950 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <RotateCcw size={18} />
                  TRY AGAIN
                </button>
              </motion.div>
            )}

            {isPaused && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100]"
              >
                <button 
                  onClick={() => setIsPaused(false)}
                  className="bg-yellow-400 text-slate-950 p-4 sm:p-6 rounded-full shadow-2xl transform hover:scale-110 transition-transform"
                >
                  <Play fill="currentColor" size={32} />
                </button>
                <p className="mt-4 font-bold text-white tracking-widest uppercase">Paused</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Extras */}
        <div className="flex flex-row md:flex-col gap-2 sm:gap-4 w-full md:w-48">
          <div className="flex-1 bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Audio</span>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-800 rounded-full flex items-center justify-center animate-spin-slow">
                <Music size={10} className="sm:w-[14px] sm:h-[14px]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[8px] sm:text-[10px] font-bold truncate">Nairobi Vibes</div>
                <div className="text-[6px] sm:text-[8px] text-slate-500 uppercase">Playing</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 sm:mb-4">Status</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap size={14} className="text-yellow-400" />
                <span>Speed: {(level * 10).toFixed(0)} km/h</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-yellow-400"
                  animate={{ width: `${(score % 1000) / 10}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-500">Next Level in {1000 - (score % 1000)}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging & Bluetooth Components */}
      <Messaging />
      <Bluetooth />

      {/* Floating Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
    </div>
  );
}
