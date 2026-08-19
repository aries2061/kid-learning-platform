import React, { useEffect, useState } from 'react';
import { Volume2, Star, Check, RotateCcw, ArrowRight } from 'lucide-react';
import { Question } from '../../types';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface FillInTheBlankQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answerData: string) => void;
  onSkip?: () => void;
}

const TILE_COLORS = [
  { bg: 'bg-red-400', border: 'border-red-600' },
  { bg: 'bg-green-400', border: 'border-green-600' },
  { bg: 'bg-blue-400', border: 'border-blue-600' },
  { bg: 'bg-yellow-400', border: 'border-yellow-600' },
  { bg: 'bg-purple-400', border: 'border-purple-600' },
];

export const FillInTheBlankQuestion: React.FC<FillInTheBlankQuestionProps> = ({
  question,
  onAnswer,
  onSkip,
}) => {
  const fullWord = (question.fullWord || 'SUN').toUpperCase();
  const correctAnswer = (question.missingLetterAnswer || 'U').toUpperCase();
  const missingIndex = question.missingLetterIndex ?? 1;

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [placedLetter, setPlacedLetter] = useState<string | null>(null);
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    resetQuestion();
  }, [question]);

  const resetQuestion = () => {
    setIsAnswered(false);
    setIsCorrect(null);
    setPlacedLetter(null);

    let bank = question.blankLetterOptions && question.blankLetterOptions.length > 0
      ? [...question.blankLetterOptions]
      : ['A', 'E', 'I', 'O', 'U'];

    if (!bank.includes(correctAnswer)) bank.push(correctAnswer);

    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);

    handlePlayAudio();
  };

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    if (question.questionVoiceUrl) {
      await soundEngine.playAudioUrl(question.questionVoiceUrl);
    } else {
      await soundEngine.speakWord(question.questionText || fullWord);
    }
    setIsPlayingAudio(false);
  };

  const playPhonics = (letter: string) => {
    soundEngine.playTilePop();
    soundEngine.speakWord(letter.toLowerCase(), 0.9);
  };

  const handlePlaceLetter = (letter: string) => {
    if (isAnswered) return;
    playPhonics(letter);
    setPlacedLetter(letter);
    evaluateAnswer(letter);
  };

  const evaluateAnswer = (letter: string) => {
    setIsAnswered(true);
    const correct = letter.toUpperCase() === correctAnswer.toUpperCase();
    setIsCorrect(correct);

    if (correct) {
      soundEngine.playCorrectBell();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#FACC15', '#4ADE80', '#F472B6', '#A855F7'],
      });
      soundEngine.speakWord(`Awesome! ${fullWord}!`);
    } else {
      soundEngine.playIncorrectBuzzer();
    }
  };

  // Drag & drop
  const handleDragStart = (letter: string) => {
    setDraggedLetter(letter);
  };

  const handleDropOnBlank = () => {
    if (!draggedLetter || isAnswered) return;
    handlePlaceLetter(draggedLetter);
    setDraggedLetter(null);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full p-4 sm:p-8">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border-2 border-orange-200">
          Missing Letter Drag & Drop
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 px-4 py-1.5 rounded-full shadow-xs font-black text-yellow-700 text-xs sm:text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
          <span>+{question.rewardValue} {question.rewardType}</span>
        </div>
      </div>

      {/* Main Sound Bubble & Prompt */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-4xl font-black text-sky-900 mb-4 tracking-tight">
          {question.questionText || 'Fill in the Missing Letter!'}
        </h2>

        <button
          type="button"
          id="fib-sound-btn"
          onClick={handlePlayAudio}
          className={`bg-white p-5 sm:p-6 rounded-full shadow-2xl border-4 transition-transform ${
            isPlayingAudio
              ? 'border-yellow-400 scale-110 animate-bounce'
              : 'border-sky-300 hover:scale-105 active:scale-95'
          }`}
          title="Hear the word sound"
        >
          <span className="text-5xl sm:text-6xl select-none">🔊</span>
        </button>
      </div>

      {/* Optional Picture */}
      {question.questionImageUrl && (
        <div className="w-32 h-32 my-2 rounded-3xl overflow-hidden bg-white p-2 border-4 border-sky-200 shadow-md">
          <img src={question.questionImageUrl} alt="Word Visual" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Target Word with Blank Slot */}
      <div className="flex justify-center items-center gap-4 sm:gap-6 my-6 sm:my-8">
        {fullWord.split('').map((char, index) => {
          const isMissing = index === missingIndex;
          if (!isMissing) {
            return (
              <div
                key={index}
                className="w-20 h-26 sm:w-28 sm:h-32 bg-white border-4 border-sky-300 rounded-3xl shadow-lg flex items-center justify-center text-4xl sm:text-6xl font-black text-sky-800 select-none"
              >
                {char}
              </div>
            );
          }

          // Target Blank Slot
          return (
            <div
              key={index}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnBlank}
              className={`w-20 h-26 sm:w-28 sm:h-32 rounded-3xl flex items-center justify-center text-4xl sm:text-6xl font-black transition-all select-none ${
                placedLetter
                  ? isCorrect
                    ? 'bg-green-100 border-4 border-green-500 text-green-700 shadow-lg scale-105'
                    : 'bg-red-100 border-4 border-red-400 text-red-700 shadow-md'
                  : 'bg-white/50 border-4 border-dashed border-sky-400 text-sky-400 shadow-inner animate-pulse'
              }`}
            >
              {placedLetter || '?'}
            </div>
          );
        })}
      </div>

      {/* Available Letters Tray */}
      <div className="bg-white/85 backdrop-blur-sm p-6 sm:p-8 rounded-[2.5rem] border-4 border-white shadow-xl w-full max-w-2xl my-2">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {shuffledOptions.map((letter, idx) => {
            const colorScheme = TILE_COLORS[idx % TILE_COLORS.length];
            return (
              <button
                key={`${letter}-${idx}`}
                draggable={!isAnswered}
                onDragStart={() => handleDragStart(letter)}
                onClick={() => handlePlaceLetter(letter)}
                disabled={isAnswered}
                className={`w-18 h-18 sm:w-24 sm:h-24 ${colorScheme.bg} rounded-3xl flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-lg cursor-grab border-b-8 ${colorScheme.border} active:translate-y-1 active:border-b-4 hover:scale-105 transition-all select-none disabled:opacity-50`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <p className="text-center mt-6 font-black text-sky-600 uppercase tracking-widest text-xs sm:text-sm">
          Drag the missing letter to the box!
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
              {isCorrect ? '⭐' : '🔍'}
            </div>
            <div>
              <h4 className="font-black text-lg">
                {isCorrect ? 'Super Speller!' : 'Nice try!'}
              </h4>
              <p className="text-xs sm:text-sm font-bold opacity-80">
                {isCorrect
                  ? `"${correctAnswer}" completed "${fullWord}"! +${question.rewardValue} ${question.rewardType} awarded.`
                  : `Missing letter was "${correctAnswer}" for "${fullWord}".`}
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
              id="fib-next-btn"
              onClick={() => onAnswer(!!isCorrect, placedLetter || '')}
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
