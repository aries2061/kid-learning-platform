import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { PRESET_AVATARS } from '../../data/seedData';
import { soundEngine } from '../../utils/audio';
import { uploadMediaToBlob } from '../../services/blobStorageService';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  isCustomPhoto?: boolean;
  onSelectAvatar: (avatarUrl: string, isCustom: boolean) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatarUrl,
  isCustomPhoto,
  onSelectAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewCustom, setPreviewCustom] = useState<string | null>(
    isCustomPhoto && currentAvatarUrl ? currentAvatarUrl : null
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploaded = await uploadMediaToBlob(file, `avatar-${Date.now()}`, 'image');
      setPreviewCustom(uploaded.url);
      onSelectAvatar(uploaded.url, true);
      soundEngine.playTilePop();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
          Choose a Cute Cartoon Avatar
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {PRESET_AVATARS.map((avatar) => {
            const isSelected = !isCustomPhoto && currentAvatarUrl === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                id={`avatar-btn-${avatar.id}`}
                onClick={() => {
                  setPreviewCustom(null);
                  onSelectAvatar(avatar.id, false);
                  soundEngine.playTilePop();
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                  avatar.color
                } ${
                  isSelected
                    ? 'border-indigo-600 ring-4 ring-indigo-200 scale-105 shadow-md'
                    : 'border-transparent hover:border-zinc-300 hover:scale-105'
                }`}
              >
                <span className="text-3xl filter drop-shadow-sm">{avatar.icon}</span>
                <span className="text-[10px] font-medium text-zinc-700 mt-1 line-clamp-1">
                  {avatar.name.split(' ')[0]}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-200">
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
          Or Upload Child's Custom Photo
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            id="upload-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl border border-zinc-300 transition-colors"
          >
            <Upload className="w-4 h-4 text-zinc-500" />
            Upload Photo File
          </button>

          {isCustomPhoto && currentAvatarUrl && (
            <div className="flex items-center gap-2">
              <img
                src={currentAvatarUrl}
                alt="Child Avatar Preview"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-sm"
              />
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Photo Attached
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
