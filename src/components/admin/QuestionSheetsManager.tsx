import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Star,
  Award,
  Clock,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Settings2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BackgroundTheme, BackgroundMusic, QuestionSheet, RewardBadge } from '../../types';
import { PRESET_BADGES } from '../../data/seedData';
import { BadgeIcon } from '../common/BadgeIcon';
import { MediaPickerModal } from '../common/MediaPickerModal';
import { soundEngine } from '../../utils/audio';

export const QuestionSheetsManager: React.FC = () => {
  const { sheets, questions, badges, addSheet, updateSheet, deleteSheet, startPlayingSheet } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<QuestionSheet | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Phonics Level 1');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(0);
  const [rewardBonusPoints, setRewardBonusPoints] = useState(50);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic>('playful_melody');
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>('candy');
  const [customBackgroundImageUrl, setCustomBackgroundImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Selected Question IDs (ordered)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Selected Badge
  const [selectedBadge, setSelectedBadge] = useState<RewardBadge>(PRESET_BADGES[0]);

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const openCreateModal = () => {
    setEditingSheet(null);
    setTitle('Short Vowel Explorer');
    setDescription('Practice blending short vowel words and collect the explorer badge!');
    setCategory('Phonics Level 1');
    setPassingScore(70);
    setTimeLimitSeconds(0);
    setRewardBonusPoints(50);
    setBackgroundMusic('playful_melody');
    setBackgroundTheme('candy');
    setCustomBackgroundImageUrl('');
    setIsPublished(true);
    setSelectedQuestionIds(questions.slice(0, 4).map((q) => q.id));
    setSelectedBadge(badges[0] || PRESET_BADGES[0]);
    setShowModal(true);
    soundEngine.playTilePop();
  };

  const openEditModal = (sheet: QuestionSheet) => {
    setEditingSheet(sheet);
    setTitle(sheet.title);
    setDescription(sheet.description);
    setCategory(sheet.category);
    setPassingScore(sheet.passingScore);
    setTimeLimitSeconds(sheet.timeLimitSeconds || 0);
    setRewardBonusPoints(sheet.rewardBonusPoints || 50);
    setBackgroundMusic(sheet.backgroundMusic || 'playful_melody');
    setBackgroundTheme(sheet.backgroundTheme || 'candy');
    setCustomBackgroundImageUrl(sheet.customBackgroundImageUrl || '');
    setIsPublished(sheet.isPublished);
    setSelectedQuestionIds(sheet.questionIds);
    setSelectedBadge(sheet.rewardBadge);
    setShowModal(true);
    soundEngine.playTilePop();
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedQuestionIds.length) return;
    const updated = [...selectedQuestionIds];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setSelectedQuestionIds(updated);
  };

  const handleToggleQuestionInSheet = (qid: string) => {
    if (selectedQuestionIds.includes(qid)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qid));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qid]);
    }
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least 1 question for this sheet.');
      return;
    }

    const sheetData: Omit<QuestionSheet, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      questionIds: selectedQuestionIds,
      passingScore: Number(passingScore) || 70,
      timeLimitSeconds: Number(timeLimitSeconds) > 0 ? Number(timeLimitSeconds) : undefined,
      rewardBadge: selectedBadge,
      rewardBonusPoints: Number(rewardBonusPoints) || 0,
      backgroundMusic,
      bgmTrack: backgroundMusic,
      backgroundTheme,
      customBackgroundImageUrl: customBackgroundImageUrl || undefined,
      isPublished,
    };

    if (editingSheet) {
      await updateSheet({ ...editingSheet, ...sheetData });
    } else {
      await addSheet(sheetData);
    }

    soundEngine.playCorrectBell();
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">Question Sheets Curriculum</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Assemble questions into interactive sheets with passing scores, background music, and reward badges.
          </p>
        </div>

        <button
          type="button"
          id="create-sheet-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Question Sheet</span>
        </button>
      </div>

      {/* Sheets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className="bg-white rounded-3xl border-2 border-zinc-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg">
                  {sheet.category}
                </span>

                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                    sheet.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {sheet.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <h3 className="font-extrabold text-zinc-900 text-lg leading-snug">{sheet.title}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{sheet.description}</p>

              {/* Sheet Stats Pill */}
              <div className="my-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeIcon badge={sheet.rewardBadge} size="sm" showLabel={false} />
                  <div>
                    <p className="text-xs font-bold text-zinc-800 line-clamp-1">{sheet.rewardBadge.name}</p>
                    <p className="text-[10px] text-amber-600 font-bold">Pass: {sheet.passingScore}%</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-zinc-700 block">
                    {sheet.questionIds.length} Questions
                  </span>
                  <span className="text-[10px] text-zinc-400 capitalize">
                    {sheet.backgroundTheme} theme
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => startPlayingSheet(sheet)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                <span>Test Sheet</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(sheet)}
                  className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Edit Sheet"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete question sheet "${sheet.title}"?`)) deleteSheet(sheet.id);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Delete Sheet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Sheet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-zinc-900 pb-3 border-b border-zinc-100">
              {editingSheet ? 'Edit Question Sheet' : 'Create New Question Sheet'}
            </h3>

            <form onSubmit={handleSaveSheet} className="space-y-4 my-4">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Sheet Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master CVC Blending"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Category / Level
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Phonics Level 1"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Listen to phonics sounds and complete missing letters"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Rules & Score Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">Required to win badge</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Time Limit (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={3600}
                    value={timeLimitSeconds}
                    onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                    placeholder="0 = No limit"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">0 for unlimited time</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Completion Bonus Points
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={rewardBonusPoints}
                    onChange={(e) => setRewardBonusPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">Awarded if passed</span>
                </div>
              </div>

              {/* Theme & Background Music */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Background Theme Visual
                  </label>
                  <select
                    value={backgroundTheme}
                    onChange={(e) => setBackgroundTheme(e.target.value as BackgroundTheme)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold capitalize focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="candy">🍬 Candy Pastel</option>
                    <option value="safari">🦁 Safari Jungle</option>
                    <option value="space">🚀 Outer Space</option>
                    <option value="ocean">🌊 Deep Ocean</option>
                    <option value="rainbow">🌈 Rainbow Sky</option>
                    <option value="sunset">🌅 Sunset Glow</option>
                    <option value="meadow">🍀 Green Meadow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Background Music Track
                  </label>
                  <select
                    value={backgroundMusic}
                    onChange={(e) => setBackgroundMusic(e.target.value as BackgroundMusic)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-bold capitalize focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="playful_melody">🎵 Playful Melody</option>
                    <option value="sunny_day">☀️ Sunny Day Bounce</option>
                    <option value="gentle_breeze">🎹 Gentle Breeze</option>
                    <option value="adventure">🥁 Adventure Quest</option>
                    <option value="none">🔇 No Background Music</option>
                  </select>
                </div>
              </div>

              {/* Reward Badge Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Select Unlocked Reward Badge (Presented on Passing)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                  {badges.map((badge) => {
                    const isSelected = selectedBadge.id === badge.id;
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => setSelectedBadge(badge)}
                        className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 scale-105'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <BadgeIcon badge={badge} size="sm" isUnlocked={true} showLabel={false} />
                        <span className="text-[10px] font-extrabold text-zinc-800 line-clamp-1">{badge.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Selection & Ordering */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Select & Arrange Questions in Sheet ({selectedQuestionIds.length} chosen)
                </label>

                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
                  {questions.map((q) => {
                    const isIncluded = selectedQuestionIds.includes(q.id);
                    const orderIndex = selectedQuestionIds.indexOf(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isIncluded
                            ? 'bg-white border-indigo-300 shadow-xs'
                            : 'bg-zinc-100/70 border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => handleToggleQuestionInSheet(q.id)}
                            className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-extrabold text-xs text-zinc-900">{q.title}</p>
                            <p className="text-[10px] text-zinc-400 capitalize">
                              Type: {q.type.replace(/_/g, ' ')} • +{q.rewardValue} {q.rewardType}
                            </p>
                          </div>
                        </div>

                        {isIncluded && (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-md">
                              #{orderIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(orderIndex, 'up')}
                              disabled={orderIndex === 0}
                              className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(orderIndex, 'down')}
                              disabled={orderIndex === selectedQuestionIds.length - 1}
                              className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Published switch */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-xs font-bold text-zinc-800">Publish to Kids Adventure Map</span>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-md"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-zinc-600 text-sm font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  {editingSheet ? 'Save Changes' : 'Create Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
