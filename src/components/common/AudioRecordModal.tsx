import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, X, Volume2 } from 'lucide-react';
import { AudioRecorder, RecordingResult } from '../../utils/recorder';
import { soundEngine } from '../../utils/audio';

interface AudioRecordModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onSaveAudio: (result: { blob: Blob; url: string; duration: number; name: string }) => void;
}

export const AudioRecordModal: React.FC<AudioRecordModalProps> = ({
  isOpen,
  title = 'Record Audio Voice',
  onClose,
  onSaveAudio,
}) => {
  const [recorder] = useState(() => new AudioRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [recordedResult, setRecordedResult] = useState<RecordingResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioName, setAudioName] = useState('Voice Recording ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handleCancel();
    } else {
      setDuration(0);
      setRecordedResult(null);
      setErrorMsg(null);
      setIsPlaying(false);
    }
  }, [isOpen]);

  const updateWaveform = () => {
    if (isRecording) {
      const vol = recorder.getVolumeLevel();
      setVolumeLevel(vol);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  const handleStartRecording = async () => {
    setErrorMsg(null);
    try {
      await recorder.start((secs) => setDuration(secs));
      setIsRecording(true);
      setRecordedResult(null);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Microphone access was denied or is not available. Please allow mic permission.');
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    try {
      const result = await recorder.stop();
      setIsRecording(false);
      setRecordedResult(result);
      setVolumeLevel(0);
      soundEngine.playTilePop();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to stop recording.');
    }
  };

  const handleCancel = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    recorder.cancel();
    setIsRecording(false);
    setRecordedResult(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  const handlePlayPreview = () => {
    if (!recordedResult) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(recordedResult.url);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = recordedResult.url;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    if (!recordedResult) return;
    onSaveAudio({
      blob: recordedResult.blob,
      url: recordedResult.url,
      duration: recordedResult.duration,
      name: audioName.trim() || 'Voice Recording',
    });
    soundEngine.playCorrectBell();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">{title}</h3>
              <p className="text-xs text-zinc-500">Record pronunciation or voice prompt</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
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

        <div className="py-8 flex flex-col items-center justify-center">
          {/* Waveform / Visualizer Circles */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className={`absolute rounded-full transition-all duration-100 ${
                isRecording ? 'bg-rose-500/20' : 'bg-transparent'
              }`}
              style={{
                width: isRecording ? `${100 + volumeLevel * 140}px` : '100px',
                height: isRecording ? `${100 + volumeLevel * 140}px` : '100px',
              }}
            />
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                isRecording
                  ? 'bg-rose-600 animate-pulse ring-8 ring-rose-300'
                  : recordedResult
                  ? 'bg-emerald-600 ring-8 ring-emerald-100'
                  : 'bg-zinc-800 ring-8 ring-zinc-100'
              }`}
            >
              {isRecording ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : recordedResult ? (
                <Volume2 className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-3xl font-extrabold text-zinc-800 tracking-wider font-mono">
            {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
          </div>
          <p className="text-xs font-medium text-zinc-400 mt-1">
            {isRecording
              ? 'Recording in progress... Speak clearly'
              : recordedResult
              ? 'Recording finished! Listen below or record again'
              : 'Tap "Start Recording" when ready'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {!isRecording && !recordedResult && (
              <button
                type="button"
                id="start-rec-btn"
                onClick={handleStartRecording}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                id="stop-rec-btn"
                onClick={handleStopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                <Square className="w-5 h-5 fill-white" />
                Stop Recording
              </button>
            )}

            {recordedResult && (
              <>
                <button
                  type="button"
                  id="preview-rec-btn"
                  onClick={handlePlayPreview}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-indigo-700" />}
                  {isPlaying ? 'Pause' : 'Play Preview'}
                </button>
                <button
                  type="button"
                  id="re-rec-btn"
                  onClick={handleStartRecording}
                  className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-all"
                  title="Record Again"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {recordedResult && (
          <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Audio Label / Title</label>
              <input
                type="text"
                value={audioName}
                onChange={(e) => setAudioName(e.target.value)}
                placeholder="e.g. CVC Word Sound: CAT"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-zinc-600 text-sm font-medium hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-audio-btn"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                Save Audio to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
