import { useState, useEffect, useCallback, useRef } from 'react';
import { Color, COLORS, Vehicle, LANES, VehicleType, PowerUp, HIGHWAYS } from '../types';

const INITIAL_SPEED = 0.3;
const SPEED_INCREMENT = 0.00008;
const SPAWN_RATE = 1000; // ms
const PLAYER_Y = 75; // Percentage from top
const NITRO_DURATION = 5000; // 5 seconds
const NITRO_SPEED_MULTIPLIER = 2;
const POWERUP_SPAWN_CHANCE = 0.1; // 10% chance

export function useGame(isActive: boolean = true) {
  const [playerLane, setPlayerLane] = useState(1); // Middle lane
  const [traffic, setTraffic] = useState<Vehicle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [highwayName, setHighwayName] = useState(HIGHWAYS[0].name);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [isNitroActive, setIsNitroActive] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const playerLaneRef = useRef(playerLane);
  const gameSpeedRef = useRef(gameSpeed);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const isActiveRef = useRef(isActive);
  const isNitroActiveRef = useRef(isNitroActive);
  const nitroTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const currentHighway = HIGHWAYS[(level - 1) % HIGHWAYS.length];
    setHighwayName(currentHighway.name);
  }, [level]);

  useEffect(() => { playerLaneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { isNitroActiveRef.current = isNitroActive; }, [isNitroActive]);

  const vehicleCountRef = useRef(0);
  const getRandomVehicle = useCallback((): Vehicle => {
    vehicleCountRef.current += 1;
    const colors = Object.keys(COLORS) as Color[];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const types: VehicleType[] = [
      'matatu', 'matatu', 'matatu', // Weightings
      'bus', 'bus',
      'tuk-tuk', 'boda-boda', 'boda-boda',
      'taxi', 'suv', 'probox', 'probox',
      'hilux', 'canter', 'ambulance', 'truck', 'lorry'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * LANES);

    const highwayBoost = HIGHWAYS[(level - 1) % HIGHWAYS.length].speedMultiplier;

    return {
      id: `traffic-${vehicleCountRef.current}-${crypto.randomUUID()}`,
      lane,
      y: -20, // Start above screen
      color,
      type,
      speed: (INITIAL_SPEED + (Math.random() * 0.2)) * highwayBoost,
    };
  }, [level]);

  const getRandomPowerUp = useCallback((): PowerUp => {
    return {
      id: `powerup-${crypto.randomUUID()}`,
      lane: Math.floor(Math.random() * LANES),
      y: -20,
      type: 'nitro',
    };
  }, []);

  const resetGame = () => {
    setTraffic([]);
    setPowerUps([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setPlayerLane(1);
    setGameSpeed(INITIAL_SPEED);
    setIsNitroActive(false);
    spawnTimerRef.current = 0;
    if (nitroTimerRef.current) clearTimeout(nitroTimerRef.current);
  };

  const update = useCallback((time: number) => {
    if (!isActiveRef.current || gameOverRef.current || isPausedRef.current) {
      lastTimeRef.current = time;
      gameLoopRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const currentMultiplier = isNitroActiveRef.current ? NITRO_SPEED_MULTIPLIER : 1;
    const effectiveSpeed = gameSpeedRef.current * currentMultiplier;

    // Update traffic (Move + Spawn)
    setTraffic(prev => {
      // Move and filter
      let nextTraffic = prev
        .map(v => ({ ...v, y: v.y + effectiveSpeed * deltaTime * 0.2 }))
        .filter(v => v.y < 120);

      // Spawn
      spawnTimerRef.current += deltaTime;
      const spawnThreshold = SPAWN_RATE / (gameSpeedRef.current * 2);
      if (spawnTimerRef.current > spawnThreshold) {
        nextTraffic = [...nextTraffic, getRandomVehicle()];
        spawnTimerRef.current = 0;

        // Randomly spawn power-ups
        if (Math.random() < POWERUP_SPAWN_CHANCE) {
          setPowerUps(currentPowerUps => [
            ...currentPowerUps,
            getRandomPowerUp(),
          ]);
        }
      }

      // Collision check
      const collision = nextTraffic.find(v => 
        v.lane === playerLaneRef.current && v.y > PLAYER_Y - 10 && v.y < PLAYER_Y + 10
      );

      if (collision && !isNitroActiveRef.current) {
        setGameOver(true);
      }

      return nextTraffic;
    });

    // Update PowerUps
    setPowerUps(prev => {
      const nextPowerUps = prev
        .map(p => ({ ...p, y: p.y + effectiveSpeed * deltaTime * 0.2 }))
        .filter(p => p.y < 120);

      // Collision check with power-up
      const pickedUp = nextPowerUps.find(p => 
        p.lane === playerLaneRef.current && p.y > PLAYER_Y - 10 && p.y < PLAYER_Y + 10
      );

      if (pickedUp) {
        setIsNitroActive(true);
        if (nitroTimerRef.current) clearTimeout(nitroTimerRef.current);
        nitroTimerRef.current = window.setTimeout(() => {
          setIsNitroActive(false);
        }, NITRO_DURATION);
        
        return nextPowerUps.filter(p => p.id !== pickedUp.id);
      }

      return nextPowerUps;
    });

    // Update score and speed
    setScore(prev => prev + (isNitroActiveRef.current ? 2 : 1));
    setGameSpeed(prev => prev + SPEED_INCREMENT);
    
    gameLoopRef.current = requestAnimationFrame(update);
  }, [getRandomVehicle, getRandomPowerUp]);

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
    powerUps,
    score,
    gameOver,
    level,
    highwayName,
    isPaused,
    isNitroActive,
    resetGame,
    setIsPaused
  };
}
