class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialisation of AudioContext is done on the first click
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem("mirza_sound_muted", JSON.stringify(this.isMuted));
    return this.isMuted;
  }

  getMuteStatus(): boolean {
    const saved = localStorage.getItem("mirza_sound_muted");
    if (saved !== null) {
      this.isMuted = JSON.parse(saved);
    }
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0, volume: number = 0.1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    setTimeout(() => {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        // Exponential decay
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        console.warn("Audio failed to play", err);
      }
    }, delay * 1000);
  }

  playTap() {
    this.playTone(600, "triangle", 0.08, 0, 0.15);
  }

  playCorrectWord() {
    // Ascending major chord
    this.playTone(261.63, "sine", 0.15, 0, 0.2); // C4
    this.playTone(329.63, "sine", 0.15, 0.08, 0.2); // E4
    this.playTone(392.00, "sine", 0.15, 0.16, 0.2); // G4
    this.playTone(523.25, "sine", 0.3, 0.24, 0.2); // C5
  }

  playError() {
    // Double buzz
    this.playTone(150, "sawtooth", 0.15, 0, 0.15);
    this.playTone(130, "sawtooth", 0.2, 0.1, 0.15);
  }

  playLevelComplete() {
    // Beautiful harp-like flourish
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      this.playTone(freq, "sine", 0.4, index * 0.06, 0.15);
    });
  }

  playCoin() {
    // Classic retro coin pick
    this.playTone(987.77, "sine", 0.1, 0, 0.15); // B5
    this.playTone(1318.51, "sine", 0.3, 0.08, 0.15); // E6
  }

  playBonusWord() {
    // Sparkly sci-fi chime
    this.playTone(523.25, "triangle", 0.15, 0, 0.15); // C5
    this.playTone(783.99, "triangle", 0.15, 0.05, 0.15); // G5
    this.playTone(1174.66, "triangle", 0.25, 0.1, 0.15); // D6
  }

  playHint() {
    // Warm synth pad tap
    this.playTone(440, "sine", 0.2, 0, 0.15);
    this.playTone(554.37, "sine", 0.2, 0.05, 0.15);
    this.playTone(659.25, "sine", 0.3, 0.1, 0.15);
  }
}

export const sound = new SoundManager();
