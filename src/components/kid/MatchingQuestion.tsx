import React, { useEffect, useState } from 'react';
import { Volume2, Star, Check, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { MatchingPair, Question } from '../../types';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface MatchingQuestionProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answerData: Record<string, string>) => void;
  onSkip?: () => void;
}

const WORD_BUTTON_COLORS = [
  { bg: 'bg-yellow-400 hover:bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-950' },
  { bg: 'bg-green-400 hover:bg-green-500', border: 'border-green-600', text: 'text-green-950' },
  { bg: 'bg-blue-400 hover:bg-blue-500', border: 'border-blue-600', text: 'text-blue-950' },
  { bg: 'bg-purple-400 hover:bg-purple-500', border: 'border-purple-600', text: 'text-purple-950' },
  { bg: 'bg-pink-400 hover:bg-pink-500', border: 'border-pink-600', text: 'text-pink-950' },
];

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  onAnswer,
  onSkip,
}) => {
  const originalPairs = question.matchingPairs || [];

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [availableWords, setAvailableWords] = useState<Array<{ id: string; text: string }>>([]);
  const [draggedWord, setDraggedWord] = useState<{ id: string; text: string } | null>(null);
  const [selectedWordForTap, setSelectedWordForTap] = useState<{ id: string; text: string } | null>(null);

  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    resetQuestion();
  }, [question]);

  const resetQuestion = () => {
    setIsAnswered(false);
    setIsCorrect(null);
    setMatches({});
    setSelectedWordForTap(null);

    const words = originalPairs.map((p) => ({ id: p.id, text: p.rightMatch }));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);

    handlePlayAudio();
  };

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    if (question.questionVoiceUrl) {
      await soundEngine.playAudioUrl(
        question.questionVoiceUrl,
        question.questionText || question.targetPrompt || 'Match each letter to the correct word!'
      );
    } else {
      await soundEngine.speakWord(question.questionText || question.targetPrompt || 'Match each letter to the correct word!');
    }
    setIsPlayingAudio(false);
  };

  const playItemSound = (text: string) => {
    soundEngine.playTilePop();
    soundEngine.speakWord(text.replace(/[^\w\s]/gi, '').trim());
  };

  const handleDropOnPrompt = (pairId: string) => {
    const wordToPlace = draggedWord || selectedWordForTap;
    if (!wordToPlace || isAnswered) return;

    playItemSound(wordToPlace.text);

    const prevMatch = matches[pairId];
    const newMatches = { ...matches, [pairId]: wordToPlace.text };
    setMatches(newMatches);

    let newWords = availableWords.filter((w) => w.text !== wordToPlace.text);
    if (prevMatch) {
      newWords = [...newWords, { id: 'ret-' + Date.now(), text: prevMatch }];
    }
    setAvailableWords(newWords);
    setDraggedWord(null);
    setSelectedWordForTap(null);

    if (Object.keys(newMatches).length === originalPairs.length) {
      evaluateMatches(newMatches);
    }
  };

  const handleRemoveMatch = (pairId: string) => {
    if (isAnswered) return;
    const wordText = matches[pairId];
    if (wordText) {
      soundEngine.playTilePop();
      const newMatches = { ...matches };
      delete newMatches[pairId];
      setMatches(newMatches);
      setAvailableWords((prev) => [...prev, { id: 'ret-' + Date.now(), text: wordText }]);
    }
  };

  const evaluateMatches = (currentMatches: Record<string, string>) => {
    setIsAnswered(true);
    let allCorrect = true;

    for (const pair of originalPairs) {
      if (currentMatches[pair.id] !== pair.rightMatch) {
        allCorrect = false;
        break;
      }
    }

    setIsCorrect(allCorrect);

    if (allCorrect) {
      soundEngine.playCorrectBell();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#FACC15', '#4ADE80', '#F472B6', '#A855F7'],
      });
      soundEngine.speakWord('Fantastic matching!');
    } else {
      soundEngine.playIncorrectBuzzer();
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full p-4 sm:p-8">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm border-2 border-orange-200">
          Phonics Matching Quest
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 px-4 py-1.5 rounded-full shadow-xs font-black text-yellow-700 text-xs sm:text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
          <span>+{question.rewardValue} {question.rewardType}</span>
        </div>
      </div>

      {/* Main Sound Bubble & Prompt */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-4xl font-black text-sky-900 mb-4 tracking-tight">
          {question.questionText || 'Match Letters with Words!'}
        </h2>

        <button
          type="button"
          id="match-sound-btn"
          onClick={handlePlayAudio}
          className={`bg-white p-5 sm:p-6 rounded-full shadow-2xl border-4 transition-transform ${
            isPlayingAudio
              ? 'border-yellow-400 scale-110 animate-bounce'
              : 'border-sky-300 hover:scale-105 active:scale-95'
          }`}
          title="Hear audio prompt"
        >
          <span className="text-5xl sm:text-6xl select-none">🔊</span>
        </button>
      </div>

      {/* Matching Columns Grid */}
      <div className="bg-white/85 backdrop-blur-sm p-6 sm:p-8 rounded-[2.5rem] border-4 border-white shadow-xl w-full max-w-2xl my-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Target Drop Slots */}
        <div className="space-y-3">
          <p className="text-xs font-black text-sky-600 uppercase tracking-wider mb-2 text-center md:text-left">
            Letters & Target Slots:
          </p>
          {originalPairs.map((pair) => {
            const matchedWord = matches[pair.id];
            const isPairCorrect = isAnswered && matchedWord === pair.rightMatch;
            const isPairWrong = isAnswered && matchedWord && matchedWord !== pair.rightMatch;

            return (
              <div
                key={pair.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnPrompt(pair.id)}
                onClick={() => {
                  if (selectedWordForTap) handleDropOnPrompt(pair.id);
                  else if (matchedWord) handleRemoveMatch(pair.id);
                }}
                className={`p-3.5 rounded-2xl border-4 flex items-center justify-between gap-3 transition-all cursor-pointer select-none shadow-md ${
                  isPairCorrect
                    ? 'bg-green-100 border-green-500 text-green-950 scale-102'
                    : isPairWrong
                    ? 'bg-red-100 border-red-400 text-red-950'
                    : matchedWord
                    ? 'bg-sky-50 border-sky-300'
                    : 'bg-white/70 border-dashed border-sky-400 hover:border-yellow-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-sky-200 flex items-center justify-center font-black text-xl text-sky-900 shadow-sm">
                  {pair.leftPrompt}
                </div>

                <span className="text-sm font-black text-sky-400">➔</span>

                <div className="flex-1 text-right">
                  {matchedWord ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 border-b-2 border-yellow-600 text-yellow-950 rounded-xl font-black text-sm shadow-xs">
                      {matchedWord}
                      {!isAnswered && <span className="text-[10px] text-yellow-800">✕</span>}
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1.5 border-2 border-dashed border-sky-300 bg-sky-50/50 text-sky-600 text-xs font-black rounded-xl animate-pulse">
                      Drop Word Here
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Available Words Bank */}
        <div className="space-y-3">
          <p className="text-xs font-black text-sky-600 uppercase tracking-wider mb-2 text-center md:text-left">
            Words Bank: (Drag or Tap)
          </p>
          <div className="flex flex-col gap-3">
            {availableWords.map((word, idx) => {
              const isTapSelected = selectedWordForTap?.text === word.text;
              const colorScheme = WORD_BUTTON_COLORS[idx % WORD_BUTTON_COLORS.length];

              return (
                <button
                  key={word.id}
                  draggable={!isAnswered}
                  onDragStart={() => setDraggedWord(word)}
                  onClick={() => {
                    if (isAnswered) return;
                    soundEngine.playTilePop();
                    setSelectedWordForTap(isTapSelected ? null : word);
                  }}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-2xl font-black text-base flex items-center justify-between transition-all shadow-md cursor-grab active:translate-y-0.5 border-b-4 ${
                    isTapSelected
                      ? 'bg-yellow-300 border-yellow-600 text-yellow-950 ring-4 ring-yellow-200 scale-102'
                      : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`
                  }`}
                >
                  <span className="text-base sm:text-lg">{word.text}</span>
                  <span className="text-[10px] font-black uppercase bg-white/40 px-2 py-0.5 rounded-md">
                    {isTapSelected ? 'Selected!' : 'Tap / Drag'}
                  </span>
                </button>
              );
            })}
            {availableWords.length === 0 && !isAnswered && (
              <p className="text-xs font-bold text-center text-sky-500 py-4">
                All words placed! Evaluating...
              </p>
            )}
          </div>
        </div>
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
              {isCorrect ? '🏆' : '🧩'}
            </div>
            <div>
              <h4 className="font-black text-lg">
                {isCorrect ? 'All Matched Perfectly!' : 'Almost Got It!'}
              </h4>
              <p className="text-xs sm:text-sm font-bold opacity-80">
                {isCorrect
                  ? `Brilliant work! You earned +${question.rewardValue} ${question.rewardType}!`
                  : `Check the pairings and try again!`}
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
              id="match-next-btn"
              onClick={() => onAnswer(!!isCorrect, matches)}
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
