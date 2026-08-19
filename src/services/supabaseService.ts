import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { KidProfile, MediaItem, Question, QuestionSheet, SheetAttempt } from '../types';

export const supabaseService = {
  isConfigured: isSupabaseConfigured,

  // --- KIDS ---
  async getKids(): Promise<KidProfile[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('kids').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch kids error:', error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      serialNumber: row.serial_number,
      avatarUrl: row.avatar_url,
      isCustomPhoto: row.is_custom_photo,
      notes: row.notes,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },

  async saveKid(kid: KidProfile): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('kids').upsert({
      id: kid.id,
      name: kid.name,
      age: kid.age,
      serial_number: kid.serialNumber,
      avatar_url: kid.avatarUrl,
      is_custom_photo: kid.isCustomPhoto,
      notes: kid.notes,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase save kid error:', error);
      return false;
    }
    return true;
  },

  async deleteKid(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('kids').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete kid error:', error);
      return false;
    }
    return true;
  },

  // --- QUESTIONS ---
  async getQuestions(): Promise<Question[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch questions error:', error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      questionText: row.question_text,
      questionVoiceUrl: row.question_voice_url,
      showVoiceRecordButton: row.show_voice_record_button,
      questionImageUrl: row.question_image_url,
      questionVideoUrl: row.question_video_url,
      targetWord: row.target_word,
      wordLength: row.word_length,
      cvcAudioUrl: row.cvc_audio_url,
      letterOptions: row.letter_options,
      targetPrompt: row.target_prompt,
      mcOptions: row.mc_options,
      fullWord: row.full_word,
      maskedWord: row.masked_word,
      missingLetterIndex: row.missing_letter_index,
      missingLetterAnswer: row.missing_letter_answer,
      blankLetterOptions: row.blank_letter_options,
      matchingPairs: row.matching_pairs,
      correctAnswerSummary: row.correct_answer_summary,
      rewardType: row.reward_type,
      rewardValue: row.reward_value,
      isSkippable: row.is_skippable,
      category: row.category,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },

  async saveQuestion(q: Question): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('questions').upsert({
      id: q.id,
      type: q.type,
      title: q.title,
      question_text: q.questionText,
      question_voice_url: q.questionVoiceUrl,
      show_voice_record_button: q.showVoiceRecordButton,
      question_image_url: q.questionImageUrl,
      question_video_url: q.questionVideoUrl,
      target_word: q.targetWord,
      word_length: q.wordLength,
      cvc_audio_url: q.cvcAudioUrl,
      letter_options: q.letterOptions,
      target_prompt: q.targetPrompt,
      mc_options: q.mcOptions,
      full_word: q.fullWord,
      masked_word: q.maskedWord,
      missing_letter_index: q.missingLetterIndex,
      missing_letter_answer: q.missingLetterAnswer,
      blank_letter_options: q.blankLetterOptions,
      matching_pairs: q.matchingPairs,
      correct_answer_summary: q.correctAnswerSummary,
      reward_type: q.rewardType,
      reward_value: q.rewardValue,
      is_skippable: q.isSkippable,
      category: q.category,
    });

    if (error) {
      console.error('Supabase save question error:', error);
      return false;
    }
    return true;
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete question error:', error);
      return false;
    }
    return true;
  },

  // --- QUESTION SHEETS ---
  async getSheets(): Promise<QuestionSheet[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('question_sheets').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase fetch sheets error:', error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      questionIds: row.question_ids || [],
      passingScore: row.passing_score,
      timeLimitSeconds: row.time_limit_seconds,
      rewardBadge: row.reward_badge,
      rewardBonusPoints: row.reward_bonus_points,
      backgroundTheme: row.background_theme,
      backgroundMusic: row.background_music,
      customBackgroundImageUrl: row.custom_background_image_url,
      isPublished: row.is_published,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },

  async saveSheet(sheet: QuestionSheet): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('question_sheets').upsert({
      id: sheet.id,
      title: sheet.title,
      description: sheet.description,
      category: sheet.category,
      question_ids: sheet.questionIds,
      passing_score: sheet.passingScore,
      time_limit_seconds: sheet.timeLimitSeconds,
      reward_badge: sheet.rewardBadge,
      reward_bonus_points: sheet.rewardBonusPoints,
      background_theme: sheet.backgroundTheme,
      background_music: sheet.backgroundMusic,
      custom_background_image_url: sheet.customBackgroundImageUrl,
      is_published: sheet.isPublished,
    });

    if (error) {
      console.error('Supabase save sheet error:', error);
      return false;
    }
    return true;
  },

  async deleteSheet(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('question_sheets').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete sheet error:', error);
      return false;
    }
    return true;
  },

  // --- ATTEMPTS ---
  async getAttempts(): Promise<SheetAttempt[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('sheet_attempts').select('*').order('started_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch attempts error:', error);
      return null;
    }

    return (data || []).map((row) => {
      const answers = row.answers || [];
      const correctCount = answers.filter((a: any) => a.isCorrect).length;
      const incorrectCount = answers.filter((a: any) => !a.isCorrect).length;

      return {
        id: row.id,
        kidId: row.kid_id,
        sheetId: row.sheet_id,
        sheetTitle: row.sheet_title,
        startedAt: new Date(row.started_at).getTime(),
        completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
        status: row.status,
        totalQuestions: answers.length,
        answeredCount: answers.length,
        correctCount,
        incorrectCount,
        answers,
        totalStarsEarned: row.stars_earned || 0,
        totalPointsEarned: row.points_earned || 0,
        scorePercentage: row.score_percentage || 0,
        passed: row.passed || false,
        earnedBadge: row.badge_awarded,
      };
    });
  },

  async saveAttempt(attempt: SheetAttempt): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('sheet_attempts').upsert({
      id: attempt.id,
      kid_id: attempt.kidId,
      sheet_id: attempt.sheetId,
      sheet_title: attempt.sheetTitle,
      started_at: new Date(attempt.startedAt).toISOString(),
      completed_at: attempt.completedAt ? new Date(attempt.completedAt).toISOString() : null,
      status: attempt.status,
      answers: attempt.answers,
      stars_earned: attempt.totalStarsEarned,
      points_earned: attempt.totalPointsEarned,
      score_percentage: attempt.scorePercentage,
      passed: attempt.passed,
      badge_awarded: attempt.earnedBadge,
    });

    if (error) {
      console.error('Supabase save attempt error:', error);
      return false;
    }
    return true;
  },

  // --- MEDIA METADATA ---
  async getMedia(): Promise<MediaItem[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('media_files').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase fetch media error:', error);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      url: row.url,
      size: row.size ? Number(row.size) : undefined,
      duration: row.duration ? Number(row.duration) : undefined,
      tags: row.tags,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },

  async saveMedia(item: MediaItem): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('media_files').upsert({
      id: item.id,
      name: item.name,
      type: item.type,
      url: item.url,
      size: item.size,
      duration: item.duration,
      tags: item.tags,
    });

    if (error) {
      console.error('Supabase save media error:', error);
      return false;
    }
    return true;
  },

  async deleteMedia(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('media_files').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete media error:', error);
      return false;
    }
    return true;
  },
};
