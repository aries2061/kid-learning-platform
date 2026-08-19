// Media Recorder Utilities for Audio and Video Recording in Admin Panel

export interface RecordingResult {
  blob: Blob;
  url: string;
  duration: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private onTimeUpdateCallback?: (seconds: number) => void;
  private analyser: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;

  async start(onTimeUpdate?: (seconds: number) => void): Promise<void> {
    this.audioChunks = [];
    this.onTimeUpdateCallback = onTimeUpdate;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Setup audio analyzer for volume level animation
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    source.connect(this.analyser);

    // Pick best supported mimeType
    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : 'audio/ogg';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(100);

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
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'));
        return;
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        // Cleanup tracks
        this.stream?.getTracks().forEach((track) => track.stop());
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
          this.audioCtx.close();
        }

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
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
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

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

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
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
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
