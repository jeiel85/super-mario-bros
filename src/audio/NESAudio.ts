// NES 2A03 Chiptune Audio Synthesizer (Zero External Dependencies)
// Real-time Web Audio API emulation for 2 Pulse, 1 Triangle, and 1 Noise channels

export class NESAudio {
  private static ctx: AudioContext | null = null;
  private static isMuted = false;
  private static currentTrack: string | null = null;
  private static musicInterval: number | null = null;
  private static musicStep = 0;

  // Master Gain
  private static masterGain: GainNode | null = null;
  private static noiseBuffer: AudioBuffer | null = null;

  public static init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.createNoiseBuffer();
  }

  public static unlock() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  public static getMuted(): boolean {
    return this.isMuted;
  }

  // Pre-generate 1 second of NES-style pseudo-random shift register noise
  private static createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);

    // Emulate 15-bit shift register noise
    let reg = 0x7fff;
    for (let i = 0; i < bufferSize; i++) {
      const bit = (reg ^ (reg >> 1)) & 1;
      reg = (reg >> 1) | (bit << 14);
      output[i] = (reg & 1) ? 0.35 : -0.35;
    }
  }

  // -------------------------------------------------------------
  // SOUND EFFECTS
  // -------------------------------------------------------------

  // Small Mario Jump
  public static playJumpSmall() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Super Mario Jump
  public static playJumpSuper() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Coin Chime
  public static playCoin() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // B5 (987.77 Hz) -> E6 (1318.51 Hz)
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.setValueAtTime(0.4, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.43);
  }

  // Stomp Goomba
  public static playStomp() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Block Bump
  public static playBlockBump() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Break Brick
  public static playBlockBreak() {
    if (this.isMuted || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(150, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(t);
    source.stop(t + 0.26);
  }

  // Powerup Sprout / Item Emerge
  public static playPowerupAppear() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [330, 392, 659, 523, 587, 784];
    const duration = 0.05;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = t0 + idx * duration;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Powerup Collect (Mushroom/Flower)
  public static playPowerup() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [330, 392, 659, 523, 587, 784, 880, 988, 1046, 1174, 1318];
    const duration = 0.04;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = t0 + idx * duration;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Pipe Slide / Down
  public static playPipe() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [587, 523, 440, 392, 330, 261];
    const duration = 0.06;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = t0 + idx * duration;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Skid Sound
  public static playSkid() {
    if (this.isMuted || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(t);
    source.stop(t + 0.13);
  }

  // Kick Shell
  public static playKick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.14);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Fireball Shoot
  public static playFireball() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Flagpole Slide
  public static playFlagpole() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 1.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.22);
  }

  // 1-UP Chime
  public static play1UP() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [330, 392, 659, 523, 587, 784];
    const duration = 0.07;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = t0 + idx * duration;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq * 1.5, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Pause Jingle (Ascending Arpeggio C6 -> E6 -> G6 -> C7)
  public static playPause() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0];
    const duration = 0.04;
    const t0 = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = t0 + idx * duration;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // Firework Cannon Explosion
  public static playFirework() {
    if (this.isMuted || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    
    // 1. Noise crunch
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    source.start(t);
    source.stop(t + 0.41);

    // 2. Low boom oscillator
    const osc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    boomGain.gain.setValueAtTime(0.5, t);
    boomGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    osc.connect(boomGain);
    boomGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  // -------------------------------------------------------------
  // MUSIC TRACKS (Overworld, Underground, Star, Stage Clear, Death)
  // -------------------------------------------------------------

  private static pausedTrack: string | null = null;

  public static stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = null;
    this.pausedTrack = null;
  }

  public static pauseMusic() {
    this.pausedTrack = this.currentTrack;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = null;
  }

  public static resumeMusic() {
    const track = this.pausedTrack;
    this.pausedTrack = null;
    if (track === 'overworld') this.playOverworld();
    else if (track === 'underground') this.playUnderground();
    else if (track === 'star') this.playStar();
  }

  // Note frequency map for easy composition
  private static note(name: string): number {
    const notes: Record<string, number> = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99,
      'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
    };
    return notes[name] || 0;
  }

  // Play a single 8-bit note on Pulse 1
  private static playPulseNote(freq: number, duration: number) {
    if (this.isMuted || !this.ctx || !this.masterGain || freq <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration * 0.95);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Play a single 8-bit bass note on Triangle channel
  private static playBassNote(freq: number, duration: number) {
    if (this.isMuted || !this.ctx || !this.masterGain || freq <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.linearRampToValueAtTime(0.01, t + duration * 0.95);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Play high hat / snare noise drum
  private static playDrum(isSnare: boolean) {
    if (this.isMuted || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isSnare ? 'lowpass' : 'highpass';
    filter.frequency.setValueAtTime(isSnare ? 1000 : 6000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isSnare ? 0.18 : 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isSnare ? 0.12 : 0.04));

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(t);
    source.stop(t + (isSnare ? 0.13 : 0.05));
  }

  // 1. OVERWORLD THEME (The Iconic Koji Kondo Masterpiece)
  public static playOverworld() {
    if (this.currentTrack === 'overworld') return;
    this.stopMusic();
    this.currentTrack = 'overworld';
    this.musicStep = 0;

    // Melody: [NoteName, BassNote, isDrum (0=none, 1=hihat, 2=snare)]
    const score: Array<[string, string, number]> = [
      // Intro
      ['E5', 'D3', 1], ['E5', 'D3', 1], ['', '', 0], ['E5', 'D3', 1],
      ['', '', 0], ['C5', 'D3', 1], ['E5', 'D3', 1], ['', '', 0],
      ['G5', 'G3', 2], ['', '', 0], ['', '', 0], ['', '', 0],
      ['G4', 'G3', 2], ['', '', 0], ['', '', 0], ['', '', 0],

      // Main Theme Section A
      ['C5', 'G3', 1], ['', '', 0], ['', '', 0], ['G4', 'E3', 1],
      ['', '', 0], ['', '', 0], ['E4', 'C3', 2], ['', '', 0],
      ['', '', 0], ['A4', 'F3', 1], ['', '', 0], ['B4', 'G3', 1],
      ['', '', 0], ['Bb4', 'Gb3', 2], ['A4', 'F3', 1], ['', '', 0],

      ['G4', 'E3', 1], ['E5', 'C4', 1], ['G5', 'E4', 2], ['A5', 'F4', 1],
      ['', '', 0], ['F5', 'D4', 1], ['G5', 'E4', 2], ['', '', 0],
      ['E5', 'C4', 1], ['', '', 0], ['C5', 'A3', 1], ['D5', 'B3', 2],
      ['B4', 'G3', 1], ['', '', 0], ['', '', 0], ['', '', 0],

      // Repeat variation
      ['C5', 'G3', 1], ['', '', 0], ['', '', 0], ['G4', 'E3', 1],
      ['', '', 0], ['', '', 0], ['E4', 'C3', 2], ['', '', 0],
      ['', '', 0], ['A4', 'F3', 1], ['', '', 0], ['B4', 'G3', 1],
      ['', '', 0], ['Bb4', 'Gb3', 2], ['A4', 'F3', 1], ['', '', 0],

      ['G4', 'E3', 1], ['E5', 'C4', 1], ['G5', 'E4', 2], ['A5', 'F4', 1],
      ['', '', 0], ['F5', 'D4', 1], ['G5', 'E4', 2], ['', '', 0],
      ['E5', 'C4', 1], ['', '', 0], ['C5', 'A3', 1], ['D5', 'B3', 2],
      ['B4', 'G3', 1], ['', '', 0], ['', '', 0], ['', '', 0],

      // Bridge / Section B
      ['', '', 1], ['G5', 'E3', 1], ['F#5', 'D#3', 2], ['F5', 'D3', 1],
      ['D#5', 'C#3', 1], ['', '', 0], ['E5', 'C3', 2], ['', '', 0],
      ['G#4', 'E3', 1], ['A4', 'F3', 1], ['C5', 'A3', 2], ['', '', 0],
      ['A4', 'F3', 1], ['C5', 'A3', 1], ['D5', 'B3', 2], ['', '', 0],

      ['', '', 1], ['G5', 'E3', 1], ['F#5', 'D#3', 2], ['F5', 'D3', 1],
      ['D#5', 'C#3', 1], ['', '', 0], ['E5', 'C3', 2], ['', '', 0],
      ['C6', 'G4', 1], ['', '', 0], ['C6', 'G4', 2], ['C6', 'G4', 1],
      ['', '', 0], ['', '', 0], ['', '', 0], ['', '', 0]
    ];

    const stepDuration = 125; // 16th note timing at ~120 BPM
    this.musicInterval = window.setInterval(() => {
      if (this.currentTrack !== 'overworld') return;
      const [lead, bass, drum] = score[this.musicStep];
      if (lead) this.playPulseNote(this.note(lead), stepDuration / 1000 * 0.9);
      if (bass) this.playBassNote(this.note(bass), stepDuration / 1000 * 0.9);
      if (drum === 1) this.playDrum(false);
      if (drum === 2) this.playDrum(true);

      this.musicStep = (this.musicStep + 1) % score.length;
    }, stepDuration);
  }

  // 2. UNDERGROUND THEME
  public static playUnderground() {
    if (this.currentTrack === 'underground') return;
    this.stopMusic();
    this.currentTrack = 'underground';
    this.musicStep = 0;

    const score: Array<[string, string]> = [
      ['C4', 'C3'], ['C5', 'C4'], ['A3', 'A2'], ['A4', 'A3'],
      ['Bb3', 'Bb2'], ['Bb4', 'Bb3'], ['', ''], ['', ''],
      ['C4', 'C3'], ['C5', 'C4'], ['A3', 'A2'], ['A4', 'A3'],
      ['Bb3', 'Bb2'], ['Bb4', 'Bb3'], ['', ''], ['', ''],
      ['F3', 'F2'], ['F4', 'F3'], ['D3', 'D2'], ['D4', 'D3'],
      ['Eb3', 'Eb2'], ['Eb4', 'Eb3'], ['', ''], ['', ''],
      ['F3', 'F2'], ['F4', 'F3'], ['D3', 'D2'], ['D4', 'D3'],
      ['Eb3', 'Eb2'], ['Eb4', 'Eb3'], ['', ''], ['', '']
    ];

    const stepDuration = 135;
    this.musicInterval = window.setInterval(() => {
      if (this.currentTrack !== 'underground') return;
      const [lead, bass] = score[this.musicStep];
      if (lead) this.playPulseNote(this.note(lead), stepDuration / 1000 * 0.85);
      if (bass) this.playBassNote(this.note(bass), stepDuration / 1000 * 0.85);
      this.playDrum(false);

      this.musicStep = (this.musicStep + 1) % score.length;
    }, stepDuration);
  }

  // 3. STARMAN THEME
  public static playStar() {
    if (this.currentTrack === 'star') return;
    this.stopMusic();
    this.currentTrack = 'star';
    this.musicStep = 0;

    const notes = ['C5', 'G4', 'C5', 'G4', 'D5', 'A4', 'D5', 'A4', 'E5', 'B4', 'E5', 'B4', 'F5', 'C5', 'F5', 'C5'];
    const stepDuration = 80;
    this.musicInterval = window.setInterval(() => {
      if (this.currentTrack !== 'star') return;
      const noteName = notes[this.musicStep % notes.length];
      this.playPulseNote(this.note(noteName), 0.07);
      this.playDrum(this.musicStep % 2 === 0);
      this.musicStep++;
    }, stepDuration);
  }

  // 4. LEVEL CLEAR FANFARE
  public static playLevelClear() {
    this.stopMusic();
    this.currentTrack = 'clear';

    const fanfare = [
      { note: 'G4', dur: 0.1 }, { note: 'C5', dur: 0.1 }, { note: 'E5', dur: 0.1 },
      { note: 'G5', dur: 0.1 }, { note: 'C6', dur: 0.1 }, { note: 'E6', dur: 0.25 },
      { note: 'G6', dur: 0.25 }, { note: 'E6', dur: 0.35 }
    ];

    let offset = 0;
    fanfare.forEach(item => {
      setTimeout(() => {
        this.playPulseNote(this.note(item.note), item.dur);
        this.playBassNote(this.note(item.note) / 2, item.dur);
      }, offset * 1000);
      offset += item.dur;
    });
  }

  // 5. DEATH JINGLE
  public static playDeath() {
    this.stopMusic();
    this.currentTrack = 'death';

    const notes = [
      { n: 'B4', d: 0.12 }, { n: 'F5', d: 0.12 }, { n: '', d: 0.06 }, { n: 'F5', d: 0.12 },
      { n: 'F5', d: 0.12 }, { n: 'E5', d: 0.12 }, { n: 'D5', d: 0.12 }, { n: 'C5', d: 0.24 }
    ];

    let delay = 0;
    notes.forEach(item => {
      setTimeout(() => {
        if (item.n) this.playPulseNote(this.note(item.n), item.d * 0.9);
      }, delay * 1000);
      delay += item.d;
    });
  }

  // 6. GAME OVER JINGLE
  public static playGameOver() {
    this.stopMusic();
    this.currentTrack = 'gameover';

    const notes = [
      { n: 'C5', d: 0.15 }, { n: '', d: 0.1 }, { n: 'G4', d: 0.15 }, { n: '', d: 0.1 },
      { n: 'E4', d: 0.2 }, { n: 'A4', d: 0.15 }, { n: 'B4', d: 0.15 }, { n: 'A4', d: 0.15 },
      { n: 'G#4', d: 0.15 }, { n: 'Bb4', d: 0.15 }, { n: 'G#4', d: 0.15 }, { n: 'G4', d: 0.3 }
    ];

    let delay = 0;
    notes.forEach(item => {
      setTimeout(() => {
        if (item.n) this.playPulseNote(this.note(item.n), item.d * 0.9);
      }, delay * 1000);
      delay += item.d;
    });
  }
}
