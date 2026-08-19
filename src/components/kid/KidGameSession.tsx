import React, { useEffect, useState } from 'react';
import { Clock, Star, Sparkles, X, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionAnswerRecord, QuestionSheet, SheetAttempt } from '../../types';
import { soundEngine } from '../../utils/audio';
import { CVCBlendingQuestion } from './CVCBlendingQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FillInTheBlankQuestion } from './FillInTheBlankQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { SheetCompletionModal } from './SheetCompletionModal';

interface KidGameSessionProps {
  sheet: QuestionSheet;
}

export const KidGameSession: React.FC<KidGameSessionProps> = ({ sheet }) => {
  const { questions, currentKid, recordAttempt, exitPlayingSheet } = useApp();

  // Load questions in specified order
  const sheetQuestions: Question[] = sheet.questionIds
    .map((qid) => questions.find((q) => q.id === qid))
    .filter((q): q is Question => !!q);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswerRecord[]>([]);
  const [starsEarned, setStarsEarned] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    sheet.timeLimitSeconds && sheet.timeLimitSeconds > 0 ? sheet.timeLimitSeconds : null
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [finishedAttempt, setFinishedAttempt] = useState<SheetAttempt | null>(null);

  // Total stars possible in this sheet
  const totalStarsInSheet = sheetQuestions
    .filter((q) => q.rewardType === 'stars')
    .reduce((acc, q) => acc + q.rewardValue, 0);

  // Total points possible
  const totalPointsInSheet = sheetQuestions
    .filter((q) => q.rewardType === 'points')
    .reduce((acc, q) => acc + q.rewardValue, 0);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || isCompleted) return;
    if (timeLeft <= 0) {
      handleCompleteSheet();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  const currentQuestion = sheetQuestions[currentIndex];

  const handleAnswerQuestion = (isCorrect: boolean, answerData: unknown) => {
    if (!currentQuestion) return;

    let awardedStars = 0;
    let awardedPoints = 0;

    if (isCorrect) {
      if (currentQuestion.rewardType === 'stars') {
        awardedStars = currentQuestion.rewardValue;
        setStarsEarned((prev) => prev + awardedStars);
      } else {
        awardedPoints = currentQuestion.rewardValue;
        setPointsEarned((prev) => prev + awardedPoints);
      }
    }

    const answerRecord: QuestionAnswerRecord = {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      questionText: currentQuestion.questionText,
      userAnswer: answerData as string | string[] | Record<string, string>,
      isCorrect,
      starsAwarded: awardedStars,
      pointsAwarded: awardedPoints,
      answeredAt: Date.now(),
    };

    const nextAnswers = [...answers, answerRecord];
    setAnswers(nextAnswers);

    // Move to next question or complete sheet
    if (currentIndex < sheetQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finalizeSheet(nextAnswers, starsEarned + awardedStars, pointsEarned + awardedPoints);
    }
  };

  const handleSkipQuestion = () => {
    if (!currentQuestion) return;
    const answerRecord: QuestionAnswerRecord = {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      questionText: currentQuestion.questionText,
      userAnswer: 'SKIPPED',
      isCorrect: false,
      starsAwarded: 0,
      pointsAwarded: 0,
      answeredAt: Date.now(),
    };
    const nextAnswers = [...answers, answerRecord];
    setAnswers(nextAnswers);

    if (currentIndex < sheetQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finalizeSheet(nextAnswers, starsEarned, pointsEarned);
    }
  };

  const handleCompleteSheet = () => {
    finalizeSheet(answers, starsEarned, pointsEarned);
  };

  const finalizeSheet = async (
    allAnswers: QuestionAnswerRecord[],
    finalStars: number,
    finalPoints: number
  ) => {
    const totalQuestions = sheetQuestions.length;
    const correctCount = allAnswers.filter((a) => a.isCorrect).length;
    const incorrectCount = allAnswers.filter((a) => !a.isCorrect).length;
    const scorePercentage = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
    const passed = scorePercentage >= sheet.passingScore;

    // Bonus points if passed
    const bonus = passed ? sheet.rewardBonusPoints || 0 : 0;
    const totalPoints = finalPoints + bonus;

    const attempt: SheetAttempt = {
      id: 'att-' + Date.now(),
      kidId: currentKid?.id || 'guest',
      sheetId: sheet.id,
      sheetTitle: sheet.title,
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      status: 'completed',
      totalQuestions,
      answeredCount: allAnswers.length,
      correctCount,
      incorrectCount,
      totalStarsEarned: finalStars,
      totalPointsEarned: totalPoints,
      scorePercentage,
      passed,
      earnedBadge: passed ? sheet.rewardBadge : undefined,
      answers: allAnswers,
    };

    setFinishedAttempt(attempt);
    setIsCompleted(true);
    await recordAttempt(attempt);

    if (passed) {
      soundEngine.playCelebrationFanfare();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setStarsEarned(0);
    setPointsEarned(0);
    setTimeLeft(sheet.timeLimitSeconds && sheet.timeLimitSeconds > 0 ? sheet.timeLimitSeconds : null);
    setIsCompleted(false);
    setFinishedAttempt(null);
  };

  // Background Theme Styling
  const getThemeBackgroundClass = () => {
    switch (sheet.backgroundTheme) {
      case 'safari':
        return 'bg-gradient-to-b from-amber-100 via-emerald-50 to-amber-50';
      case 'space':
        return 'bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 text-white';
      case 'ocean':
        return 'bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-100';
      case 'rainbow':
        return 'bg-gradient-to-b from-pink-100 via-yellow-50 to-indigo-100';
      case 'sunset':
        return 'bg-gradient-to-b from-orange-100 via-rose-50 to-purple-100';
      case 'meadow':
        return 'bg-gradient-to-b from-emerald-100 via-green-50 to-lime-50';
      case 'candy':
      default:
        return 'bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50';
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-5rem)] p-4 sm:p-6 transition-all relative flex flex-col justify-between ${getThemeBackgroundClass()}`}
      style={
        sheet.customBackgroundImageUrl
          ? { backgroundImage: `url(${sheet.customBackgroundImageUrl})`, backgroundSize: 'cover' }
          : undefined
      }
    >
      {/* Top Session Progress Bar & Rewards Header */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-4 sm:p-5 border-4 border-yellow-300 shadow-lg flex flex-wrap items-center justify-between gap-4">
          {/* Sheet Title & Question Progress Indicator */}
          <div>
            <h2 className="text-base sm:text-lg font-black text-sky-950 line-clamp-1">
              {sheet.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {sheetQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-8 bg-sky-500 ring-2 ring-sky-300'
                      : i < currentIndex
                      ? 'w-4 bg-green-400'
                      : 'w-3.5 bg-slate-200'
                  }`}
                />
              ))}
              <span className="text-xs font-black text-sky-700 ml-2">
                Q {currentIndex + 1} of {sheetQuestions.length}
              </span>
            </div>
          </div>

          {/* Center/Right: Live Rewards Counter (Stars / Points) */}
          <div className="flex items-center gap-3">
            {/* Stars Bar (Showing total empty stars & filling with gold stars!) */}
            {totalStarsInSheet > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 px-3.5 py-1.5 rounded-full border-2 border-yellow-300 shadow-xs">
                <span className="text-xs font-black text-yellow-800 uppercase mr-1">Stars:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalStarsInSheet, 8) }).map((_, idx) => {
                    const isFilled = idx < starsEarned;
                    return (
                      <Star
                        key={idx}
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                          isFilled
                            ? 'text-yellow-500 fill-yellow-400 scale-110 drop-shadow'
                            : 'text-slate-300 fill-slate-100 opacity-60'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm font-black text-yellow-700 ml-1">
                  {starsEarned}
                </span>
              </div>
            )}

            {/* Points Counter */}
            <div className="flex items-center gap-1.5 bg-sky-50 px-3.5 py-1.5 rounded-full border-2 border-sky-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-black text-sky-900">
                {pointsEarned} Pts
              </span>
            </div>

            {/* Optional Timer */}
            {timeLeft !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-mono font-black text-xs shadow-xs ${
                  timeLeft < 30
                    ? 'bg-rose-50 border-rose-400 text-rose-700 animate-pulse'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Active Question Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center my-auto">
        {currentQuestion ? (
          <>
            {currentQuestion.type === 'cvc_blending' && (
              <CVCBlendingQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswerQuestion}
                onSkip={currentQuestion.isSkippable ? handleSkipQuestion : undefined}
              />
            )}

            {currentQuestion.type === 'multiple_choice' && (
              <MultipleChoiceQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswerQuestion}
                onSkip={currentQuestion.isSkippable ? handleSkipQuestion : undefined}
              />
            )}

            {currentQuestion.type === 'fill_in_blank' && (
              <FillInTheBlankQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswerQuestion}
                onSkip={currentQuestion.isSkippable ? handleSkipQuestion : undefined}
              />
            )}

            {currentQuestion.type === 'matching' && (
              <MatchingQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswerQuestion}
                onSkip={currentQuestion.isSkippable ? handleSkipQuestion : undefined}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl p-8 border border-zinc-200">
            <p className="text-lg font-bold text-zinc-700">No questions in this sheet!</p>
            <button
              onClick={exitPlayingSheet}
              className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Back to Adventure Map
            </button>
          </div>
        )}
      </main>

      {/* Completion Modal */}
      {isCompleted && finishedAttempt && (
        <SheetCompletionModal
          sheet={sheet}
          attempt={finishedAttempt}
          onRetry={handleRestart}
          onExit={exitPlayingSheet}
        />
      )}
    </div>
  );
};
