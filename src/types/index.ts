export type QuestionType = 'cvc_blending' | 'multiple_choice' | 'fill_in_blank' | 'matching';

export type RewardType = 'stars' | 'points';

export type MediaType = 'image' | 'audio' | 'video';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string; // Blob URL or base64 or SVG data URL
  blobData?: Blob;
  size?: number;
  duration?: number;
  createdAt: number;
  tags?: string[];
}

export interface MatchingPair {
  id: string;
  leftPrompt: string; // e.g. "A" or image/audio
  rightMatch: string;  // e.g. "Apple"
  leftAudio?: string;
  rightImage?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  questionText: string;
  questionVoiceUrl?: string; // Audio file url or recorded voice
  showVoiceRecordButton?: boolean;
  questionImageUrl?: string;
  questionVideoUrl?: string;
  
  // Specific properties
  // For CVC Blending:
  targetWord?: string; // e.g. "CAT"
  wordLength?: number; // e.g. 3, 4, 5
  cvcAudioUrl?: string; // Word pronunciation audio
  letterOptions?: string[]; // Randomized letter bank including target letters & distractors
  
  // For Multiple Choice:
  targetPrompt?: string; // e.g. "Letter B"
  mcOptions?: Array<{
    id: string;
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
  }>;
  
  // For Fill In The Blank:
  fullWord?: string; // e.g. "SUN"
  maskedWord?: string; // e.g. "S _ N"
  missingLetterIndex?: number; // e.g. 1
  missingLetterAnswer?: string; // e.g. "U"
  blankLetterOptions?: string[]; // Randomized letter bank (e.g. ["A", "E", "I", "O", "U"])
  
  // For Matching:
  matchingPairs?: MatchingPair[];

  // General settings
  correctAnswerSummary?: string;
  rewardType: RewardType;
  rewardValue: number; // e.g., 1 star or 10 points
  isSkippable: boolean; // decided by admin
  category?: string; // e.g. "Short A", "Animals", "Phonics Level 1"
  createdAt: number;
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  iconName: string; // e.g. "trophy", "star", "crown", "medal", "wizard", "rocket", "sparkles", "heart"
  color: string; // Hex or tailwind color
  bgGradient: string;
}

export type BackgroundTheme = 'candy' | 'safari' | 'space' | 'ocean' | 'rainbow' | 'sunset' | 'meadow';
export type BackgroundMusic = 'playful_melody' | 'sunny_day' | 'gentle_breeze' | 'adventure' | 'none';
export type BgmTrack = BackgroundMusic;

export interface QuestionSheet {
  id: string;
  title: string;
  description: string;
  category: string;
  questionIds: string[]; // Ordered list of question IDs from question bank
  passingScore: number; // Percentage, e.g. 70
  timeLimitSeconds?: number; // 0 or undefined for no limit
  rewardBadge: RewardBadge;
  rewardBonusPoints?: number;
  backgroundTheme: BackgroundTheme;
  backgroundMusic: BackgroundMusic;
  bgmTrack?: BackgroundMusic;
  customBackgroundImageUrl?: string;
  createdAt: number;
  isPublished: boolean;
}

export interface KidProfile {
  id: string;
  serialNumber: string; // Max 4 chars/digits (e.g., "1001", "KID1")
  name: string;
  age: number;
  avatarUrl?: string; // Preset avatar ID or custom uploaded photo
  isCustomPhoto?: boolean;
  notes?: string;
  createdAt: number;
}

export interface QuestionAnswerRecord {
  questionId: string;
  questionType: QuestionType;
  questionText: string;
  userAnswer: string | string[] | Record<string, string>;
  isCorrect: boolean;
  pointsAwarded: number;
  starsAwarded: number;
  answeredAt: number;
}

export interface SheetAttempt {
  id: string;
  kidId: string;
  sheetId: string;
  sheetTitle: string;
  startedAt: number;
  completedAt?: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  totalStarsEarned: number;
  totalPointsEarned: number;
  scorePercentage: number;
  passed: boolean;
  earnedBadge?: RewardBadge;
  answers: QuestionAnswerRecord[];
}

export interface KidProgressSummary {
  kidId: string;
  totalSheetsAssigned: number;
  completedSheetsCount: number;
  inProgressSheetsCount: number;
  notStartedSheetsCount: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalStarsEarned: number;
  totalPointsEarned: number;
  totalBadgesEarned: number;
  earnedBadges: RewardBadge[];
  unlockedBadges?: RewardBadge[];
  sheetAttempts: SheetAttempt[];
}
