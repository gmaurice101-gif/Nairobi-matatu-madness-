import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Road } from './components/Road';
import { Vehicle } from './components/Vehicle';
import { Messaging } from './components/Messaging';
import { Bluetooth } from './components/Bluetooth';
import { Leaderboard } from './components/Leaderboard';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Zap, LogIn, User as UserIcon, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NAIROBI_WISDOM } from './constants';

import { DifficultyLevel, DIFFICULTY_CONFIG } from './types';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const {
    playerLane,
    traffic,
    powerUps,
    score,
    gameOver,
    level,
    highwayName,
    isPaused,
    isNitroActive,
    resetGame,
    setIsPaused,
    highScore,
    setHighScore
  } = useGame(difficulty, gameStarted);

  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPrinciple, setCurrentPrinciple] = useState(NAIROBI_WISDOM[0]);
  const [isMobileLeaderboardOpen, setIsMobileLeaderboardOpen] = useState(false);

  useEffect(() => {
    if (gameOver && user) {
      // Sync high score to firestore
      setDoc(doc(db, 'users', user.uid), {
        highScore: highScore,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
  }, [gameOver, highScore, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Update user profile in Firestore
        setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastSeen: serverTimestamp(),
          isOnline: true
        }, { merge: true });

        // Retrieve existing high score
        const path = `users/${currentUser.uid}`;
        onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.highScore > highScore) {
              setHighScore(data.highScore);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (gameOver) {
      // Pick a random wisdom on crash
      const randomIdx = Math.floor(Math.random() * NAIROBI_WISDOM.length);
      setCurrentPrinciple(NAIROBI_WISDOM[randomIdx]);

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

  const handleRestart = () => {
    resetGame();
    setGameStarted(true);
  };

  const handleSteer = (direction: 'left' | 'right') => {
    if (isPaused) return;
    if (gameOver) {
      handleRestart();
      return;
    }
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
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start mt-12 md:mt-0">
        
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
              <Trophy size={12} className="sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest">Points</span>
            </div>
            <div className="text-xl sm:text-4xl font-display font-bold text-yellow-500">
              {score.toLocaleString()}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center group">
              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-500">Personal Best</span>
              <span className="text-[10px] sm:text-xs font-display font-bold text-slate-300">{highScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <RotateCcw size={12} className="sm:w-4 sm:h-4" />
                <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest">Highway</span>
              </div>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                'bg-red-500/20 text-red-500'
              }`}>
                {difficulty}
              </span>
            </div>
            <div className="text-xl sm:text-4xl font-display font-bold text-green-400">
              {level}
            </div>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter block mt-1">{highwayName}</span>
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
          <Road 
            playerLane={playerLane} 
            traffic={traffic} 
            powerUps={powerUps}
            isNitroActive={isNitroActive}
            isGameOver={gameOver}
            highwayName={highwayName}
            onSteer={handleSteer} 
          />
          
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

                <div className="flex flex-col gap-3 w-full mb-8">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Intensity</span>
                  <div className="flex gap-2 justify-center">
                    {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDifficulty(level);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${
                          difficulty === level 
                            ? level === 'Easy' ? 'bg-green-500 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                              level === 'Medium' ? 'bg-yellow-400 border-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.3)]' :
                              'bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-900/20 text-sm"
                >
                  <Play fill="currentColor" size={20} />
                  START ENGINE
                </button>
              </motion.div>
            )}

            {gameOver && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleRestart}
                className="absolute inset-0 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center rounded-lg z-[100] cursor-pointer"
              >
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-xs bg-slate-900/90 p-4 rounded-xl border border-red-500/30 mb-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 text-red-400 mb-2 justify-center">
                    <BookOpen size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nairobi Wisdom #{currentPrinciple.number}</span>
                  </div>
                  <h3 className="text-white font-display font-bold text-lg mb-2 uppercase tracking-tight">{currentPrinciple.title}</h3>
                  <p className="text-slate-300 text-[11px] leading-relaxed italic">"{currentPrinciple.lesson}"</p>
                </motion.div>

                <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-1 sm:mb-2">CRASHED!</h2>
                <p className="text-slate-300 text-[10px] sm:text-xs mb-4 sm:mb-6 uppercase tracking-widest font-bold opacity-60">Nairobi traffic is ruthless.</p>
                <div className="text-3xl sm:text-5xl font-display font-bold text-yellow-400 mb-4 sm:mb-8">{score.toLocaleString()}</div>
                <button 
                  className="bg-white text-slate-950 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base pr-8"
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

          <div className="hidden md:block w-full">
            <Leaderboard />
          </div>
        </div>
      </div>

      {/* Global Comms Overlays (Responsive) */}
      <Messaging />
      <Bluetooth />

      {/* Mobile Collapsible Leaderboard */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsMobileLeaderboardOpen(true)}
          className="fixed bottom-24 right-4 z-[60] w-12 h-12 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900 active:scale-90 transition-transform"
        >
          <Trophy size={20} />
        </button>

        <AnimatePresence>
          {isMobileLeaderboardOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileLeaderboardOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-slate-900 z-[101] shadow-2xl p-6 border-l border-slate-800"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={24} />
                    <h2 className="text-xl font-display font-black text-white italic tracking-tighter">LEGENDS</h2>
                  </div>
                  <button 
                    onClick={() => setIsMobileLeaderboardOpen(false)}
                    className="p-2 text-slate-500 hover:text-white"
                  >
                    <RotateCcw className="rotate-45" size={20} />
                  </button>
                </div>
                <Leaderboard />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
    </div>
  );
}
