import React, { useEffect, useRef, useState } from 'react';
import { Camera, Square, Play, Pause, RotateCcw, Check, X, Video } from 'lucide-react';
import { RecordingResult, VideoRecorder } from '../../utils/recorder';
import { soundEngine } from '../../utils/audio';

interface VideoRecordModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onSaveVideo: (result: { blob: Blob; url: string; duration: number; name: string }) => void;
}

export const VideoRecordModal: React.FC<VideoRecordModalProps> = ({
  isOpen,
  title = 'Record Learning Video',
  onClose,
  onSaveVideo,
}) => {
  const [recorder] = useState(() => new VideoRecorder());
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedResult, setRecordedResult] = useState<RecordingResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoName, setVideoName] = useState('Video Lesson ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    setRecordedResult(null);
    setDuration(0);
    try {
      const mediaStream = await recorder.getCameraStream('user');
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.muted = true;
        videoPreviewRef.current.play();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Camera/Microphone permission denied or device not found.');
    }
  };

  const handleStartRecord = async () => {
    if (!stream) return;
    try {
      await recorder.start(stream, (secs) => setDuration(secs));
      setIsRecording(true);
      setRecordedResult(null);
      soundEngine.playTilePop();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Could not start video recording.');
    }
  };

  const handleStopRecord = async () => {
    if (!isRecording) return;
    try {
      const result = await recorder.stop();
      setIsRecording(false);
      setRecordedResult(result);
      soundEngine.playTilePop();

      // Switch video element to recorded playback URL
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
        videoPreviewRef.current.src = result.url;
        videoPreviewRef.current.muted = false;
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to stop video recording.');
    }
  };

  const cleanup = () => {
    recorder.cancel();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsRecording(false);
    setRecordedResult(null);
    setDuration(0);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const handleRecordAgain = () => {
    cleanup();
    startCamera();
  };

  const handleSave = () => {
    if (!recordedResult) return;
    onSaveVideo({
      blob: recordedResult.blob,
      url: recordedResult.url,
      duration: recordedResult.duration,
      name: videoName.trim() || 'Learning Video',
    });
    soundEngine.playCorrectBell();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">{title}</h3>
              <p className="text-xs text-zinc-500">Record a phonics mouth blending demonstration</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Video Viewport */}
        <div className="relative my-4 rounded-2xl overflow-hidden bg-zinc-900 aspect-video shadow-inner flex items-center justify-center">
          <video
            ref={videoPreviewRef}
            className="w-full h-full object-cover"
            playsInline
            controls={!!recordedResult}
          />

          {isRecording && (
            <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow animate-pulse">
              <span className="w-2.5 h-2.5 bg-white rounded-full" />
              REC {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-2">
          {!isRecording && !recordedResult && (
            <button
              type="button"
              id="start-vid-rec-btn"
              onClick={handleStartRecord}
              disabled={!stream}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              id="stop-vid-rec-btn"
              onClick={handleStopRecord}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              <Square className="w-5 h-5 fill-white" />
              Stop Recording
            </button>
          )}

          {recordedResult && (
            <button
              type="button"
              onClick={handleRecordAgain}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Record Again
            </button>
          )}
        </div>

        {recordedResult && (
          <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Video Title / Label</label>
              <input
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="e.g. CVC Blending Mouth Movement"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-zinc-600 text-sm font-medium hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-vid-btn"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                Save Video to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
