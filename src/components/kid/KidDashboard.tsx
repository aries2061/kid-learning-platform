import React, { useState } from 'react';
import { Play, Star, Sparkles, Trophy, Award, BookOpen, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS, DEFAULT_BADGES } from '../../data/seedData';
import { BadgeIcon } from '../common/BadgeIcon';
import { KidProfileView } from './KidProfileView';
import { soundEngine } from '../../utils/audio';

export const KidDashboard: React.FC = () => {
  const { sheets, currentKid, startPlayingSheet, getKidProgress, setShowKidLogin } = useApp();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const kidProgress = currentKid ? getKidProgress(currentKid.id) : null;
  const publishedSheets = sheets.filter((s) => s.isPublished);

  const getKidAvatarDisplay = () => {
    if (!currentKid) return null;
    if (currentKid.isCustomPhoto && currentKid.avatarUrl) {
      return (
        <img
          src={currentKid.avatarUrl}
          alt={currentKid.name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-4 ring-white shadow-inner"
        />
      );
    }
    const preset = PRESET_AVATARS.find((a) => a.id === currentKid.avatarUrl) || PRESET_AVATARS[0];
    return (
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-3xl shadow-inner ${preset.color} ring-4 ring-white`}>
        {preset.icon}
      </div>
    );
  };

  const unlockedBadgeIds = new Set(
    (kidProgress?.earnedBadges || []).map((b) => b.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar: Badges & Progress (from Vibrant Palette Theme) */}
      <aside className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
        {/* Badges Earned Card */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border-4 border-sky-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sky-900 font-black text-lg">Badges Earned</h3>
            <span className="text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              {kidProgress?.totalBadgesEarned || 0} / {DEFAULT_BADGES.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {DEFAULT_BADGES.map((badge, idx) => {
              const isUnlocked = unlockedBadgeIds.has(badge.id);
              const colors = [
                'bg-green-100 border-green-200 text-green-700',
                'bg-purple-100 border-purple-200 text-purple-700',
                'bg-blue-100 border-blue-200 text-blue-700',
                'bg-yellow-100 border-yellow-200 text-yellow-700',
                'bg-pink-100 border-pink-200 text-pink-700',
                'bg-orange-100 border-orange-200 text-orange-700',
              ];
              const badgeStyle = colors[idx % colors.length];

              return (
                <div
                  key={badge.id}
                  onClick={() => {
                    if (isUnlocked) {
                      soundEngine.playCorrectBell();
                      setShowProfileModal(true);
                    }
                  }}
                  title={`${badge.name}: ${badge.description}`}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-2xl border-2 shadow-xs transition-all cursor-pointer select-none ${badgeStyle} ${
                    isUnlocked ? 'hover:scale-105' : 'opacity-35 grayscale'
                  }`}
                >
                  <span>{isUnlocked ? (idx === 0 ? '🍎' : idx === 1 ? '🚀' : idx === 2 ? '🍦' : idx === 3 ? '🦁' : idx === 4 ? '👑' : '⭐') : '🔒'}</span>
                  <span className="text-[9px] font-black tracking-tight line-clamp-1 mt-0.5 px-1">
                    {badge.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border-4 border-sky-200 flex flex-col gap-4 flex-1">
          <h3 className="text-sky-900 font-black text-lg">Phonics Progress</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-black text-sky-700 mb-1.5">
                <span>Letter Sounds</span>
                <span>{kidProgress?.totalStarsEarned ? Math.min(100, kidProgress.totalStarsEarned * 15) : 35}%</span>
              </div>
              <div className="w-full h-3.5 bg-sky-50 rounded-full overflow-hidden border border-sky-200 p-0.5">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${kidProgress?.totalStarsEarned ? Math.min(100, kidProgress.totalStarsEarned * 15) : 35}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black text-sky-700 mb-1.5">
                <span>CVC Blending</span>
                <span>{kidProgress?.totalCompletedSheets ? Math.min(100, kidProgress.totalCompletedSheets * 25) : 42}%</span>
              </div>
              <div className="w-full h-3.5 bg-sky-50 rounded-full overflow-hidden border border-sky-200 p-0.5">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${kidProgress?.totalCompletedSheets ? Math.min(100, kidProgress.totalCompletedSheets * 25) : 42}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTilePop();
              setShowProfileModal(true);
            }}
            className="mt-auto p-3.5 bg-yellow-400 hover:bg-yellow-500 active:translate-y-0.5 rounded-2xl text-center shadow-md border-b-4 border-yellow-600 transition-all cursor-pointer"
          >
            <div className="text-yellow-950 font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-1.5">
              <span>🏆 View Trophy Case</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Quests Area */}
      <section className="flex-1 space-y-5">
        {/* Welcome Header */}
        <div className="bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-[2rem] border-4 border-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-400 border-3 border-white overflow-hidden shadow-inner flex items-center justify-center shrink-0">
              {getKidAvatarDisplay()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-sky-900">
                  {currentKid ? `${currentKid.name}'s World` : 'Explorer World'}
                </h2>
                {currentKid && (
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs font-black">
                    PIN: {currentKid.serialNumber}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-sky-600 mt-0.5">
                Choose a quest below to blend letters, listen to sounds, and earn stars! ⭐
              </p>
            </div>
          </div>

          {!currentKid && (
            <button
              type="button"
              onClick={() => setShowKidLogin(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-xs sm:text-sm rounded-2xl border-b-4 border-yellow-600 shadow-md transition-all whitespace-nowrap"
            >
              Sign In with PIN 🔑
            </button>
          )}
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {publishedSheets.map((sheet, index) => {
            const sheetAttempts = kidProgress ? kidProgress.sheetAttempts.filter((a) => a.sheetId === sheet.id) : [];
            const bestAttempt = sheetAttempts.sort((a, b) => b.scorePercentage - a.scorePercentage)[0];
            const isCompleted = !!bestAttempt && bestAttempt.status === 'completed';
            const isPassed = bestAttempt?.passed;

            return (
              <div
                key={sheet.id}
                className="bg-white rounded-[2rem] border-4 border-sky-100 hover:border-yellow-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between p-6 shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black text-xs border-2 border-orange-200">
                      {sheet.category || `Quest #${index + 1}`}
                    </span>

                    {isCompleted && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
                          isPassed ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}
                      >
                        {bestAttempt.scorePercentage}% {isPassed ? 'Passed ✓' : 'Practice'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xl font-black text-sky-950 group-hover:text-sky-700 transition-colors">
                    {sheet.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 line-clamp-2">
                    {sheet.description}
                  </p>
                </div>

                {/* Badge reward info */}
                <div className="my-4 p-3 bg-sky-50/70 rounded-2xl border-2 border-sky-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BadgeIcon badge={sheet.rewardBadge} size="sm" showLabel={false} />
                    <div>
                      <p className="text-xs font-black text-slate-800 line-clamp-1">{sheet.rewardBadge.name}</p>
                      <p className="text-[10px] text-sky-700 font-bold">Passing: {sheet.passingScore}%</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-sky-900 block">
                      {sheet.questionIds.length} Questions
                    </span>
                    {sheet.timeLimitSeconds && sheet.timeLimitSeconds > 0 ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end font-mono">
                        <Clock className="w-3 h-3" /> {Math.floor(sheet.timeLimitSeconds / 60)}m
                      </span>
                    ) : (
                      <span className="text-[10px] text-green-600 font-bold">No Time Limit</span>
                    )}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  type="button"
                  id={`start-sheet-btn-${sheet.id}`}
                  onClick={() => {
                    soundEngine.playTilePop();
                    startPlayingSheet(sheet);
                  }}
                  className="w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white font-black text-sm sm:text-base rounded-2xl shadow-md border-b-4 border-sky-700 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isCompleted ? 'Play Again 🌟' : 'Start Quest 🚀'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Kid Profile Modal */}
      <KidProfileView isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
};
