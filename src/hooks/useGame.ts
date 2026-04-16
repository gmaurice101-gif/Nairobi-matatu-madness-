import { useState, useEffect, useCallback, useRef } from 'react';
import { Color, COLORS, Vehicle, LANES, VehicleType } from '../types';

const INITIAL_SPEED = 0.5;
const SPEED_INCREMENT = 0.0001;
const SPAWN_RATE = 800; // ms
const PLAYER_Y = 75; // Percentage from top

export function useGame() {
  const [playerLane, setPlayerLane] = useState(1); // Middle lane
  const [traffic, setTraffic] = useState<Vehicle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const playerLaneRef = useRef(playerLane);
  const gameSpeedRef = useRef(gameSpeed);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  useEffect(() => { playerLaneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const getRandomVehicle = useCallback((): Vehicle => {
    const colors = Object.keys(COLORS) as Color[];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const types: VehicleType[] = ['matatu', 'bus', 'tuk-tuk', 'boda-boda', 'taxi'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * LANES);

    return {
      id: `traffic-${crypto.randomUUID()}`,
      lane,
      y: -20, // Start above screen
      color,
      type,
      speed: INITIAL_SPEED + (Math.random() * 0.2),
    };
  }, []);

  const resetGame = () => {
    setTraffic([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setPlayerLane(1);
    setGameSpeed(INITIAL_SPEED);
    spawnTimerRef.current = 0;
  };

  const update = useCallback((time: number) => {
    if (gameOverRef.current || isPausedRef.current) {
      lastTimeRef.current = time;
      gameLoopRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Update traffic (Move + Spawn)
    setTraffic(prev => {
      // Move and filter
      let nextTraffic = prev
        .map(v => ({ ...v, y: v.y + gameSpeedRef.current * deltaTime * 0.2 }))
        .filter(v => v.y < 120);

      // Spawn
      spawnTimerRef.current += deltaTime;
      const spawnThreshold = SPAWN_RATE / (gameSpeedRef.current * 2);
      if (spawnTimerRef.current > spawnThreshold) {
        nextTraffic = [...nextTraffic, getRandomVehicle()];
        spawnTimerRef.current = 0;
      }

      // Collision check
      const collision = nextTraffic.find(v => 
        v.lane === playerLaneRef.current && v.y > PLAYER_Y - 5 && v.y < PLAYER_Y + 15
      );

      if (collision) {
        setGameOver(true);
      }

      return nextTraffic;
    });

    // Update score and speed
    setScore(prev => prev + 1);
    setGameSpeed(prev => prev + SPEED_INCREMENT);
    
    gameLoopRef.current = requestAnimationFrame(update);
  }, [getRandomVehicle]);

  useEffect(() => {
    if (score > level * 1000) {
      setLevel(prev => prev + 1);
    }
  }, [score, level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;
      
      switch (e.key) {
        case 'ArrowLeft': 
          setPlayerLane(prev => Math.max(0, prev - 1)); 
          break;
        case 'ArrowRight': 
          setPlayerLane(prev => Math.min(LANES - 1, prev + 1)); 
          break;
        case 'p': 
          setIsPaused(prev => !prev); 
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [update]);

  return {
    playerLane,
    traffic,
    score,
    gameOver,
    level,
    isPaused,
    resetGame,
    setIsPaused
  };
}
