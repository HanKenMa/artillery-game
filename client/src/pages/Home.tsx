import { useState, useEffect, useRef } from 'react';
import GameCanvas from '@/components/GameCanvas';
import ControlPanel from '@/components/ControlPanel';
import { playShootSound, playExplosionSound, playHitSound, initAudioContext } from '@/lib/soundEffects';
import { ParticleSystem } from '@/lib/particleSystem';

interface GameState {
  ballX: number;
  ballY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  angle: number;
  power: number;
  gravity: number;
  score: number;
  flying: boolean;
  trail: Array<{ x: number; y: number }>;
  explosionTimer: number;
  explosionX: number;
  explosionY: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRAVITY_DEFAULT = 0.2;
const POWER_DEFAULT = 1.5;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const [gameState, setGameState] = useState<GameState>({
    ballX: 50,
    ballY: CANVAS_HEIGHT - 50,
    targetX: 600,
    targetY: 150,
    vx: 0,
    vy: 0,
    angle: 45,
    power: POWER_DEFAULT,
    gravity: GRAVITY_DEFAULT,
    score: 0,
    flying: false,
    trail: [],
    explosionTimer: 0,
    explosionX: 0,
    explosionY: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        e.preventDefault();
        handleShootButton();
      }

      if (e.key === 'q' || e.key === 'Q') {
        handleResetButton();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mobile touch controls
  const handleShootButton = () => {
    initAudioContext();
    setGameState((prev) => {
      if (!prev.flying) {
        playShootSound();
        const rad = (prev.angle * Math.PI) / 180;
        return {
          ...prev,
          vx: prev.power * Math.cos(rad) * 3.5,
          vy: -prev.power * Math.sin(rad) * 1.5,
          flying: true,
        };
      }
      return prev;
    });
  };

  const handleResetButton = () => {
    particleSystemRef.current.clear();
    setGameState({
      ballX: 50,
      ballY: CANVAS_HEIGHT - 50,
      targetX: 600,
      targetY: 150,
      vx: 0,
      vy: 0,
      angle: 45,
      power: POWER_DEFAULT,
      gravity: GRAVITY_DEFAULT,
      score: 0,
      flying: false,
      trail: [],
      explosionTimer: 0,
      explosionX: 0,
      explosionY: 0,
    });
  };

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        let newState = { ...prev };

        // Handle input
        if (!newState.flying) {
          if (keysPressed.current['w']) {
            newState.power = Math.min(5.0, newState.power + 0.1);
          }
          if (keysPressed.current['s']) {
            newState.power = Math.max(0.5, newState.power - 0.1);
          }
          if (keysPressed.current['a']) {
            newState.angle = Math.min(90, newState.angle + 2);
          }
          if (keysPressed.current['d']) {
            newState.angle = Math.max(0, newState.angle - 2);
          }
          if (keysPressed.current['+'] || keysPressed.current['=']) {
            newState.gravity = Math.min(1, newState.gravity + 0.01);
          }
          if (keysPressed.current['-']) {
            newState.gravity = Math.max(0.01, newState.gravity - 0.01);
          }
        }

        // Update physics
        if (newState.flying) {
          newState.trail.push({ x: newState.ballX, y: newState.ballY });
          if (newState.trail.length > 50) {
            newState.trail.shift();
          }

          // Percepat dengan 2 step per frame untuk animasi lebih cepat
          for (let i = 0; i < 2; i++) {
            newState.ballX += newState.vx;
            newState.ballY += newState.vy;
            newState.vy += newState.gravity;
          }

          // Check collision with target
          const dx = newState.ballX - newState.targetX;
          const dy = newState.ballY - newState.targetY;
          if (Math.sqrt(dx * dx + dy * dy) < 20) {
            playHitSound();
            playExplosionSound();
            particleSystemRef.current.createExplosion(newState.targetX, newState.targetY, 40);
            particleSystemRef.current.createScorePopup(newState.targetX, newState.targetY - 30);
            newState.score += 10;
            newState.explosionTimer = 10;
            newState.explosionX = newState.targetX;
            newState.explosionY = newState.targetY;
            newState.targetX = 200 + Math.random() * 400;
            newState.targetY = 50 + Math.random() * 300;
            newState.ballX = 50;
            newState.ballY = CANVAS_HEIGHT - 50;
            newState.flying = false;
            newState.trail = [];
          }

          // Check out of bounds
          if (
            newState.ballX < 0 ||
            newState.ballX > CANVAS_WIDTH ||
            newState.ballY > CANVAS_HEIGHT
          ) {
            if (newState.ballY > CANVAS_HEIGHT) {
              playExplosionSound();
              particleSystemRef.current.createExplosion(newState.ballX, newState.ballY, 20);
              newState.explosionTimer = 5;
              newState.explosionX = newState.ballX;
              newState.explosionY = newState.ballY;
            }
            newState.ballX = 50;
            newState.ballY = CANVAS_HEIGHT - 50;
            newState.flying = false;
            newState.trail = [];
          }
        }

        if (newState.explosionTimer > 0) {
          newState.explosionTimer--;
        }

        particleSystemRef.current.update();

        return newState;
      });
    }, 16); // ~60 FPS untuk responsivitas lebih baik

    return () => clearInterval(interval);
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0A0E27');
    gradient.addColorStop(1, '#1a1f3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw animated grid background
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw trail
    if (gameState.trail.length > 1) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gameState.trail[0].x, gameState.trail[0].y);
      for (let i = 1; i < gameState.trail.length; i++) {
        ctx.lineTo(gameState.trail[i].x, gameState.trail[i].y);
      }
      ctx.stroke();

      // Draw trail dots
      ctx.fillStyle = 'rgba(157, 0, 255, 0.5)';
      gameState.trail.forEach((point, index) => {
        const alpha = index / gameState.trail.length;
        ctx.globalAlpha = alpha;
        ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;
    }

    // Draw explosion
    if (gameState.explosionTimer > 0) {
      const explosionAlpha = gameState.explosionTimer / 10;
      ctx.fillStyle = `rgba(255, 255, 0, ${explosionAlpha})`;
      ctx.beginPath();
      ctx.arc(gameState.explosionX, gameState.explosionY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 100, 0, ${explosionAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gameState.explosionX, gameState.explosionY, 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw target with glow
    ctx.shadowColor = '#FF1493';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(gameState.targetX, gameState.targetY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gameState.targetX, gameState.targetY, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Draw ball
    if (gameState.flying) {
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(gameState.ballX, gameState.ballY, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw cannon
      ctx.shadowColor = '#9D00FF';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#9D00FF';
      ctx.beginPath();
      ctx.arc(gameState.ballX, gameState.ballY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw cannon barrel
      const rad = (gameState.angle * Math.PI) / 180;
      const barrelLength = 20;
      const barrelEndX = gameState.ballX + Math.cos(rad) * barrelLength;
      const barrelEndY = gameState.ballY - Math.sin(rad) * barrelLength;

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gameState.ballX, gameState.ballY);
      ctx.lineTo(barrelEndX, barrelEndY);
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';

    // Draw border
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw particles
    particleSystemRef.current.draw(ctx);
  }, [gameState]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #0A0E27 0%, #1a1f3a 100%)',
      }}
    >
      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1
          className="text-3xl md:text-5xl font-bold mb-2 font-mono"
          style={{
            color: '#00FFFF',
            textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
            letterSpacing: '0.1em',
          }}
        >
          ARTILLERY PHYSICS
        </h1>
        <p
          className="text-sm md:text-lg font-mono"
          style={{
            color: '#9D00FF',
            textShadow: '0 0 10px rgba(157, 0, 255, 0.6)',
          }}
        >
          KELOMPOK 4 - Physics Simulation Game
        </p>
      </div>

      {/* Main Game Container */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start justify-center max-w-6xl w-full">
        {/* Canvas */}
        <div className="flex-1 flex justify-center w-full lg:w-auto">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-cyan-400 rounded-lg shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-none"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
              aspectRatio: '800/500',
            }}
          />
        </div>

        {/* Control Panel */}
        <div className="flex-1 max-w-sm w-full">
          <ControlPanel
            angle={gameState.angle}
            power={gameState.power}
            gravity={gameState.gravity}
            score={gameState.score}
            onAngleChange={(angle) =>
              setGameState((prev) => ({ ...prev, angle }))
            }
            onPowerChange={(power) =>
              setGameState((prev) => ({ ...prev, power }))
            }
            onGravityChange={(gravity) =>
              setGameState((prev) => ({ ...prev, gravity }))
            }
          />

          {/* Mobile Shoot Button */}
          <div className="mt-6 flex gap-3 lg:hidden">
            <button
              onClick={handleShootButton}
              disabled={gameState.flying}
              className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white font-bold rounded-lg transition-colors"
              style={{
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
              }}
            >
              SHOOT (SPACE)
            </button>
            <button
              onClick={handleResetButton}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              style={{
                boxShadow: '0 0 15px rgba(157, 0, 255, 0.5)',
              }}
            >
              RESET (Q)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-8 md:mt-12 text-center text-xs md:text-sm font-mono px-4"
        style={{
          color: 'rgba(0, 255, 255, 0.6)',
        }}
      >
        <p className="mb-2">Hit the target to score points. Adjust angle, power, and gravity to master the physics!</p>
        <p className="text-xs" style={{ color: 'rgba(157, 0, 255, 0.5)' }}>
          Desktop: SPACEBAR to shoot | W/S power | A/D angle | +/- gravity | Q reset
        </p>
      </div>
    </div>
  );
}
