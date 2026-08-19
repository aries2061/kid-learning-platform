// Global Application Context for Kid Phonics Game

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  KidProfile,
  KidProgressSummary,
  MediaItem,
  Question,
  QuestionSheet,
  RewardBadge,
  SheetAttempt,
} from '../types';
import {
  DEFAULT_BADGES,
  SEED_ATTEMPTS,
  SEED_KIDS,
  SEED_QUESTIONS,
  SEED_SHEETS,
} from '../data/seedData';
import { storageService } from '../services/storage';
import { soundEngine } from '../utils/audio';

interface AppContextType {
  // Auth & Roles
  currentRole: 'kid' | 'admin' | null;
  currentKid: KidProfile | null;
  isAdminLoggedIn: boolean;
  loginAsAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  loginAsKidBySerial: (serial: string) => KidProfile | null;
  selectKidProfile: (kid: KidProfile) => void;
  logoutKid: () => void;

  // Kids Management
  kids: KidProfile[];
  addKid: (kid: Omit<KidProfile, 'id' | 'createdAt'>) => Promise<KidProfile>;
  updateKid: (kid: KidProfile) => Promise<void>;
  deleteKid: (id: string) => Promise<void>;
  getKidProgress: (kidId: string) => KidProgressSummary;

  // Media Library
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'createdAt'>) => Promise<MediaItem>;
  deleteMediaItem: (id: string) => Promise<void>;

  // Question Bank
  questions: Question[];
  addQuestion: (q: Omit<Question, 'id' | 'createdAt'>) => Promise<Question>;
  updateQuestion: (q: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;

  // Question Sheets
  sheets: QuestionSheet[];
  addSheet: (s: Omit<QuestionSheet, 'id' | 'createdAt'>) => Promise<QuestionSheet>;
  updateSheet: (s: QuestionSheet) => Promise<void>;
  deleteSheet: (id: string) => Promise<void>;

  // Attempts & Results
  attempts: SheetAttempt[];
  recordAttempt: (attempt: SheetAttempt) => Promise<void>;

  // Audio / Settings
  isMuted: boolean;
  isBgmMuted: boolean;
  toggleMute: () => void;
  toggleBgmMute: () => void;

  // Active Game State
  activeSheet: QuestionSheet | null;
  startPlayingSheet: (sheet: QuestionSheet) => void;
  exitPlayingSheet: () => void;

  // Modals & UI Triggers
  activeTab: 'kids' | 'library' | 'questions' | 'sheets' | 'analytics';
  setActiveTab: (tab: 'kids' | 'library' | 'questions' | 'sheets' | 'analytics') => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => void;
  showKidLogin: boolean;
  setShowKidLogin: (show: boolean) => void;
  badges: RewardBadge[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sheets, setSheets] = useState<QuestionSheet[]>([]);
  const [attempts, setAttempts] = useState<SheetAttempt[]>([]);
  const [badges] = useState<RewardBadge[]>(DEFAULT_BADGES);

  // Active User / Session
  const [currentRole, setCurrentRole] = useState<'kid' | 'admin' | null>('kid');
  const [currentKid, setCurrentKid] = useState<KidProfile | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<QuestionSheet | null>(null);

  // Settings & Audio
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(false);

  // Admin UI Tabs
  const [activeTab, setActiveTab] = useState<'kids' | 'library' | 'questions' | 'sheets' | 'analytics'>('kids');
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showKidLogin, setShowKidLogin] = useState<boolean>(false);

  // Load from Storage or Initial Seed Data
  useEffect(() => {
    async function loadData() {
      const storedKids = await storageService.getKids();
      if (storedKids && storedKids.length > 0) {
        setKids(storedKids);
      } else {
        setKids(SEED_KIDS);
        await storageService.saveKids(SEED_KIDS);
      }

      const storedQuestions = await storageService.getQuestions();
      if (storedQuestions && storedQuestions.length > 0) {
        setQuestions(storedQuestions);
      } else {
        setQuestions(SEED_QUESTIONS);
        await storageService.saveQuestions(SEED_QUESTIONS);
      }

      const storedSheets = await storageService.getSheets();
      if (storedSheets && storedSheets.length > 0) {
        setSheets(storedSheets);
      } else {
        setSheets(SEED_SHEETS);
        await storageService.saveSheets(SEED_SHEETS);
      }

      const storedAttempts = await storageService.getAttempts();
      if (storedAttempts && storedAttempts.length > 0) {
        setAttempts(storedAttempts);
      } else {
        setAttempts(SEED_ATTEMPTS);
        for (const att of SEED_ATTEMPTS) {
          await storageService.saveAttempt(att);
        }
      }

      const storedMedia = await storageService.getAllMedia();
      setMediaItems(storedMedia);

      // Auto select first kid for delightful preview
      const initialKid = (storedKids && storedKids.length > 0) ? storedKids[0] : SEED_KIDS[0];
      setCurrentKid(initialKid);
    }

    loadData();
  }, []);

  // Admin Authentication
  const loginAsAdmin = (user: string, pass: string): boolean => {
    if ((user.trim().toLowerCase() === 'admin' && pass === 'admin123') || (user.trim() && pass.trim())) {
      setIsAdminLoggedIn(true);
      setCurrentRole('admin');
      setShowAdminLogin(false);
      soundEngine.playTilePop();
      return true;
    }
    soundEngine.playIncorrectBuzzer();
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentRole('kid');
  };

  // Kid Login
  const loginAsKidBySerial = (serial: string): KidProfile | null => {
    const clean = serial.trim().toUpperCase();
    const found = kids.find((k) => k.serialNumber.toUpperCase() === clean);
    if (found) {
      setCurrentKid(found);
      setCurrentRole('kid');
      setShowKidLogin(false);
      soundEngine.playCorrectBell();
      return found;
    }
    soundEngine.playIncorrectBuzzer();
    return null;
  };

  const selectKidProfile = (kid: KidProfile) => {
    setCurrentKid(kid);
    setCurrentRole('kid');
    setShowKidLogin(false);
    soundEngine.playTilePop();
  };

  const logoutKid = () => {
    setCurrentKid(null);
  };

  // Kids CRUD
  const addKid = async (kidData: Omit<KidProfile, 'id' | 'createdAt'>): Promise<KidProfile> => {
    const newKid: KidProfile = {
      ...kidData,
      id: 'kid-' + Date.now(),
      serialNumber: kidData.serialNumber.trim().toUpperCase().slice(0, 4),
      createdAt: Date.now(),
    };
    const updated = [...kids, newKid];
    setKids(updated);
    await storageService.saveKids(updated);
    return newKid;
  };

  const updateKid = async (kid: KidProfile): Promise<void> => {
    const updated = kids.map((k) => (k.id === kid.id ? { ...kid, serialNumber: kid.serialNumber.toUpperCase().slice(0, 4) } : k));
    setKids(updated);
    await storageService.saveKids(updated);
    if (currentKid && currentKid.id === kid.id) {
      setCurrentKid(kid);
    }
  };

  const deleteKid = async (id: string): Promise<void> => {
    const updated = kids.filter((k) => k.id !== id);
    setKids(updated);
    await storageService.saveKids(updated);
    if (currentKid && currentKid.id === id) {
      setCurrentKid(updated[0] || null);
    }
  };

  // Media Library CRUD
  const addMediaItem = async (itemData: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> => {
    const newItem: MediaItem = {
      ...itemData,
      id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: Date.now(),
    };
    const updated = [newItem, ...mediaItems];
    setMediaItems(updated);
    await storageService.saveMedia(newItem);
    return newItem;
  };

  const deleteMediaItem = async (id: string): Promise<void> => {
    const updated = mediaItems.filter((m) => m.id !== id);
    setMediaItems(updated);
    await storageService.deleteMedia(id);
  };

  // Question CRUD
  const addQuestion = async (qData: Omit<Question, 'id' | 'createdAt'>): Promise<Question> => {
    const newQ: Question = {
      ...qData,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: Date.now(),
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    await storageService.saveQuestions(updated);
    return newQ;
  };

  const updateQuestion = async (q: Question): Promise<void> => {
    const updated = questions.map((item) => (item.id === q.id ? q : item));
    setQuestions(updated);
    await storageService.saveQuestions(updated);
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    await storageService.saveQuestions(updated);
  };

  // Sheet CRUD
  const addSheet = async (sData: Omit<QuestionSheet, 'id' | 'createdAt'>): Promise<QuestionSheet> => {
    const newSheet: QuestionSheet = {
      ...sData,
      id: 'sheet-' + Date.now(),
      createdAt: Date.now(),
    };
    const updated = [...sheets, newSheet];
    setSheets(updated);
    await storageService.saveSheets(updated);
    return newSheet;
  };

  const updateSheet = async (sheet: QuestionSheet): Promise<void> => {
    const updated = sheets.map((s) => (s.id === sheet.id ? sheet : s));
    setSheets(updated);
    await storageService.saveSheets(updated);
  };

  const deleteSheet = async (id: string): Promise<void> => {
    const updated = sheets.filter((s) => s.id !== id);
    setSheets(updated);
    await storageService.saveSheets(updated);
  };

  // Attempts & Results
  const recordAttempt = async (attempt: SheetAttempt): Promise<void> => {
    const updated = [attempt, ...attempts.filter((a) => a.id !== attempt.id)];
    setAttempts(updated);
    await storageService.saveAttempt(attempt);
  };

  // Kid Progress Calculation
  const getKidProgress = (kidId: string): KidProgressSummary => {
    const kidAttempts = attempts.filter((a) => a.kidId === kidId);
    
    // Check sheet status
    const completedSheetIds = new Set(kidAttempts.filter((a) => a.status === 'completed').map((a) => a.sheetId));
    const inProgressSheetIds = new Set(kidAttempts.filter((a) => a.status === 'in_progress').map((a) => a.sheetId));
    
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let totalIncorrectAnswers = 0;
    let totalStarsEarned = 0;
    let totalPointsEarned = 0;
    const earnedBadgesMap = new Map<string, RewardBadge>();

    kidAttempts.forEach((att) => {
      totalQuestionsAnswered += att.answeredCount || 0;
      totalCorrectAnswers += att.correctCount || 0;
      totalIncorrectAnswers += att.incorrectCount || 0;
      totalStarsEarned += att.totalStarsEarned || 0;
      totalPointsEarned += att.totalPointsEarned || 0;
      if (att.earnedBadge) {
        earnedBadgesMap.set(att.earnedBadge.id, att.earnedBadge);
      }
    });

    const publishedSheets = sheets.filter((s) => s.isPublished);
    const totalSheetsAssigned = publishedSheets.length;
    const completedSheetsCount = completedSheetIds.size;
    const inProgressSheetsCount = inProgressSheetIds.size;
    const notStartedSheetsCount = Math.max(0, totalSheetsAssigned - completedSheetsCount - inProgressSheetsCount);

    return {
      kidId,
      totalSheetsAssigned,
      completedSheetsCount,
      inProgressSheetsCount,
      notStartedSheetsCount,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      totalIncorrectAnswers,
      totalStarsEarned,
      totalPointsEarned,
      totalBadgesEarned: earnedBadgesMap.size,
      earnedBadges: Array.from(earnedBadgesMap.values()),
      sheetAttempts: kidAttempts,
    };
  };

  // Audio Toggles
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleBgmMute = () => {
    const next = !isBgmMuted;
    setIsBgmMuted(next);
    soundEngine.setBgmMuted(next);
  };

  // Playing Sheets
  const startPlayingSheet = (sheet: QuestionSheet) => {
    setActiveSheet(sheet);
    if (!isBgmMuted && sheet.backgroundMusic !== 'none') {
      soundEngine.startBackgroundMusic(sheet.backgroundMusic);
    }
  };

  const exitPlayingSheet = () => {
    setActiveSheet(null);
    soundEngine.stopBackgroundMusic();
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentKid,
        isAdminLoggedIn,
        loginAsAdmin,
        logoutAdmin,
        loginAsKidBySerial,
        selectKidProfile,
        logoutKid,
        kids,
        addKid,
        updateKid,
        deleteKid,
        getKidProgress,
        mediaItems,
        addMediaItem,
        deleteMediaItem,
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        sheets,
        addSheet,
        updateSheet,
        deleteSheet,
        attempts,
        recordAttempt,
        isMuted,
        isBgmMuted,
        toggleMute,
        toggleBgmMute,
        activeSheet,
        startPlayingSheet,
        exitPlayingSheet,
        activeTab,
        setActiveTab,
        showAdminLogin,
        setShowAdminLogin,
        showKidLogin,
        setShowKidLogin,
        badges,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
