// Sound Effects Generator menggunakan Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Audio Context not supported:', e);
      throw new Error('Web Audio API not supported');
    }
  }
  
  // Resume audio context if suspended (required by some browsers)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(err => console.error('Failed to resume audio context:', err));
  }
  
  return audioContext;
}

export function playShootSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

  // Oscillator untuk suara tembakan (laser-like)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Frequency sweep dari tinggi ke rendah
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

  // Volume envelope
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.type = 'sine';
  osc.start(now);
  osc.stop(now + 0.1);

  // Tambahan: white noise untuk efek yang lebih kaya
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  const noiseGain = ctx.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseSource.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  noiseSource.start(now);
  } catch (error) {
    console.warn('Sound effect failed:', error);
  }
}

export function playExplosionSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

  // Boom bass
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();

  bass.connect(bassGain);
  bassGain.connect(ctx.destination);

  bass.frequency.setValueAtTime(150, now);
  bass.frequency.exponentialRampToValueAtTime(50, now + 0.3);

  bassGain.gain.setValueAtTime(0.4, now);
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  bass.type = 'sine';
  bass.start(now);
  bass.stop(now + 0.3);

  // Noise burst untuk efek ledakan
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  const noiseGain = ctx.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseSource.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  noiseSource.start(now);

  // High-pitched riser untuk drama
  const riser = ctx.createOscillator();
  const riserGain = ctx.createGain();

  riser.connect(riserGain);
  riserGain.connect(ctx.destination);

  riser.frequency.setValueAtTime(400, now);
  riser.frequency.exponentialRampToValueAtTime(800, now + 0.2);

  riserGain.gain.setValueAtTime(0.1, now);
  riserGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  riser.type = 'triangle';
  riser.start(now);
  riser.stop(now + 0.2);
  } catch (error) {
    console.warn('Explosion sound failed:', error);
  }
}

export function playHitSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

  // Short metallic hit sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.type = 'square';
  osc.start(now);
  osc.stop(now + 0.15);
  } catch (error) {
    console.warn('Hit sound failed:', error);
  }
}

// Initialize audio context on first user interaction
export function initAudioContext() {
  try {
    getAudioContext();
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
}
