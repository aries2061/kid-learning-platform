// Web Audio API Synthesizer and Audio Helper for Kid Learning Experience
// Fully optimized for iPad Safari, iOS, macOS, Chrome, Edge, and Android

class KidSoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmInterval: number | null = null;
  private isMuted: boolean = false;
  private isBgmMuted: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // Setup iOS / iPad Safari touch gesture audio unlock listener
    if (typeof window !== 'undefined') {
      const unlockListener = () => {
        this.unlockAudioContext();
        window.removeEventListener('touchstart', unlockListener);
        window.removeEventListener('touchend', unlockListener);
        window.removeEventListener('click', unlockListener);
      };
      window.addEventListener('touchstart', unlockListener, { passive: true });
      window.addEventListener('touchend', unlockListener, { passive: true });
      window.addEventListener('click', unlockListener, { passive: true });
    }
  }

  public unlockAudioContext() {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a tiny silent buffer on iOS Safari to unlock the audio output
      if (!this.isUnlocked) {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      }
    } catch {
      // ignore
    }
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play cheerful bell chime (e.g. for correct answer or filling star)
  playCorrectBell(starIndex = 0) {
    if (this.isMuted) return;
    try {
      this.unlockAudioContext();
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Harmonious pleasant arpeggio (C-E-G-C)
      const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.51];
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
      this.unlockAudioContext();
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
      this.unlockAudioContext();
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
      this.unlockAudioContext();
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
      this.unlockAudioContext();
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const notes = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 659.25, t: 0.15, d: 0.15 },
        { f: 783.99, t: 0.3, d: 0.15 },
        { f: 1046.5, t: 0.45, d: 0.45 },
        { f: 880.0, t: 0.7, d: 0.15 },
        { f: 1046.5, t: 0.9, d: 0.6 },
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

  // Play custom audio file (from URL or blob) with iPad Safari fallback and Web Audio decoder
  async playAudioUrl(url: string, fallbackText?: string): Promise<void> {
    if (!url) {
      if (fallbackText) await this.speakWord(fallbackText);
      return;
    }

    this.unlockAudioContext();

    return new Promise(async (resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      try {
        if (this.currentAudioElement) {
          this.currentAudioElement.pause();
          this.currentAudioElement = null;
        }

        const audio = new Audio();
        this.currentAudioElement = audio;

        // Attributes for Safari iOS / iPadOS
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.preload = 'auto';
        audio.src = url;
        audio.volume = this.isMuted ? 0 : 0.9;

        audio.onended = () => {
          this.currentAudioElement = null;
          safeResolve();
        };

        const tryWebAudioFallback = async () => {
          try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            const ctx = this.getContext();
            const decoded = await ctx.decodeAudioData(buf);

            const source = ctx.createBufferSource();
            source.buffer = decoded;
            const gain = ctx.createGain();
            gain.gain.value = this.isMuted ? 0 : 0.9;
            source.connect(gain);
            gain.connect(ctx.destination);

            source.onended = () => safeResolve();
            source.start(0);
          } catch (e) {
            console.warn('Web Audio decode fallback failed, trying speech synthesis:', e);
            if (fallbackText) {
              await this.speakWord(fallbackText);
            }
            safeResolve();
          }
        };

        audio.onerror = async () => {
          this.currentAudioElement = null;
          await tryWebAudioFallback();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(async (playErr) => {
            console.warn('HTMLAudioElement play() rejected on Safari:', playErr);
            await tryWebAudioFallback();
          });
        }
      } catch (err) {
        console.warn('playAudioUrl unexpected error:', err);
        if (fallbackText) {
          await this.speakWord(fallbackText);
        }
        safeResolve();
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

        // Select cheerful English voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google') || v.name.includes('Natural')));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

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
    this.unlockAudioContext();
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
      this.unlockAudioContext();
      const ctx = this.getContext();
      const pentatonicScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C
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
