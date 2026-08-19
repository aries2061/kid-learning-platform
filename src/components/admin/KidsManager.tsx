import React, { useState } from 'react';
import { Plus, User, Trash2, Edit2, KeyRound, Sparkles, Star, Trophy, Search, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KidProfile } from '../../types';
import { PRESET_AVATARS } from '../../data/seedData';
import { AvatarPicker } from '../common/AvatarPicker';
import { soundEngine } from '../../utils/audio';

export const KidsManager: React.FC = () => {
  const { kids, addKid, updateKid, deleteKid, getKidProgress, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null);

  // Form State
  const [serialNumber, setSerialNumber] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState('avatar-lion');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredKids = kids.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    // Generate next serial number
    const nextSerial = String(1000 + kids.length + 1).slice(0, 4);
    setSerialNumber(nextSerial);
    setName('');
    setAge(5);
    setAvatarUrl('avatar-lion');
    setIsCustomPhoto(false);
    setNotes('');
    setErrorMsg(null);
    setEditingKid(null);
    setShowAddModal(true);
    soundEngine.playTilePop();
  };

  const openEditModal = (kid: KidProfile) => {
    setEditingKid(kid);
    setSerialNumber(kid.serialNumber);
    setName(kid.name);
    setAge(kid.age);
    setAvatarUrl(kid.avatarUrl || 'avatar-lion');
    setIsCustomPhoto(!!kid.isCustomPhoto);
    setNotes(kid.notes || '');
    setErrorMsg(null);
    setShowAddModal(true);
    soundEngine.playTilePop();
  };

  const handleSaveKid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !name.trim()) {
      setErrorMsg('Please provide a child name and a 4-character PIN/serial number.');
      return;
    }

    const cleanSerial = serialNumber.trim().toUpperCase().slice(0, 4);

    // Check duplicate serial
    const existing = kids.find(
      (k) => k.serialNumber.toUpperCase() === cleanSerial && (!editingKid || k.id !== editingKid.id)
    );
    if (existing) {
      setErrorMsg(`PIN "${cleanSerial}" is already assigned to ${existing.name}. Choose another PIN.`);
      return;
    }

    if (editingKid) {
      await updateKid({
        ...editingKid,
        serialNumber: cleanSerial,
        name: name.trim(),
        age: Number(age),
        avatarUrl,
        isCustomPhoto,
        notes: notes.trim(),
      });
    } else {
      await addKid({
        serialNumber: cleanSerial,
        name: name.trim(),
        age: Number(age),
        avatarUrl,
        isCustomPhoto,
        notes: notes.trim(),
      });
    }

    soundEngine.playCorrectBell();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Kid Accounts & Profiles</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Manage personalized 4-digit PIN student profiles with avatars and custom photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            id="add-kid-btn"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Kid Profile</span>
          </button>
        </div>
      </div>

      {/* Kids Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKids.map((kid) => {
          const progress = getKidProgress(kid.id);
          const preset = PRESET_AVATARS.find((a) => a.id === kid.avatarUrl) || PRESET_AVATARS[0];

          return (
            <div
              key={kid.id}
              className="bg-white rounded-3xl border-2 border-zinc-200/80 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Profile Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {kid.isCustomPhoto && kid.avatarUrl ? (
                      <img
                        src={kid.avatarUrl}
                        alt={kid.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-400 shadow-sm"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${preset.color}`}>
                        {preset.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-zinc-900 text-base">{kid.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs font-mono">
                          PIN: {kid.serialNumber}
                        </span>
                        <span className="text-xs text-zinc-400">{kid.age} yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(kid)}
                      className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete profile for ${kid.name}?`)) {
                          deleteKid(kid.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {kid.notes && (
                  <p className="text-xs text-zinc-500 italic mt-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 line-clamp-2">
                    "{kid.notes}"
                  </p>
                )}

                {/* Progress Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Stars</p>
                    <p className="font-black text-amber-600 text-sm flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{progress.totalStarsEarned}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Points</p>
                    <p className="font-black text-indigo-600 text-sm">
                      {progress.totalPointsEarned}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Badges</p>
                    <p className="font-black text-purple-600 text-sm flex items-center justify-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-purple-500" />
                      <span>{progress.totalBadgesEarned}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* View Progress Button */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTilePop();
                  setActiveTab('analytics');
                }}
                className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>View Full Learning Progress Tracker</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Kid Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-zinc-900 pb-3 border-b border-zinc-100">
              {editingKid ? `Edit Profile: ${editingKid.name}` : 'Create New Kid Profile'}
            </h3>

            {errorMsg && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveKid} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Secret PIN (Max 4 Chars/Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 1001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-base font-mono font-bold tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-zinc-400">Used by child to log in</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Child's Age
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={12}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Child's Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leo Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Avatar Selector */}
              <AvatarPicker
                currentAvatarUrl={avatarUrl}
                isCustomPhoto={isCustomPhoto}
                onSelectAvatar={(url, isCustom) => {
                  setAvatarUrl(url);
                  setIsCustomPhoto(isCustom);
                }}
              />

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Teacher / Parent Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Working on short vowel blends"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-600 text-sm font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  {editingKid ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
