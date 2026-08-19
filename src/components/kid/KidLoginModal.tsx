import React, { useState } from 'react';
import { X, Sparkles, Delete, KeyRound, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS } from '../../data/seedData';
import { soundEngine } from '../../utils/audio';

export const KidLoginModal: React.FC = () => {
  const { showKidLogin, setShowKidLogin, kids, loginAsKidBySerial, selectKidProfile, currentKid } = useApp();
  const [serialInput, setSerialInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showKidLogin) return null;

  const handleKeyPress = (char: string) => {
    if (serialInput.length < 4) {
      soundEngine.playTilePop();
      setSerialInput((prev) => (prev + char).toUpperCase());
      setErrorMsg(null);
    }
  };

  const handleDelete = () => {
    soundEngine.playTilePop();
    setSerialInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    soundEngine.playTilePop();
    setSerialInput('');
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serialInput.trim()) {
      setErrorMsg('Please enter your 4-digit secret PIN!');
      return;
    }
    const kid = loginAsKidBySerial(serialInput);
    if (!kid) {
      setErrorMsg('PIN not found! Check with parent or pick your picture card below.');
    } else {
      setSerialInput('');
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
              🌟
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Kid Login</h2>
              <p className="text-xs text-zinc-500">Enter your 4-letter/digit Secret PIN</p>
            </div>
          </div>
          <button
            onClick={() => setShowKidLogin(false)}
            className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-4 p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm font-bold rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        {/* PIN Display Boxes */}
        <div className="my-6">
          <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4">
            {[0, 1, 2, 3].map((index) => {
              const char = serialInput[index] || '';
              return (
                <div
                  key={index}
                  className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono transition-all shadow-inner ${
                    char
                      ? 'border-amber-400 bg-amber-50 text-amber-900 scale-105 shadow-md ring-4 ring-amber-100'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                  }`}
                >
                  {char || '•'}
                </div>
              );
            })}
          </div>

          {/* Quick Keypad */}
          <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
              <button
                key={digit}
                type="button"
                id={`pin-btn-${digit}`}
                onClick={() => handleKeyPress(digit)}
                className="h-12 bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-800 font-extrabold text-xl rounded-xl border border-zinc-200 active:scale-95 transition-all shadow-xs"
              >
                {digit}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto mt-3">
            <button
              type="button"
              id="pin-clear-btn"
              onClick={handleClear}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              id="pin-backspace-btn"
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
            >
              <Delete className="w-4 h-4" /> Del
            </button>
            <button
              type="button"
              id="pin-go-btn"
              onClick={() => handleLoginSubmit()}
              disabled={serialInput.length === 0}
              className="flex-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Go!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Profile Cards Selector */}
        <div className="pt-4 border-t border-zinc-100">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">
            Or Tap Your Profile Picture:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {kids.map((kid) => {
              const isSelected = currentKid?.id === kid.id;
              const preset = PRESET_AVATARS.find((a) => a.id === kid.avatarUrl) || PRESET_AVATARS[0];
              return (
                <button
                  key={kid.id}
                  type="button"
                  id={`quick-kid-btn-${kid.id}`}
                  onClick={() => selectKidProfile(kid)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 ring-4 ring-amber-200 scale-105 shadow-md'
                      : 'border-zinc-200 bg-zinc-50 hover:border-amber-300 hover:bg-white hover:scale-105'
                  }`}
                >
                  {kid.isCustomPhoto && kid.avatarUrl ? (
                    <img
                      src={kid.avatarUrl}
                      alt={kid.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shadow-sm"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${preset.color}`}>
                      {preset.icon}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-extrabold text-zinc-900 text-xs line-clamp-1">{kid.name}</p>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono">
                      PIN: {kid.serialNumber}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
