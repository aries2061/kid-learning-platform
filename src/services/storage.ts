// IndexedDB and LocalStorage Service for Kid Phonics Quest

import { KidProfile, MediaItem, Question, QuestionSheet, SheetAttempt } from '../types';

const DB_NAME = 'KidPhonicsQuestDB';
const DB_VERSION = 1;

class StorageService {
  private db: IDBDatabase | null = null;
  private isReady: Promise<boolean>;

  constructor() {
    this.isReady = this.initDB();
  }

  private initDB(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, fallback to memory/localStorage');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kids')) {
          db.createObjectStore('kids', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('questions')) {
          db.createObjectStore('questions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sheets')) {
          db.createObjectStore('sheets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('attempts')) {
          db.createObjectStore('attempts', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event);
        resolve(false);
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore | null> {
    await this.isReady;
    if (!this.db) return null;
    try {
      const tx = this.db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch (e) {
      console.warn(`Error getting store ${storeName}:`, e);
      return null;
    }
  }

  // --- Media Items (Images, Audio blobs, Video blobs) ---
  async saveMedia(item: MediaItem): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    if (store) {
      return new Promise((resolve) => {
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  }

  async getAllMedia(): Promise<MediaItem[]> {
    const store = await this.getStore('media', 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items = (req.result || []).map((m: MediaItem) => {
            // Re-create object URL if blobData exists
            if (m.blobData && !m.url.startsWith('data:')) {
              try {
                m.url = URL.createObjectURL(m.blobData);
              } catch (e) {
                console.warn('URL creation error:', e);
              }
            }
            return m;
          });
          resolve(items);
        };
        req.onerror = () => resolve([]);
      });
    }
    return [];
  }

  async deleteMedia(id: string): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    if (store) {
      return new Promise((resolve) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  }

  // --- Kids Profiles ---
  async saveKids(kids: KidProfile[]): Promise<void> {
    localStorage.setItem('kpq_kids', JSON.stringify(kids));
    const store = await this.getStore('kids', 'readwrite');
    if (store) {
      for (const kid of kids) {
        store.put(kid);
      }
    }
  }

  async getKids(): Promise<KidProfile[] | null> {
    const local = localStorage.getItem('kpq_kids');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    const store = await this.getStore('kids', 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result.length > 0 ? req.result : null);
        req.onerror = () => resolve(null);
      });
    }
    return null;
  }

  // --- Questions ---
  async saveQuestions(questions: Question[]): Promise<void> {
    localStorage.setItem('kpq_questions', JSON.stringify(questions));
    const store = await this.getStore('questions', 'readwrite');
    if (store) {
      for (const q of questions) {
        store.put(q);
      }
    }
  }

  async getQuestions(): Promise<Question[] | null> {
    const local = localStorage.getItem('kpq_questions');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    const store = await this.getStore('questions', 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result.length > 0 ? req.result : null);
        req.onerror = () => resolve(null);
      });
    }
    return null;
  }

  // --- Question Sheets ---
  async saveSheets(sheets: QuestionSheet[]): Promise<void> {
    localStorage.setItem('kpq_sheets', JSON.stringify(sheets));
    const store = await this.getStore('sheets', 'readwrite');
    if (store) {
      for (const s of sheets) {
        store.put(s);
      }
    }
  }

  async getSheets(): Promise<QuestionSheet[] | null> {
    const local = localStorage.getItem('kpq_sheets');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    const store = await this.getStore('sheets', 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result.length > 0 ? req.result : null);
        req.onerror = () => resolve(null);
      });
    }
    return null;
  }

  // --- Sheet Attempts / Progress History ---
  async saveAttempt(attempt: SheetAttempt): Promise<void> {
    const existing = await this.getAttempts();
    const filtered = existing.filter((a) => a.id !== attempt.id);
    const updated = [attempt, ...filtered];
    localStorage.setItem('kpq_attempts', JSON.stringify(updated));

    const store = await this.getStore('attempts', 'readwrite');
    if (store) {
      store.put(attempt);
    }
  }

  async getAttempts(): Promise<SheetAttempt[]> {
    const local = localStorage.getItem('kpq_attempts');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    const store = await this.getStore('attempts', 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }
    return [];
  }
}

export const storageService = new StorageService();
