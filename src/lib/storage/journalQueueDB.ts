/**
 * IndexedDB Wrapper — Journal Queue Storage
 * § 37 Offline
 *
 * ใช้เก็บ journal messages locally เมื่อ offline
 * ข้อมูลทั้งหมด real — ไม่ mock/placeholder
 */

export interface JournalQueueItem {
  id: string; // UUID from DB
  userId: string;
  content: string;
  hub?: string;
  mood?: string;
  createdAt: string; // ISO timestamp
  syncedAt?: string | null;
  syncError?: string | null;
  syncAttempts: number;
  metadata?: Record<string, unknown>;
}

const DB_NAME = 'selfprint-journal';
const DB_VERSION = 1;
const STORE_NAME = 'journal_queue';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initJournalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId_synced', ['userId', 'syncedAt']);
        store.createIndex('userId_created', ['userId', 'createdAt']);
        store.createIndex('synced', 'syncedAt');
      }
    };
  });
}

/**
 * Save message to queue (offline)
 */
export async function addToQueue(item: Omit<JournalQueueItem, 'id'>): Promise<string> {
  const database = await initJournalDB();
  const id = crypto.randomUUID();
  const toAdd = { ...item, id };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(toAdd);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(new Error('Failed to add to queue'));
  });
}

/**
 * Get all unsync messages for user
 */
export async function getUnSyncedMessages(userId: string): Promise<JournalQueueItem[]> {
  const database = await initJournalDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId_synced');

    // Find all where userId=X AND syncedAt IS NULL
    const range = IDBKeyRange.bound([userId, null], [userId, null]);
    const request = index.getAll(range);

    request.onsuccess = () => {
      const all = request.result as JournalQueueItem[];
      resolve(all.filter((item) => item.syncedAt === null));
    };
    request.onerror = () => reject(new Error('Failed to read unsync messages'));
  });
}

/**
 * Mark message as synced + clear error
 */
export async function markSynced(itemId: string): Promise<void> {
  const database = await initJournalDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(itemId);

    request.onsuccess = () => {
      const item = request.result as JournalQueueItem;
      if (!item) {
        reject(new Error('Item not found'));
        return;
      }

      item.syncedAt = new Date().toISOString();
      item.syncError = null;
      item.syncAttempts = (item.syncAttempts || 0) + 1;

      const updateRequest = store.put(item);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(new Error('Failed to mark synced'));
    };
    request.onerror = () => reject(new Error('Failed to read item'));
  });
}

/**
 * Mark sync failed + increment retry counter
 */
export async function markSyncFailed(itemId: string, error: string): Promise<void> {
  const database = await initJournalDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(itemId);

    request.onsuccess = () => {
      const item = request.result as JournalQueueItem;
      if (!item) {
        reject(new Error('Item not found'));
        return;
      }

      item.syncError = error;
      item.syncAttempts = (item.syncAttempts || 0) + 1;

      const updateRequest = store.put(item);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(new Error('Failed to update sync error'));
    };
    request.onerror = () => reject(new Error('Failed to read item'));
  });
}

/**
 * Delete synced messages older than X days
 */
export async function deleteSyncedOlderThan(days: number = 30): Promise<number> {
  const database = await initJournalDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.openCursor();
    let deleted = 0;

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const item = cursor.value as JournalQueueItem;
        if (
          item.syncedAt &&
          new Date(item.syncedAt) < cutoffDate
        ) {
          cursor.delete();
          deleted++;
        }
        cursor.continue();
      } else {
        resolve(deleted);
      }
    };
    request.onerror = () => reject(new Error('Failed to delete old items'));
  });
}

/**
 * Get queue size (for debugging)
 */
export async function getQueueSize(userId?: string): Promise<number> {
  const database = await initJournalDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = userId
      ? store.index('userId_created').count(IDBKeyRange.bound([userId], [userId, []]))
      : store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Failed to count queue'));
  });
}

/**
 * Clear entire queue (use with caution)
 */
export async function clearQueue(): Promise<void> {
  const database = await initJournalDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear queue'));
  });
}
