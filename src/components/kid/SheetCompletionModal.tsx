import React from 'react';
import { Award, CheckCircle2, RotateCcw, Sparkles, Star, Trophy, ArrowRight, Home } from 'lucide-react';
import { QuestionSheet, SheetAttempt } from '../../types';
import { BadgeIcon } from '../common/BadgeIcon';
import { soundEngine } from '../../utils/audio';

interface SheetCompletionModalProps {
  sheet: QuestionSheet;
  attempt: SheetAttempt;
  onRetry: () => void;
  onExit: () => void;
}

export const SheetCompletionModal: React.FC<SheetCompletionModalProps> = ({
  sheet,
  attempt,
  onRetry,
  onExit,
}) => {
  const isPassed = attempt.passed;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Celebration Header */}
        <div className="flex flex-col items-center">
          <div className="text-5xl mb-2 animate-bounce">
            {isPassed ? '🎉' : '🌟'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
            {isPassed ? 'Sheet Completed!' : 'Quest Finished!'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            {sheet.title}
          </p>
        </div>

        {/* Badge Ceremony (If passed) */}
        {isPassed && attempt.earnedBadge && (
          <div className="my-6 p-4 sm:p-6 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-300 shadow-inner flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              New Reward Badge Unlocked!
            </div>
            <BadgeIcon badge={attempt.earnedBadge} size="lg" showLabel={true} />
          </div>
        )}

        {/* Score & Rewards Breakdown */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <p className="text-[11px] font-bold text-zinc-400 uppercase">Score</p>
            <p className={`text-xl sm:text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-zinc-700'}`}>
              {attempt.scorePercentage}%
            </p>
            <p className="text-[10px] text-zinc-400">
              {attempt.correctCount}/{attempt.totalQuestions} Correct
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-[11px] font-bold text-amber-600 uppercase">Stars Won</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{attempt.totalStarsEarned}</span>
            </p>
            <p className="text-[10px] text-amber-700">Shiny Stars</p>
          </div>

          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
            <p className="text-[11px] font-bold text-indigo-600 uppercase">Points</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5" />
              <span>+{attempt.totalPointsEarned}</span>
            </p>
            <p className="text-[10px] text-indigo-700">Bonus Score</p>
          </div>
        </div>

        {/* Status Message */}
        <div className="my-3">
          <p className="text-xs sm:text-sm font-semibold text-zinc-600">
            {isPassed
              ? `Outstanding phonics skills! You achieved higher than the ${sheet.passingScore}% passing score!`
              : `Great effort! Passing score is ${sheet.passingScore}%. Try once more to earn your shiny badge!`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            id="sheet-retry-btn"
            onClick={onRetry}
            className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm rounded-2xl border border-zinc-300 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>

          <button
            type="button"
            id="sheet-finish-btn"
            onClick={onExit}
            className="flex-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <Home className="w-4 h-4" />
            Back to Adventure Map
          </button>
        </div>
      </div>
    </div>
  );
};
