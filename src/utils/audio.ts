// Audio manager for background music and sound effects
class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private isPlaying = false;
  private synthCtx: AudioContext | null = null;
  private synthInterval: number | null = null;
  private useSynthFallback = false;

  initMusic(src: string) {
    if (this.bgMusic) return;
    this.bgMusic = new Audio(src);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.35;

    this.bgMusic.addEventListener('error', () => {
      // If MP3 file not found, gracefully fall back to ambient romantic synth
      this.useSynthFallback = true;
    });
  }

  toggleMusic(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  private play() {
    this.isPlaying = true;
    if (this.bgMusic && !this.useSynthFallback) {
      this.bgMusic.play().catch(() => {
        // Fallback to ambient sound generator
        this.startAmbientSynth();
      });
    } else {
      this.startAmbientSynth();
    }
  }

  private pause() {
    this.isPlaying = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
    this.stopAmbientSynth();
  }

  private startAmbientSynth() {
    if (this.synthInterval) return;
    try {
      this.synthCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      // Dreamy romantic chord progression in C/Am pentatonic (C4, E4, G4, A4, B4, C5, D5, E5)
      const notes = [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];

      const playDreamNote = () => {
        if (!this.isPlaying || !this.synthCtx) return;
        const note = notes[Math.floor(Math.random() * notes.length)];
        const osc = this.synthCtx.createOscillator();
        const gain = this.synthCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, this.synthCtx.currentTime);

        gain.gain.setValueAtTime(0.001, this.synthCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, this.synthCtx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.synthCtx.currentTime + 4.5);

        osc.connect(gain);
        gain.connect(this.synthCtx.destination);

        osc.start(this.synthCtx.currentTime);
        osc.stop(this.synthCtx.currentTime + 4.6);
      };

      playDreamNote();
      this.synthInterval = window.setInterval(playDreamNote, 1600);
    } catch {
      // AudioContext not supported
    }
  }

  private stopAmbientSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.synthCtx) {
      this.synthCtx.close().catch(() => {});
      this.synthCtx = null;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  playSound(name: string) {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (name) {
        case 'star':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          break;
        case 'portal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.6);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.8);
          break;
        case 'galaxy':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.7);
          break;
        case 'envelope':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          break;
        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not available
    }
  }
}

export const audioManager = new AudioManager();
