import React, { useEffect, useState } from 'react';
import { Volume2, Star, Check, RotateCcw, ArrowRight } from 'lucide-react';
import { Question } from '../../types';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answerData: string) => void;
  onSkip?: () => void;
}

const OPTION_COLORS = [
  { bg: 'bg-white hover:bg-sky-50', border: 'border-sky-300 hover:border-sky-500', text: 'text-sky-950', badge: 'bg-sky-500 text-white' },
  { bg: 'bg-white hover:bg-yellow-50', border: 'border-yellow-300 hover:border-yellow-500', text: 'text-yellow-950', badge: 'bg-yellow-500 text-white' },
  { bg: 'bg-white hover:bg-green-50', border: 'border-green-300 hover:border-green-500', text: 'text-green-950', badge: 'bg-green-500 text-white' },
  { bg: 'bg-white hover:bg-purple-50', border: 'border-purple-300 hover:border-purple-500', text: 'text-purple-950', badge: 'bg-purple-500 text-white' },
];

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  onSkip,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const options = question.mcOptions || [];

  useEffect(() => {
    resetQuestion();
  }, [question]);

  const resetQuestion = () => {
    setIsAnswered(false);
    setIsCorrect(null);
    setSelectedOptionId(null);
    handlePlayAudio();
  };

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    if (question.questionVoiceUrl) {
      await soundEngine.playAudioUrl(question.questionVoiceUrl);
    } else {
      await soundEngine.speakWord(question.questionText || question.targetPrompt || 'Choose the correct answer!');
    }
    setIsPlayingAudio(false);
  };

  const handleSelectOption = (opt: { id: string; text: string; isCorrect: boolean }) => {
    if (isAnswered) return;
    soundEngine.playTilePop();
    soundEngine.speakWord(opt.text);
    setSelectedOptionId(opt.id);

    setIsAnswered(true);
    setIsCorrect(opt.isCorrect);

    if (opt.isCorrect) {
      soundEngine.playCorrectBell();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#FACC15', '#4ADE80', '#F472B6', '#A855F7'],
      });
      soundEngine.speakWord(`Awesome choice!`);
    } else {
      soundEngine.playIncorrectBuzzer();
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full p-4 sm:p-8">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border-2 border-orange-200">
          Multiple Choice Phonics
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 px-4 py-1.5 rounded-full shadow-xs font-black text-yellow-700 text-xs sm:text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
          <span>+{question.rewardValue} {question.rewardType}</span>
        </div>
      </div>

      {/* Main Sound Bubble & Prompt */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-4xl font-black text-sky-900 mb-4 tracking-tight">
          {question.questionText || 'Choose the Right Answer!'}
        </h2>

        <button
          type="button"
          id="mc-sound-btn"
          onClick={handlePlayAudio}
          className={`bg-white p-5 sm:p-6 rounded-full shadow-2xl border-4 transition-transform ${
            isPlayingAudio
              ? 'border-yellow-400 scale-110 animate-bounce'
              : 'border-sky-300 hover:scale-105 active:scale-95'
          }`}
          title="Hear question prompt"
        >
          <span className="text-5xl sm:text-6xl select-none">🔊</span>
        </button>
      </div>

      {/* Optional Picture or Target Letter Badge */}
      {question.questionImageUrl ? (
        <div className="w-36 h-36 my-2 rounded-3xl overflow-hidden bg-white p-2 border-4 border-sky-200 shadow-md">
          <img src={question.questionImageUrl} alt="Question Visual" className="w-full h-full object-contain" />
        </div>
      ) : question.targetPrompt ? (
        <div className="my-3 px-8 py-4 bg-white border-4 border-sky-300 rounded-3xl shadow-lg">
          <span className="text-4xl sm:text-5xl font-black text-sky-700 tracking-wider">
            {question.targetPrompt}
          </span>
        </div>
      ) : null}

      {/* Options Grid */}
      <div className="bg-white/85 backdrop-blur-sm p-6 sm:p-8 rounded-[2.5rem] border-4 border-white shadow-xl w-full max-w-2xl my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const showCorrect = isAnswered && opt.isCorrect;
            const showWrong = isAnswered && isSelected && !opt.isCorrect;
            const theme = OPTION_COLORS[idx % OPTION_COLORS.length];

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`p-4 sm:p-5 rounded-3xl border-4 text-left flex items-center gap-4 transition-all shadow-md active:translate-y-0.5 ${
                  showCorrect
                    ? 'bg-green-100 border-green-500 text-green-950 scale-102 ring-4 ring-green-200'
                    : showWrong
                    ? 'bg-red-100 border-red-400 text-red-950 ring-4 ring-red-200'
                    : isSelected
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                    : `${theme.bg} ${theme.border} ${theme.text}`
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                    showCorrect
                      ? 'bg-green-500 text-white'
                      : showWrong
                      ? 'bg-red-500 text-white'
                      : theme.badge
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                {opt.imageUrl && (
                  <div className="w-12 h-12 rounded-xl bg-white p-1 border border-zinc-200 overflow-hidden shrink-0">
                    <img src={opt.imageUrl} alt={opt.text} className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-black">{opt.text}</p>
                </div>

                {showCorrect && <span className="text-2xl text-green-600">✓</span>}
                {showWrong && <span className="text-2xl text-red-600">✕</span>}
              </button>
            );
          })}
        </div>

        <p className="text-center mt-6 font-black text-sky-600 uppercase tracking-widest text-xs sm:text-sm">
          Tap the correct option above!
        </p>
      </div>

      {/* Feedback Banner */}
      {isAnswered && (
        <div
          className={`w-full max-w-2xl my-4 p-5 rounded-3xl border-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl ${
            isCorrect
              ? 'bg-green-50 border-green-400 text-green-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl text-white font-black text-2xl flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
              {isCorrect ? '🌟' : '🤔'}
            </div>
            <div>
              <h4 className="font-black text-lg">
                {isCorrect ? 'Bingo! You Got It!' : 'Good Attempt!'}
              </h4>
              <p className="text-xs sm:text-sm font-bold opacity-80">
                {isCorrect
                  ? `Correct answer! +${question.rewardValue} ${question.rewardType} added to your score.`
                  : `Check the highlight and remember it for next time!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCorrect && (
              <button
                type="button"
                onClick={resetQuestion}
                className="px-4 py-3 bg-white text-slate-800 font-black text-xs rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            )}
            <button
              type="button"
              id="mc-next-btn"
              onClick={() => onAnswer(!!isCorrect, selectedOptionId || '')}
              className="bg-sky-500 hover:bg-sky-600 active:translate-y-0.5 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg border-b-4 border-sky-700 transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Skippable Button */}
      {!isAnswered && question.isSkippable && onSkip && (
        <div className="w-full flex justify-end mt-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-bold text-sky-600/70 hover:text-sky-800 underline transition-colors"
          >
            Skip this question →
          </button>
        </div>
      )}
    </div>
  );
};
