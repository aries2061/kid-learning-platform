import React from 'react';
import { Award, CheckCircle2, Clock, Sparkles, Star, Trophy, X, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS } from '../../data/seedData';
import { BadgeIcon } from '../common/BadgeIcon';

interface KidProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KidProfileView: React.FC<KidProfileViewProps> = ({ isOpen, onClose }) => {
  const { currentKid, getKidProgress, sheets, badges } = useApp();

  if (!isOpen || !currentKid) return null;

  const progress = getKidProgress(currentKid.id);
  const presetAvatar = PRESET_AVATARS.find((a) => a.id === currentKid.avatarUrl) || PRESET_AVATARS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 rounded-t-[22px] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentKid.isCustomPhoto && currentKid.avatarUrl ? (
              <img
                src={currentKid.avatarUrl}
                alt={currentKid.name}
                className="w-16 h-16 rounded-3xl object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-md ${presetAvatar.color} ring-4 ring-white`}>
                {presetAvatar.icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{currentKid.name}</h2>
                <span className="px-2.5 py-0.5 bg-black/20 text-white rounded-full text-xs font-black font-mono">
                  PIN: {currentKid.serialNumber}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                Age: {currentKid.age} years • Early Phonics Reader
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <p className="text-xs font-bold text-amber-600 uppercase">Stars Earned</p>
              <p className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{progress.totalStarsEarned}</span>
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
              <p className="text-xs font-bold text-indigo-600 uppercase">Total Points</p>
              <p className="text-2xl font-black text-indigo-600 flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-5 h-5" />
                <span>{progress.totalPointsEarned}</span>
              </p>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
              <p className="text-xs font-bold text-purple-600 uppercase">Badges Won</p>
              <p className="text-2xl font-black text-purple-600 flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-5 h-5" />
                <span>{progress.totalBadgesEarned}</span>
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <p className="text-xs font-bold text-emerald-600 uppercase">Sheets Passed</p>
              <p className="text-2xl font-black text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
                <span>{progress.completedSheetsCount}</span>
              </p>
            </div>
          </div>

          {/* Badges Collection Locker */}
          <div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Badges Trophy Case ({progress.earnedBadges.length}/{badges.length})</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              {badges.map((badge) => {
                const isEarned = progress.earnedBadges.some((b) => b.id === badge.id);
                return (
                  <BadgeIcon
                    key={badge.id}
                    badge={badge}
                    size="sm"
                    isUnlocked={isEarned}
                    showLabel={true}
                  />
                );
              })}
            </div>
          </div>

          {/* Sheets Activity Progress Breakdown */}
          <div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Question Sheets Learning Status</span>
            </h3>

            <div className="space-y-2.5">
              {sheets.map((sheet) => {
                const sheetAttempts = progress.sheetAttempts.filter((a) => a.sheetId === sheet.id);
                const bestAttempt = sheetAttempts.sort((a, b) => b.scorePercentage - a.scorePercentage)[0];
                const isCompleted = !!bestAttempt && bestAttempt.status === 'completed';

                return (
                  <div
                    key={sheet.id}
                    className="p-3.5 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-800 line-clamp-1">{sheet.title}</h4>
                      <p className="text-xs text-zinc-400">Category: {sheet.category} • Passing: {sheet.passingScore}%</p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                            bestAttempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {bestAttempt.scorePercentage}% {bestAttempt.passed ? 'Passed' : 'Needs Practice'}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-xl text-xs font-bold">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
