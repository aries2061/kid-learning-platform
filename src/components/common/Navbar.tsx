import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Music2,
  User,
  Shield,
  Star,
  Award,
  LogOut,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS } from '../../data/seedData';
import { soundEngine } from '../../utils/audio';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentKid,
    isAdminLoggedIn,
    logoutAdmin,
    setShowAdminLogin,
    setShowKidLogin,
    isMuted,
    toggleMute,
    isBgmMuted,
    toggleBgmMute,
    getKidProgress,
    activeSheet,
    exitPlayingSheet,
  } = useApp();

  const kidProgress = currentKid ? getKidProgress(currentKid.id) : null;

  const getKidAvatarDisplay = () => {
    if (!currentKid) return null;
    if (currentKid.isCustomPhoto && currentKid.avatarUrl) {
      return (
        <img
          src={currentKid.avatarUrl}
          alt={currentKid.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-inner"
        />
      );
    }
    const preset = PRESET_AVATARS.find((a) => a.id === currentKid.avatarUrl) || PRESET_AVATARS[0];
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-inner ${preset.color} ring-2 ring-white`}>
        {preset.icon}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-white border-b-4 border-yellow-400 px-4 sm:px-8 flex items-center justify-between shadow-md relative">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          {activeSheet ? (
            <button
              onClick={() => {
                soundEngine.playTilePop();
                exitPlayingSheet();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 active:translate-y-0.5 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-yellow-600 shadow-md transition-all"
            >
              <span>← Back to Map</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Vibrant Pink Badge Logo */}
              <div className="bg-pink-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl rotate-2 shadow-lg hover:rotate-0 transition-transform">
                <div className="text-white font-black text-lg sm:text-2xl tracking-tighter uppercase">
                  Magic Words
                </div>
              </div>

              <div className="hidden lg:flex items-center">
                <div className="bg-orange-100 text-orange-700 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm border-2 border-orange-200 flex items-center gap-1.5">
                  <span>Level 2: CVC Explorer</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Kid Stats (When in Kid Mode & Kid Logged in) */}
        {currentRole === 'kid' && currentKid && kidProgress && !activeSheet && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 px-4 py-1.5 rounded-full shadow-xs">
              <span className="text-xl">⭐</span>
              <span className="font-black text-yellow-700 text-base">{kidProgress.totalStarsEarned}</span>
              <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Stars</span>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-50 border-2 border-blue-200 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-black text-blue-900 text-sm">{kidProgress.totalPointsEarned} Pts</span>
            </div>
          </div>
        )}

        {/* Right Actions: Audio Toggles + Profile/Admin Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound FX Toggle */}
          <button
            type="button"
            id="sound-fx-toggle"
            onClick={toggleMute}
            className={`p-2 rounded-xl border-2 transition-all shadow-xs ${
              isMuted
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100'
            }`}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* BGM Toggle */}
          <button
            type="button"
            id="bgm-toggle"
            onClick={toggleBgmMute}
            className={`p-2 rounded-xl border-2 transition-all shadow-xs ${
              isBgmMuted
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
            }`}
            title={isBgmMuted ? 'Play Music' : 'Mute Music'}
          >
            {isBgmMuted ? <Music2 className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" /> : <Music className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Current Kid Profile Pill */}
          {currentRole === 'kid' && (
            <>
              {currentKid ? (
                <button
                  type="button"
                  id="kid-profile-btn"
                  onClick={() => setShowKidLogin(true)}
                  className="flex items-center gap-2.5 bg-blue-50 border-2 border-blue-200 pl-1.5 pr-3.5 py-1 rounded-full shadow-xs hover:bg-blue-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-white overflow-hidden shadow-inner flex items-center justify-center">
                    {getKidAvatarDisplay()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase font-black text-blue-400 leading-none">Explorer</span>
                    <span className="text-xs font-black text-blue-900 leading-tight line-clamp-1">{currentKid.name}</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  id="kid-login-btn"
                  onClick={() => setShowKidLogin(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-black text-xs sm:text-sm rounded-full border-b-2 border-yellow-600 shadow-sm transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Kid Login</span>
                </button>
              )}
            </>
          )}

          {/* Admin Switch / Login */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="admin-logout-btn"
                onClick={logoutAdmin}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Admin</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="admin-login-nav-btn"
              onClick={() => setShowAdminLogin(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-2xl border-2 border-indigo-200 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
              title="Open Admin & Teacher Studio (Question Bank, Question Sets, Materials Library)"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Admin Studio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
