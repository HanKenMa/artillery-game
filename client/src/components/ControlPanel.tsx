import { useState, useEffect } from 'react';

interface ControlPanelProps {
  angle: number;
  power: number;
  gravity: number;
  score: number;
  onAngleChange: (angle: number) => void;
  onPowerChange: (power: number) => void;
  onGravityChange: (gravity: number) => void;
}

export default function ControlPanel({
  angle,
  power,
  gravity,
  score,
  onAngleChange,
  onPowerChange,
  onGravityChange,
}: ControlPanelProps) {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (score > displayScore) {
      setDisplayScore(score);
    }
  }, [score, displayScore]);

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Score Display */}
      <div
        className="p-6 rounded-lg border-2 border-cyan-400 bg-black/50 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        }}
      >
        <div className="text-center">
          <p className="text-cyan-400 text-sm font-mono tracking-widest mb-2">
            SCORE
          </p>
          <p
            className="text-5xl font-bold text-cyan-300 font-mono"
            style={{
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            }}
          >
            {displayScore.toString().padStart(4, '0')}
          </p>
        </div>
      </div>

      {/* Control Sliders */}
      <div
        className="p-6 rounded-lg border-2 border-purple-500 bg-black/50 backdrop-blur-sm space-y-6"
        style={{
          boxShadow: '0 0 20px rgba(157, 0, 255, 0.3)',
        }}
      >
        {/* Angle Control */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-purple-300 text-sm font-mono tracking-widest">
              ANGLE
            </label>
            <span
              className="text-cyan-400 font-mono text-lg font-bold"
              style={{
                textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
              }}
            >
              {angle.toFixed(1)}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="0.5"
            value={angle}
            onChange={(e) => onAngleChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)',
            }}
          />
          <div className="text-xs text-gray-500 font-mono mt-2">
            Press A/D to adjust
          </div>
        </div>

        {/* Power Control */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-purple-300 text-sm font-mono tracking-widest">
              POWER
            </label>
            <span
              className="text-cyan-400 font-mono text-lg font-bold"
              style={{
                textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
              }}
            >
              {power.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={power}
            onChange={(e) => onPowerChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)',
            }}
          />
          <div className="text-xs text-gray-500 font-mono mt-2">
            Press W/S to adjust
          </div>
        </div>

        {/* Gravity Control */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-purple-300 text-sm font-mono tracking-widest">
              GRAVITY
            </label>
            <span
              className="text-cyan-400 font-mono text-lg font-bold"
              style={{
                textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
              }}
            >
              {gravity.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={gravity}
            onChange={(e) => onGravityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)',
            }}
          />
          <div className="text-xs text-gray-500 font-mono mt-2">
            Press +/- to adjust
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="p-4 rounded-lg border-2 border-cyan-400 bg-black/50 backdrop-blur-sm"
        style={{
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
        }}
      >
        <p className="text-cyan-300 text-xs font-mono leading-relaxed">
          <span className="text-purple-400 font-bold">SPACEBAR</span> to shoot
          <br />
          <span className="text-purple-400 font-bold">W/S</span> adjust power
          <br />
          <span className="text-purple-400 font-bold">A/D</span> adjust angle
          <br />
          <span className="text-purple-400 font-bold">+/-</span> adjust gravity
          <br />
          <span className="text-purple-400 font-bold">Q</span> to reset
        </p>
      </div>
    </div>
  );
}
