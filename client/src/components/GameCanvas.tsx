import { useEffect, useRef, useState } from 'react';

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

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        e.preventDefault();
        setGameState((prev) => {
          if (!prev.flying) {
            const rad = (prev.angle * Math.PI) / 180;
            return {
              ...prev,
              vx: prev.power * Math.cos(rad) * 2,
              vy: -prev.power * Math.sin(rad),
              flying: true,
            };
          }
          return prev;
        });
      }

      if (e.key === 'q' || e.key === 'Q') {
        window.location.reload();
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
          if (newState.trail.length > 30) {
            newState.trail.shift();
          }

          newState.ballX += newState.vx;
          newState.ballY += newState.vy;
          newState.vy += newState.gravity;

          // Check collision with target
          const dx = newState.ballX - newState.targetX;
          const dy = newState.ballY - newState.targetY;
          if (Math.sqrt(dx * dx + dy * dy) < 20) {
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

        return newState;
      });
    }, 40); // ~25 FPS

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
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-cyan-400 rounded-lg shadow-2xl"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
        }}
      />
    </div>
  );
}
