// Web Audio API Synthesizer and Audio Helper for Kid Learning Experience

class KidSoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmInterval: number | null = null;
  private isMuted: boolean = false;
  private isBgmMuted: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play cheerful bell chime (e.g. for correct answer or filling star)
  playCorrectBell(starIndex = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Harmonious pleasant arpeggio (C-E-G-C)
      const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const pitchOffset = Math.min(starIndex * 0.1, 0.4);

      baseFreqs.slice(0, 3).forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + pitchOffset), now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play gentle wooden try-again buzzer
  playIncorrectBuzzer() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play letter tile tap / snap sound
  playTilePop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play reward points count ticking
  playPointTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play sheet complete celebration fanfare
  playCelebrationFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Joyful celebratory notes
      const notes = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 659.25, t: 0.15, d: 0.15 },
        { f: 783.99, t: 0.30, d: 0.15 },
        { f: 1046.50, t: 0.45, d: 0.45 },
        { f: 880.00, t: 0.70, d: 0.15 },
        { f: 1046.50, t: 0.90, d: 0.60 },
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.28, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play custom audio file (from URL or blob)
  async playAudioUrl(url: string): Promise<void> {
    if (!url) return;
    return new Promise((resolve) => {
      try {
        if (this.currentAudioElement) {
          this.currentAudioElement.pause();
          this.currentAudioElement = null;
        }
        const audio = new Audio(url);
        this.currentAudioElement = audio;
        audio.volume = this.isMuted ? 0 : 0.9;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  // Speech synthesis for questions and CVC phonics helper
  speakWord(text: string, rate: number = 0.85): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate; // slightly slower for early readers
        utterance.pitch = 1.2; // friendly, cheerful pitch for kids
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  // Speak phonemes distinctly (e.g. "C... A... T... CAT!")
  async speakPhonicsBlend(letters: string[], fullWord: string) {
    for (const letter of letters) {
      this.playTilePop();
      await this.speakWord(letter.toLowerCase(), 0.8);
      await new Promise((r) => setTimeout(r, 220));
    }
    await new Promise((r) => setTimeout(r, 200));
    this.playCorrectBell();
    await this.speakWord(fullWord, 0.9);
  }

  // Playful Background Music Synthesizer Loop (Gentle, friendly, non-intrusive)
  startBackgroundMusic(theme: string = 'playful_melody') {
    if (this.isBgmMuted || theme === 'none') {
      this.stopBackgroundMusic();
      return;
    }
    this.stopBackgroundMusic();

    try {
      const ctx = this.getContext();
      const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C
      let noteIndex = 0;
      const melodyPattern = [0, 2, 3, 4, 3, 2, 1, 3, 4, 5, 4, 2, 0, 3, 2, 0];

      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      this.bgmGainNode.connect(ctx.destination);

      this.bgmInterval = window.setInterval(() => {
        if (!this.ctx || this.isBgmMuted) return;
        const scaleIdx = melodyPattern[noteIndex % melodyPattern.length];
        const freq = pentatonicScale[scaleIdx] * 1.5;
        noteIndex++;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

        osc.connect(noteGain);
        if (this.bgmGainNode) {
          noteGain.connect(this.bgmGainNode);
        }

        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
      }, 550);
    } catch (e) {
      console.warn('BGM error:', e);
    }
  }

  stopBackgroundMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.currentAudioElement) this.currentAudioElement.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }

  setBgmMuted(muted: boolean) {
    this.isBgmMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
  }

  getIsMuted() {
    return this.isMuted;
  }

  getIsBgmMuted() {
    return this.isBgmMuted;
  }
}

export const soundEngine = new KidSoundEngine();
