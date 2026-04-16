import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Genesis (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Cybernetic Dreams (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Digital Horizon (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function App() {
  // Music Player State
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Snake Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const lastProcessedDirectionRef = useRef(direction);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const gameStartedRef = useRef(gameStarted);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);

  // Audio Controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // Game Logic
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === " " && (!gameStartedRef.current || gameOverRef.current)) {
        resetGame();
        if (!isPlaying) setIsPlaying(true);
        return;
      }

      if (!gameStartedRef.current || gameOverRef.current) return;

      const currentDir = lastProcessedDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, generateFood]);

  useEffect(() => {
    const moveSnake = () => {
      if (gameOverRef.current || !gameStartedRef.current) return;

      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const dir = directionRef.current;
      
      lastProcessedDirectionRef.current = dir;

      head.x += dir.x;
      head.y += dir.y;

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return;
      }

      if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      currentSnake.unshift(head);

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        currentSnake.pop();
      }

      setSnake(currentSnake);
    };

    const gameInterval = setInterval(moveSnake, 120);
    return () => clearInterval(gameInterval);
  }, [generateFood]);

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-neon-purple)_0%,_transparent_20%)] opacity-20 pointer-events-none blur-[100px]"></div>
      
      <header className="absolute top-6 left-6 flex flex-col gap-1 z-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-glow-pink text-neon-pink">
          Synth<span className="text-neon-blue text-glow-blue">Snake</span>
        </h1>
        <p className="text-xs tracking-widest uppercase text-gray-400 font-mono">
          AI Audio x Retro Arcade
        </p>
      </header>

      <div className="absolute top-6 right-6 z-10 text-right">
        <p className="text-xs tracking-widest uppercase text-gray-400 font-mono mb-1">Score</p>
        <p className="text-4xl font-mono font-bold text-neon-green text-glow-green">
          {score.toString().padStart(4, '0')}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center mt-8">
        <div className="p-1 rounded-xl bg-gradient-to-b from-neon-blue/40 to-neon-purple/40 glow-blue">
          <div className="bg-black rounded-lg p-2 relative">
            <div 
              className="relative bg-gray-950 border border-gray-800 rounded overflow-hidden"
              style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
            >
              {snake.map((segment, i) => (
                <div
                  key={i}
                  className={`absolute rounded-sm ${i === 0 ? 'bg-neon-green glow-green z-10' : 'bg-neon-green/70'}`}
                  style={{
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    left: segment.x * CELL_SIZE + 1,
                    top: segment.y * CELL_SIZE + 1,
                  }}
                />
              ))}
              <div
                className="absolute bg-neon-pink glow-pink rounded-full"
                style={{
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                  left: food.x * CELL_SIZE + 2,
                  top: food.y * CELL_SIZE + 2,
                }}
              />

              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                  <p className="text-neon-blue text-glow-blue font-mono text-xl mb-4 animate-pulse">PRESS SPACE TO START</p>
                  <p className="text-gray-400 font-mono text-xs">Use Arrow Keys to move</p>
                </div>
              )}
              
              {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                  <p className="text-neon-pink text-glow-pink font-mono text-3xl font-bold mb-2">SYSTEM FAILURE</p>
                  <p className="text-white font-mono text-lg mb-6">FINAL SCORE: {score}</p>
                  <button 
                    onClick={() => {
                      resetGame();
                      if (!isPlaying) setIsPlaying(true);
                    }}
                    className="px-6 py-2 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-colors font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={16} /> Reboot
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
        <div className="bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
          <audio 
            ref={audioRef} 
            src={TRACKS[currentTrack].url} 
            onEnded={nextTrack}
          />
          
          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col overflow-hidden">
              <p className="text-xs text-neon-purple font-mono uppercase tracking-wider mb-1">Now Playing</p>
              <p className="text-sm font-medium truncate text-white">
                {TRACKS[currentTrack].title}
              </p>
            </div>
            <div className="flex items-center gap-2">
               <div className={`flex items-end gap-1 h-6 ${isPlaying ? 'is-playing' : ''}`}>
                 <div className="eq-bar eq-1"></div>
                 <div className="eq-bar eq-2"></div>
                 <div className="eq-bar eq-3"></div>
                 <div className="eq-bar eq-4"></div>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlay} 
                className="w-10 h-10 rounded-full bg-neon-purple text-white flex items-center justify-center hover:scale-105 transition-transform glow-pink cursor-pointer"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00ffff]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
