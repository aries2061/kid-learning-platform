import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Volume2, Video as VideoIcon, Upload, Mic, Camera, Check, X, Search, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaItem, MediaType } from '../../types';
import { AudioRecordModal } from './AudioRecordModal';
import { VideoRecordModal } from './VideoRecordModal';
import { soundEngine } from '../../utils/audio';

interface MediaPickerModalProps {
  isOpen: boolean;
  typeFilter?: MediaType | 'all';
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  typeFilter = 'all',
  onClose,
  onSelectMedia,
}) => {
  const { mediaItems, addMediaItem, deleteMediaItem } = useApp();
  const [activeTab, setActiveTab] = useState<MediaType | 'all'>(typeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [previewingAudio, setPreviewingAudio] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredMedia = mediaItems.filter((item) => {
    const matchesType = activeTab === 'all' || item.type === activeTab;
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
      const created = await addMediaItem({
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: mediaType,
        url,
        blobData: file,
        size: file.size,
      });
      soundEngine.playCorrectBell();
      onSelectMedia(created);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleAudioRecorded = async (result: { blob: Blob; url: string; duration: number; name: string }) => {
    const created = await addMediaItem({
      name: result.name,
      type: 'audio',
      url: result.url,
      blobData: result.blob,
      duration: result.duration,
    });
    onSelectMedia(created);
    onClose();
  };

  const handleVideoRecorded = async (result: { blob: Blob; url: string; duration: number; name: string }) => {
    const created = await addMediaItem({
      name: result.name,
      type: 'video',
      url: result.url,
      blobData: result.blob,
      duration: result.duration,
    });
    onSelectMedia(created);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Learning Materials Library</h3>
              <p className="text-xs text-zinc-500">Select, upload or record audio/video materials</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions & Filters */}
          <div className="p-4 bg-zinc-50 border-b border-zinc-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Type Tabs */}
              <div className="flex items-center gap-1 bg-zinc-200/70 p-1 rounded-xl">
                {(['all', 'image', 'audio', 'video'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Action Upload & Record Buttons */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  id="picker-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  id="picker-rec-audio-btn"
                  onClick={() => setShowAudioRecorder(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Record Audio
                </button>
                <button
                  type="button"
                  id="picker-rec-video-btn"
                  onClick={() => setShowVideoRecorder(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Record Video
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search materials by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid Content */}
          <div className="p-4 overflow-y-auto flex-1 min-h-[260px]">
            {filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <ImageIcon className="w-12 h-12 stroke-1 mb-2 text-zinc-300" />
                <p className="text-sm font-semibold text-zinc-600">No media materials found</p>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Upload an image/audio/video file or click Push-to-Record to capture voice directly!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-zinc-50 hover:bg-white rounded-2xl border border-zinc-200 hover:border-indigo-400 hover:shadow-md p-3 flex flex-col justify-between transition-all"
                  >
                    {/* Media Thumbnail / Preview */}
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center mb-2">
                      {item.type === 'image' && (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      )}
                      {item.type === 'audio' && (
                        <div className="flex flex-col items-center justify-center text-rose-600 gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.playAudioUrl(item.url);
                            }}
                            className="p-2.5 bg-rose-100 hover:bg-rose-200 rounded-full transition-transform hover:scale-110"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {item.duration ? `${item.duration}s` : 'Audio Clip'}
                          </span>
                        </div>
                      )}
                      {item.type === 'video' && (
                        <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center text-white">
                          <video src={item.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <VideoIcon className="w-6 h-6 text-white drop-shadow" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-zinc-800 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">{item.type}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectMedia(item);
                          soundEngine.playTilePop();
                          onClose();
                        }}
                        className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 mr-1.5"
                      >
                        <Check className="w-3 h-3" /> Select
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMediaItem(item.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete from Library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </>
  );
};
