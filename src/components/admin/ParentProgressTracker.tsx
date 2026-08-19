import React, { useState } from 'react';
import {
  User,
  Star,
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS } from '../../data/seedData';
import { BadgeIcon } from '../common/BadgeIcon';
import { soundEngine } from '../../utils/audio';

export const ParentProgressTracker: React.FC = () => {
  const { kids, sheets, getKidProgress } = useApp();
  const [selectedKidId, setSelectedKidId] = useState<string>(kids[0]?.id || '');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  const currentKid = kids.find((k) => k.id === selectedKidId) || kids[0];
  const progress = currentKid ? getKidProgress(currentKid.id) : null;
  const presetAvatar = currentKid
    ? PRESET_AVATARS.find((a) => a.id === currentKid.avatarUrl) || PRESET_AVATARS[0]
    : PRESET_AVATARS[0];

  // Group sheets into Completed, In Progress, and Not Started
  const completedSheetIds = new Set(
    (progress?.sheetAttempts || []).filter((a) => a.status === 'completed').map((a) => a.sheetId)
  );

  const inProgressSheetIds = new Set(
    (progress?.sheetAttempts || []).filter((a) => a.status === 'in_progress').map((a) => a.sheetId)
  );

  const completedSheets = sheets.filter((s) => completedSheetIds.has(s.id));
  const inProgressSheets = sheets.filter((s) => inProgressSheetIds.has(s.id) && !completedSheetIds.has(s.id));
  const notStartedSheets = sheets.filter((s) => !completedSheetIds.has(s.id) && !inProgressSheetIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Header & Kid Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Parent & Teacher Progress Tracker</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Monitor phonics blending accuracy, star metrics, scores, and itemized answer attempts.
          </p>
        </div>

        {/* Kid Profile Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-xs">
          <span className="text-xs font-bold text-zinc-400 pl-2">Student:</span>
          <select
            value={selectedKidId}
            onChange={(e) => {
              setSelectedKidId(e.target.value);
              soundEngine.playTilePop();
            }}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-black text-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.name} (PIN: {kid.serialNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentKid && progress ? (
        <>
          {/* Top Student Overview Bento */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {currentKid.isCustomPhoto && currentKid.avatarUrl ? (
                <img
                  src={currentKid.avatarUrl}
                  alt={currentKid.name}
                  className="w-18 h-18 rounded-3xl object-cover ring-4 ring-indigo-200 shadow-md"
                />
              ) : (
                <div className={`w-18 h-18 rounded-3xl flex items-center justify-center text-4xl shadow-md ${presetAvatar.color} ring-4 ring-indigo-200`}>
                  {presetAvatar.icon}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-zinc-900">{currentKid.name}</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-mono font-bold">
                    PIN: {currentKid.serialNumber}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Age: {currentKid.age} years • Registered in Phonics Quest
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-24">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Stars Earned</p>
                <p className="text-xl font-black text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{progress.totalStarsEarned}</span>
                </p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-center min-w-24">
                <p className="text-[10px] font-bold text-indigo-600 uppercase">Total Points</p>
                <p className="text-xl font-black text-indigo-600 mt-0.5">
                  {progress.totalPointsEarned}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-24">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Correct</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  {progress.totalCorrectAnswers}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center min-w-24">
                <p className="text-[10px] font-bold text-purple-600 uppercase">Badges Won</p>
                <p className="text-xl font-black text-purple-600 mt-0.5">
                  {progress.totalBadgesEarned}
                </p>
              </div>
            </div>
          </div>

          {/* Badges Locker Display */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Earned Reward Badges ({progress.earnedBadges.length})</span>
            </h3>

            {progress.earnedBadges.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-2">
                No badges earned yet. When {currentKid.name} completes sheets above passing score, badges will appear here!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {progress.earnedBadges.map((badge) => (
                  <BadgeIcon key={badge.id} badge={badge} size="md" isUnlocked={true} showLabel={true} />
                ))}
              </div>
            )}
          </div>

          {/* 3 Categories of Question Sheets Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Completed Sheets */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Completed Sheets ({completedSheets.length})</span>
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Done
                </span>
              </div>

              {completedSheets.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-4 text-center">No completed sheets yet.</p>
              ) : (
                completedSheets.map((sheet) => {
                  const attempts = progress.sheetAttempts.filter((a) => a.sheetId === sheet.id);
                  const best = attempts.sort((a, b) => b.scorePercentage - a.scorePercentage)[0];
                  return (
                    <div key={sheet.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{sheet.title}</h5>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          best?.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {best?.scorePercentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Passing: {sheet.passingScore}% • {best?.correctCount}/{best?.totalQuestions} Correct
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. In Progress Sheets */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>In Progress ({inProgressSheets.length})</span>
                </h4>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {inProgressSheets.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-4 text-center">No sheets currently in progress.</p>
              ) : (
                inProgressSheets.map((sheet) => (
                  <div key={sheet.id} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <h5 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{sheet.title}</h5>
                    <p className="text-[11px] text-amber-700 mt-1">
                      {sheet.questionIds.length} Total Questions
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* 3. Not Started Sheets */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h4 className="font-extrabold text-sm text-zinc-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span>Not Started ({notStartedSheets.length})</span>
                </h4>
                <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                  Pending
                </span>
              </div>

              {notStartedSheets.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-4 text-center">All sheets started!</p>
              ) : (
                notStartedSheets.map((sheet) => (
                  <div key={sheet.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <h5 className="font-extrabold text-xs text-zinc-900 line-clamp-1">{sheet.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Category: {sheet.category} • {sheet.questionIds.length} Questions
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Itemized Question Answer History Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Detailed Session History & Itemized Questions Answered</span>
            </h3>

            {progress.sheetAttempts.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-3">No activity logs recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {progress.sheetAttempts.map((attempt) => {
                  const isExpanded = expandedAttemptId === attempt.id;
                  return (
                    <div
                      key={attempt.id}
                      className="border border-zinc-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
                    >
                      {/* Attempt Summary Row */}
                      <div
                        onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.id)}
                        className="p-4 bg-zinc-50 hover:bg-zinc-100/80 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl text-white text-xs font-bold ${
                            attempt.passed ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}>
                            {attempt.passed ? 'PASSED' : 'PRACTICE'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-zinc-900">{attempt.sheetTitle}</h4>
                            <p className="text-[11px] text-zinc-500">
                              {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()} at{' '}
                              {new Date(attempt.completedAt || attempt.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-black text-base text-zinc-900">{attempt.scorePercentage}%</span>
                            <span className="text-[10px] text-zinc-400 block">
                              {attempt.correctCount}/{attempt.totalQuestions} Correct
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded Question Details */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-zinc-200 space-y-2.5">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            Questions Answered:
                          </p>
                          {attempt.answers.map((ans, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                                ans.isCorrect
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {ans.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="font-bold text-zinc-900">{ans.questionText}</p>
                                  <p className="text-[10px] text-zinc-500">
                                    Child's Answer: <span className="font-bold">{JSON.stringify(ans.userAnswer)}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="text-right font-bold text-[11px]">
                                {ans.starsAwarded > 0 && <span className="text-amber-600">+{ans.starsAwarded} ⭐ </span>}
                                {ans.pointsAwarded > 0 && <span className="text-indigo-600">+{ans.pointsAwarded} pts</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-zinc-200">
          <p className="text-sm font-bold text-zinc-600">No kid profiles found. Add a profile in Kid Profiles tab!</p>
        </div>
      )}
    </div>
  );
};
