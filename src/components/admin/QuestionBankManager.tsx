import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Volume2,
  Mic,
  Image as ImageIcon,
  Star,
  Sparkles,
  Check,
  Search,
  Copy,
  Eye,
  EyeOff,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MatchingPair, Question, QuestionType, RewardType } from '../../types';
import { MediaPickerModal } from '../common/MediaPickerModal';
import { AudioRecordModal } from '../common/AudioRecordModal';
import { soundEngine } from '../../utils/audio';

export const QuestionBankManager: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [type, setType] = useState<QuestionType>('cvc_blending');
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('Short A');
  const [rewardType, setRewardType] = useState<RewardType>('stars');
  const [rewardValue, setRewardValue] = useState(1);
  const [isSkippable, setIsSkippable] = useState(false);
  const [showVoiceRecordButton, setShowVoiceRecordButton] = useState(true);

  // Media URLs
  const [questionVoiceUrl, setQuestionVoiceUrl] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [cvcAudioUrl, setCvcAudioUrl] = useState('');

  // CVC fields
  const [targetWord, setTargetWord] = useState('CAT');
  const [wordLength, setWordLength] = useState(3);
  const [letterOptionsStr, setLetterOptionsStr] = useState('C, A, T, B, O');

  // Multiple Choice fields
  const [targetPrompt, setTargetPrompt] = useState('Letter B');
  const [mcOptions, setMcOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([
    { id: '1', text: '⚽ Ball', isCorrect: true },
    { id: '2', text: '🐱 Cat', isCorrect: false },
    { id: '3', text: '☀️ Sun', isCorrect: false },
    { id: '4', text: '🐟 Fish', isCorrect: false },
  ]);

  // Fill in the blank fields
  const [fullWord, setFullWord] = useState('SUN');
  const [missingLetterIndex, setMissingLetterIndex] = useState(1);
  const [missingLetterAnswer, setMissingLetterAnswer] = useState('U');
  const [blankOptionsStr, setBlankOptionsStr] = useState('U, A, E, O, I');

  // Matching fields
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([
    { id: '1', leftPrompt: '🔤 A', rightMatch: '🍎 Apple' },
    { id: '2', leftPrompt: '🔤 B', rightMatch: '🐻 Bear' },
    { id: '3', leftPrompt: '🔤 C', rightMatch: '🐱 Cat' },
  ]);

  // Media Pickers
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'audio' | null>(null);
  const [mediaTargetField, setMediaTargetField] = useState<'questionVoice' | 'cvcAudio' | 'questionImage' | null>(null);
  const [showAudioRecordModal, setShowAudioRecordModal] = useState(false);
  const [audioRecordField, setAudioRecordField] = useState<'questionVoice' | 'cvcAudio'>('questionVoice');

  const filteredQuestions = questions.filter((q) => {
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setType('cvc_blending');
    setTitle('Blend CVC Word: CAT');
    setQuestionText('Listen to the sound and blend the letters to make the word!');
    setCategory('Short A');
    setRewardType('stars');
    setRewardValue(1);
    setIsSkippable(false);
    setShowVoiceRecordButton(true);
    setQuestionVoiceUrl('');
    setQuestionImageUrl('');
    setCvcAudioUrl('');
    setTargetWord('CAT');
    setWordLength(3);
    setLetterOptionsStr('C, A, T, B, O');
    setShowFormModal(true);
    soundEngine.playTilePop();
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setType(q.type);
    setTitle(q.title);
    setQuestionText(q.questionText);
    setCategory(q.category || 'General');
    setRewardType(q.rewardType);
    setRewardValue(q.rewardValue);
    setIsSkippable(q.isSkippable);
    setShowVoiceRecordButton(q.showVoiceRecordButton ?? true);
    setQuestionVoiceUrl(q.questionVoiceUrl || '');
    setQuestionImageUrl(q.questionImageUrl || '');
    setCvcAudioUrl(q.cvcAudioUrl || '');

    // CVC
    setTargetWord(q.targetWord || 'CAT');
    setWordLength(q.wordLength || 3);
    setLetterOptionsStr(q.letterOptions ? q.letterOptions.join(', ') : 'C, A, T');

    // MC
    if (q.mcOptions) setMcOptions(q.mcOptions);
    setTargetPrompt(q.targetPrompt || 'Letter B');

    // FIB
    setFullWord(q.fullWord || 'SUN');
    setMissingLetterIndex(q.missingLetterIndex ?? 1);
    setMissingLetterAnswer(q.missingLetterAnswer || 'U');
    setBlankOptionsStr(q.blankLetterOptions ? q.blankLetterOptions.join(', ') : 'U, A, E, O, I');

    // Matching
    if (q.matchingPairs) setMatchingPairs(q.matchingPairs);

    setShowFormModal(true);
    soundEngine.playTilePop();
  };

  const handleDuplicate = async (q: Question) => {
    await addQuestion({
      ...q,
      title: `${q.title} (Copy)`,
    });
    soundEngine.playTilePop();
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLetterOptions = letterOptionsStr
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const parsedBlankOptions = blankOptionsStr
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const qData: Omit<Question, 'id' | 'createdAt'> = {
      type,
      title: title.trim() || `${type.replace('_', ' ').toUpperCase()} Question`,
      questionText: questionText.trim(),
      category: category.trim(),
      rewardType,
      rewardValue: Number(rewardValue) || 1,
      isSkippable,
      showVoiceRecordButton,
      questionVoiceUrl: questionVoiceUrl || undefined,
      questionImageUrl: questionImageUrl || undefined,

      // CVC
      targetWord: type === 'cvc_blending' ? targetWord.trim().toUpperCase() : undefined,
      wordLength: type === 'cvc_blending' ? Number(wordLength) : undefined,
      cvcAudioUrl: type === 'cvc_blending' ? cvcAudioUrl || undefined : undefined,
      letterOptions: type === 'cvc_blending' ? parsedLetterOptions : undefined,

      // MC
      targetPrompt: type === 'multiple_choice' ? targetPrompt.trim() : undefined,
      mcOptions: type === 'multiple_choice' ? mcOptions : undefined,

      // Fill in blank
      fullWord: type === 'fill_in_blank' ? fullWord.trim().toUpperCase() : undefined,
      maskedWord:
        type === 'fill_in_blank'
          ? fullWord
              .split('')
              .map((c, i) => (i === missingLetterIndex ? '_' : c))
              .join(' ')
          : undefined,
      missingLetterIndex: type === 'fill_in_blank' ? missingLetterIndex : undefined,
      missingLetterAnswer: type === 'fill_in_blank' ? missingLetterAnswer.trim().toUpperCase() : undefined,
      blankLetterOptions: type === 'fill_in_blank' ? parsedBlankOptions : undefined,

      // Matching
      matchingPairs: type === 'matching' ? matchingPairs : undefined,
    };

    if (editingQuestion) {
      await updateQuestion({ ...editingQuestion, ...qData });
    } else {
      await addQuestion(qData);
    }

    soundEngine.playCorrectBell();
    setShowFormModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Question Bank & Sets</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Create CVC blending, multiple choice, missing letters, and matching questions.
          </p>
        </div>

        <button
          type="button"
          id="create-question-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'All Types' },
              { id: 'cvc_blending', label: 'CVC Blending' },
              { id: 'multiple_choice', label: 'Multiple Choice' },
              { id: 'fill_in_blank', label: 'Fill in Blank' },
              { id: 'matching', label: 'Matching' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === t.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border-2 border-zinc-200/80 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black capitalize">
                    {q.type.replace(/_/g, ' ')}
                  </span>
                  {q.category && (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium">
                      {q.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>+{q.rewardValue} {q.rewardType}</span>
                </div>
              </div>

              <h3 className="font-extrabold text-zinc-900 text-base mb-1">{q.title}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2">{q.questionText}</p>

              {/* Specific info badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-zinc-500 font-medium">
                {q.type === 'cvc_blending' && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold">
                    Target: {q.targetWord} ({q.wordLength} letters)
                  </span>
                )}
                {q.type === 'fill_in_blank' && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold">
                    Pattern: {q.maskedWord} (Missing: {q.missingLetterAnswer})
                  </span>
                )}
                {q.type === 'multiple_choice' && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded-md font-bold">
                    Prompt: {q.targetPrompt} ({q.mcOptions?.length || 4} options)
                  </span>
                )}
                {q.type === 'matching' && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold">
                    {q.matchingPairs?.length || 3} Matching Pairs
                  </span>
                )}

                {q.questionVoiceUrl && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Voice Attached
                  </span>
                )}
                {q.questionImageUrl && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Image Attached
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-md font-bold ${q.isSkippable ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {q.isSkippable ? 'Skippable' : 'Required'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-100">
              {q.questionVoiceUrl && (
                <button
                  type="button"
                  onClick={() => soundEngine.playAudioUrl(q.questionVoiceUrl || '')}
                  className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Play Voice Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDuplicate(q)}
                className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Duplicate Question"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => openEditModal(q)}
                className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Edit Question"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${q.title}"?`)) deleteQuestion(q.id);
                }}
                className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Question Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-zinc-900 pb-3 border-b border-zinc-100">
              {editingQuestion ? 'Edit Question' : 'Create Question'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4 my-4">
              {/* Question Type Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Question Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'cvc_blending', label: 'CVC Blending' },
                      { id: 'multiple_choice', label: 'Multiple Choice' },
                      { id: 'fill_in_blank', label: 'Fill in Blank' },
                      { id: 'matching', label: 'Matching' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        type === t.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Blend the word: CAT"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Category / Phonics Unit
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Short A, Vowel Blends"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Question Prompt Text (Shown to Child)
                </label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Listen to the sound and blend the letters to make the word!"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Voice & Media Attachment Section */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Question Voice & Audio
                  </label>
                  {/* Visibility Toggle for Push-to-record as requested in prompt */}
                  <button
                    type="button"
                    onClick={() => setShowVoiceRecordButton(!showVoiceRecordButton)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
                  >
                    {showVoiceRecordButton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showVoiceRecordButton ? 'Record Button: Visible' : 'Record Button: Hidden'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {showVoiceRecordButton && (
                    <button
                      type="button"
                      onClick={() => {
                        setAudioRecordField('questionVoice');
                        setShowAudioRecordModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Push-to-Record Voice
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMediaTargetField('questionVoice');
                      setMediaPickerType('audio');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-bold rounded-xl"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Select from Materials Library
                  </button>

                  {questionVoiceUrl && (
                    <button
                      type="button"
                      onClick={() => soundEngine.playAudioUrl(questionVoiceUrl)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Play Voice
                    </button>
                  )}
                </div>

                {/* Optional Image */}
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField('questionImage');
                        setMediaPickerType('image');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-bold rounded-xl"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {questionImageUrl ? 'Change Question Image' : 'Attach Question Image'}
                    </button>
                    {questionImageUrl && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>
                  {questionImageUrl && (
                    <button
                      type="button"
                      onClick={() => setQuestionImageUrl('')}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Type-Specific Form Inputs */}
              {/* 1. CVC Blending */}
              {type === 'cvc_blending' && (
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    CVC Word Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Target Word</label>
                      <input
                        type="text"
                        value={targetWord}
                        onChange={(e) => setTargetWord(e.target.value.toUpperCase())}
                        placeholder="e.g. CAT"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Word Length</label>
                      <select
                        value={wordLength}
                        onChange={(e) => setWordLength(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value={3}>3 Letters (CVC standard)</option>
                        <option value={4}>4 Letters (e.g. FROG)</option>
                        <option value={5}>5 Letters</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Letter Options Bank (Comma-separated, will be randomized)
                    </label>
                    <input
                      type="text"
                      value={letterOptionsStr}
                      onChange={(e) => setLetterOptionsStr(e.target.value.toUpperCase())}
                      placeholder="e.g. C, A, T, B, O"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 2. Multiple Choice */}
              {type === 'multiple_choice' && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider">
                    Multiple Choice Configuration
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Letter Prompt Badge</label>
                    <input
                      type="text"
                      value={targetPrompt}
                      onChange={(e) => setTargetPrompt(e.target.value)}
                      placeholder="e.g. Letter B"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Answer Choices (Pick the correct option)
                    </label>
                    <div className="space-y-2">
                      {mcOptions.map((opt, index) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_mc_opt"
                            checked={opt.isCorrect}
                            onChange={() => {
                              setMcOptions(
                                mcOptions.map((o) => ({ ...o, isCorrect: o.id === opt.id }))
                              );
                            }}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...mcOptions];
                              updated[index].text = e.target.value;
                              setMcOptions(updated);
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-zinc-400">
                            {opt.isCorrect ? 'Correct ✅' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Fill in the Blank */}
              {type === 'fill_in_blank' && (
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Fill-in-the-Blank Configuration
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Full Word</label>
                      <input
                        type="text"
                        value={fullWord}
                        onChange={(e) => setFullWord(e.target.value.toUpperCase())}
                        placeholder="e.g. SUN"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Missing Letter Index</label>
                      <input
                        type="number"
                        min={0}
                        max={fullWord.length - 1}
                        value={missingLetterIndex}
                        onChange={(e) => setMissingLetterIndex(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Correct Missing Letter</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={missingLetterAnswer}
                        onChange={(e) => setMissingLetterAnswer(e.target.value.toUpperCase())}
                        placeholder="e.g. U"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Letter Choices Bank (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={blankOptionsStr}
                      onChange={(e) => setBlankOptionsStr(e.target.value.toUpperCase())}
                      placeholder="e.g. U, A, E, O, I"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 4. Matching */}
              {type === 'matching' && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                    Matching Pairs (Left Letter/Icon ➔ Right Word/Picture)
                  </h4>
                  <div className="space-y-2.5">
                    {matchingPairs.map((pair, index) => (
                      <div key={pair.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pair.leftPrompt}
                          onChange={(e) => {
                            const updated = [...matchingPairs];
                            updated[index].leftPrompt = e.target.value;
                            setMatchingPairs(updated);
                          }}
                          placeholder="Left prompt (e.g. 🔤 A)"
                          className="w-1/3 px-3 py-1.5 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <span className="text-xs font-bold text-zinc-400">➔</span>
                        <input
                          type="text"
                          value={pair.rightMatch}
                          onChange={(e) => {
                            const updated = [...matchingPairs];
                            updated[index].rightMatch = e.target.value;
                            setMatchingPairs(updated);
                          }}
                          placeholder="Right match (e.g. 🍎 Apple)"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reward Points and Skippable Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Reward Unit
                  </label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as RewardType)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="stars">⭐ Stars (Fills Star Bar)</option>
                    <option value="points">✨ Points (Adds to Score)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Reward Amount
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={rewardValue}
                    onChange={(e) => setRewardValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Question Requirement
                  </label>
                  <select
                    value={isSkippable ? 'skippable' : 'required'}
                    onChange={(e) => setIsSkippable(e.target.value === 'skippable')}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="required">Required (Must Answer)</option>
                    <option value="skippable">Skippable (Show Skip Btn)</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-zinc-600 text-sm font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  {editingQuestion ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerType && (
        <MediaPickerModal
          isOpen={true}
          typeFilter={mediaPickerType}
          onClose={() => setMediaPickerType(null)}
          onSelectMedia={(item) => {
            if (mediaTargetField === 'questionVoice') setQuestionVoiceUrl(item.url);
            if (mediaTargetField === 'cvcAudio') setCvcAudioUrl(item.url);
            if (mediaTargetField === 'questionImage') setQuestionImageUrl(item.url);
            setMediaPickerType(null);
          }}
        />
      )}

      {/* Audio Record Modal */}
      <AudioRecordModal
        isOpen={showAudioRecordModal}
        onClose={() => setShowAudioRecordModal(false)}
        onSaveAudio={(res) => {
          if (audioRecordField === 'questionVoice') setQuestionVoiceUrl(res.url);
          else setCvcAudioUrl(res.url);
        }}
      />
    </div>
  );
};
