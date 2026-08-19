// Media Recorder Utilities for Audio and Video Recording in Admin Panel
// Supports 100% universal playback across all browsers (including Safari on iPad, iOS, macOS, Chrome, Android)

export interface RecordingResult {
  blob: Blob;
  url: string;
  duration: number;
}

// Convert Float32Array PCM samples to a standard 16-bit PCM WAV Blob
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings to DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk Descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * 1 channel * 16 bits/8)
  view.setUint16(32, 2, true); // BlockAlign (1 channel * 16 bits/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (clamped to 16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private onTimeUpdateCallback?: (seconds: number) => void;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaRecorderChunks: Blob[] = [];

  async start(onTimeUpdate?: (seconds: number) => void): Promise<void> {
    this.pcmChunks = [];
    this.mediaRecorderChunks = [];
    this.onTimeUpdateCallback = onTimeUpdate;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const source = this.audioCtx.createMediaStreamSource(this.stream);

    // Setup analyzer for live volume waveform
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    source.connect(this.analyser);

    // Use ScriptProcessorNode to capture raw PCM for 100% universal WAV format (plays seamlessly in iPad Safari)
    this.scriptProcessor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      this.pcmChunks.push(new Float32Array(inputData));
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioCtx.destination);

    // Also fallback / record with MediaRecorder if available
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      if (mimeType) {
        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.mediaRecorderChunks.push(e.data);
        };
        this.mediaRecorder.start(100);
      }
    } catch {
      // MediaRecorder optional, PCM WAV capture is primary
    }

    this.startTime = Date.now();

    if (this.onTimeUpdateCallback) {
      this.timerInterval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.onTimeUpdateCallback?.(elapsed);
      }, 500);
    }
  }

  getVolumeLevel(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / (dataArray.length * 255); // 0 to 1
  }

  async stop(): Promise<RecordingResult> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const sampleRate = this.audioCtx?.sampleRate || 44100;

    // Disconnect audio nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }

    // Combine all PCM chunks
    let totalLength = 0;
    for (const chunk of this.pcmChunks) {
      totalLength += chunk.length;
    }

    let blob: Blob;

    if (totalLength > 0) {
      const mergedSamples = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of this.pcmChunks) {
        mergedSamples.set(chunk, offset);
        offset += chunk.length;
      }
      // Encode as universal standard 16-bit PCM WAV (universally playable in iPad Safari)
      blob = encodeWAV(mergedSamples, sampleRate);
    } else if (this.mediaRecorderChunks.length > 0) {
      blob = new Blob(this.mediaRecorderChunks, { type: this.mediaRecorder?.mimeType || 'audio/mp4' });
    } else {
      blob = new Blob([], { type: 'audio/wav' });
    }

    const url = URL.createObjectURL(blob);

    // Cleanup tracks
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        await this.audioCtx.close();
      } catch {
        // ignore
      }
    }

    return { blob, url, duration };
  }

  cancel() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
    }
  }
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private videoChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private timerInterval: number | null = null;

  async getCameraStream(videoFacingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: videoFacingMode,
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: true,
    });
    return this.stream;
  }

  async start(stream: MediaStream, onTimeUpdate?: (seconds: number) => void): Promise<void> {
    this.videoChunks = [];
    this.stream = stream;

    // Pick supported video mimeType (Safari supports mp4, Chrome supports webm)
    const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')
      ? 'video/mp4;codecs=avc1,mp4a.40.2'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';

    this.mediaRecorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.videoChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(250);

    if (onTimeUpdate) {
      this.timerInterval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        onTimeUpdate(elapsed);
      }, 500);
    }
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Video recorder not started'));
        return;
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'video/mp4';
        const blob = new Blob(this.videoChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        this.stream?.getTracks().forEach((track) => track.stop());
        resolve({ blob, url, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((track) => track.stop());
  }
}
