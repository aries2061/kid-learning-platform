import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Volume2,
  Video as VideoIcon,
  Upload,
  Mic,
  Camera,
  Search,
  Trash2,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaItem, MediaType } from '../../types';
import { AudioRecordModal } from '../common/AudioRecordModal';
import { VideoRecordModal } from '../common/VideoRecordModal';
import { soundEngine } from '../../utils/audio';

export const MaterialsLibrary: React.FC = () => {
  const { mediaItems, addMediaItem, deleteMediaItem } = useApp();
  const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [activePreviewMedia, setActivePreviewMedia] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = mediaItems.filter((item) => {
    const matchesType = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let mediaType: MediaType = 'image';
    if (file.type.startsWith('audio/')) mediaType = 'audio';
    else if (file.type.startsWith('video/')) mediaType = 'video';

    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      await addMediaItem({
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: mediaType,
        url,
        blobData: file,
        size: file.size,
      });
      soundEngine.playCorrectBell();
    };
    reader.readAsDataURL(file);
  };

  const handleAudioRecorded = async (result: { blob: Blob; url: string; duration: number; name: string }) => {
    await addMediaItem({
      name: result.name,
      type: 'audio',
      url: result.url,
      blobData: result.blob,
      duration: result.duration,
    });
  };

  const handleVideoRecorded = async (result: { blob: Blob; url: string; duration: number; name: string }) => {
    await addMediaItem({
      name: result.name,
      type: 'video',
      url: result.url,
      blobData: result.blob,
      duration: result.duration,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Learning Materials Library</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Upload from device, push-to-record voice audio, or record video with camera for questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            id="lib-upload-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs sm:text-sm rounded-xl border border-zinc-200 shadow-xs transition-all"
          >
            <Upload className="w-4 h-4 text-zinc-500" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            id="lib-push-rec-audio-btn"
            onClick={() => setShowAudioRecorder(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-105"
          >
            <Mic className="w-4 h-4" />
            <span>Push-to-Record Audio</span>
          </button>

          <button
            type="button"
            id="lib-rec-video-btn"
            onClick={() => setShowVideoRecorder(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>Record Video</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'image', 'audio', 'video'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeFilter === tab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab === 'all' ? 'All Files' : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-3">
            📁
          </div>
          <h3 className="font-extrabold text-zinc-800 text-base">Library is ready for materials</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            Upload phonics word images, record pronunciation clips with push-to-record, or record mouth videos.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAudioRecorder(true)}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              Record Audio Voice
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl"
            >
              Upload Local File
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-zinc-200 hover:border-indigo-400 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Media Preview Container */}
              <div
                onClick={() => setActivePreviewMedia(item)}
                className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center cursor-pointer mb-2 relative"
              >
                {item.type === 'image' && (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                )}
                {item.type === 'audio' && (
                  <div className="flex flex-col items-center justify-center text-rose-600 gap-1.5 p-2">
                    <div className="p-3 bg-rose-100 rounded-full group-hover:scale-110 transition-transform">
                      <Volume2 className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.duration ? `${item.duration}s` : 'Audio Clip'}
                    </span>
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center text-white">
                    <video src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white drop-shadow fill-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Type */}
              <div>
                <h4 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{item.name}</h4>
                <p className="text-[10px] text-zinc-400 capitalize flex items-center gap-1 mt-0.5">
                  <Tag className="w-3 h-3" /> {item.type}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    if (item.type === 'audio') soundEngine.playAudioUrl(item.url);
                    else setActivePreviewMedia(item);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${item.name}" from library?`)) {
                      deleteMediaItem(item.id);
                    }
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal for Audio/Video/Image */}
      {activePreviewMedia && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-black text-zinc-900 text-lg mb-3">{activePreviewMedia.name}</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
              {activePreviewMedia.type === 'image' && (
                <img src={activePreviewMedia.url} alt={activePreviewMedia.name} className="w-full h-full object-contain" />
              )}
              {activePreviewMedia.type === 'video' && (
                <video src={activePreviewMedia.url} controls autoPlay className="w-full h-full" />
              )}
              {activePreviewMedia.type === 'audio' && (
                <div className="p-8 flex flex-col items-center justify-center text-white">
                  <Volume2 className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
                  <audio src={activePreviewMedia.url} controls autoPlay className="w-full" />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActivePreviewMedia(null)}
                className="px-5 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio & Video Recording Modals */}
      <AudioRecordModal
        isOpen={showAudioRecorder}
        onClose={() => setShowAudioRecorder(false)}
        onSaveAudio={handleAudioRecorded}
      />
      <VideoRecordModal
        isOpen={showVideoRecorder}
        onClose={() => setShowVideoRecorder(false)}
        onSaveVideo={handleVideoRecorded}
      />
    </div>
  );
};
