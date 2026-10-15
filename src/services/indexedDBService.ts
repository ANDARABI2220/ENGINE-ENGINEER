import { Project, BOQItem, FieldProgressReport } from '../types';
import { INITIAL_PROJECTS, INITIAL_BOQ_ITEMS, INITIAL_SOIL_TESTS } from '../data/afghanistanData';

export const DB_NAME = 'AfghanaBuild_OfflineDB';
export const DB_VERSION = 1;

export const STORES = {
  PROJECTS: 'projects',
  BOQ_ITEMS: 'boq_items',
  SITE_TASKS: 'site_tasks',
  SEISMIC_DATA: 'seismic_data',
  SYNC_QUEUE: 'sync_queue'
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export type SyncEntityType = 'project' | 'boq_item' | 'site_task' | 'seismic_data';
export type SyncAction = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict_resolved' | 'failed';

export interface SyncQueueItem {
  queueId: string;
  entityType: SyncEntityType;
  action: SyncAction;
  recordId: string;
  payload: any;
  timestamp: number; // UTC Epoch ms for "Latest Timestamp Wins" resolution
  isoTime: string;
  status: SyncStatus;
  retryCount: number;
  lastError?: string;
  conflictResolvedNote?: string;
}

export interface OfflineSeismicRecord {
  id: string;
  projectId: string;
  cityName: string;
  pga: number;
  liquefactionScore: number;
  soilClassification: string;
  bearingCapacityKpa: number;
  riskTier: string;
  highRiskElementIds: string[];
  notes?: string;
  updatedAt: string;
  timestamp: number;
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public async initOfflineDB(): Promise<IDBDatabase> {
    return this.getDB();
  }

  public async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Projects Store
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. BOQ Items Store
        if (!db.objectStoreNames.contains(STORES.BOQ_ITEMS)) {
          const boqStore = db.createObjectStore(STORES.BOQ_ITEMS, { keyPath: 'id' });
          boqStore.createIndex('projectId', 'projectId', { unique: false });
          boqStore.createIndex('category', 'category', { unique: false });
          boqStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 3. Site Tasks / Inspection Store
        if (!db.objectStoreNames.contains(STORES.SITE_TASKS)) {
          const taskStore = db.createObjectStore(STORES.SITE_TASKS, { keyPath: 'clientUuid' });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 4. Seismic Data Store
        if (!db.objectStoreNames.contains(STORES.SEISMIC_DATA)) {
          const seismicStore = db.createObjectStore(STORES.SEISMIC_DATA, { keyPath: 'id' });
          seismicStore.createIndex('projectId', 'projectId', { unique: false });
          seismicStore.createIndex('pga', 'pga', { unique: false });
          seismicStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 5. Sync Queue Store (Outbox for Offline Changes)
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'queueId' });
          syncStore.createIndex('entityType', 'entityType', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Failed to open database:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  // Pre-seed default offline data if database is empty on first run
  public async seedInitialDataIfEmpty(): Promise<void> {
    try {
      const existingProjects = await this.getAll<Project>(STORES.PROJECTS);
      if (existingProjects.length === 0) {
        console.log('[IndexedDB] Pre-seeding offline Projects database...');
        await this.putBatch<Project>(STORES.PROJECTS, INITIAL_PROJECTS);
      }

      const existingBOQ = await this.getAll<BOQItem>(STORES.BOQ_ITEMS);
      if (existingBOQ.length === 0) {
        console.log('[IndexedDB] Pre-seeding offline BOQ Items database...');
        await this.putBatch<BOQItem>(STORES.BOQ_ITEMS, INITIAL_BOQ_ITEMS);
      }

      const existingTasks = await this.getAll<FieldProgressReport>(STORES.SITE_TASKS);
      if (existingTasks.length === 0) {
        const initialTasks: FieldProgressReport[] = [
          {
            clientUuid: 'task-initial-1',
            projectId: 'proj-01',
            physicalProgress: 42,
            notes: 'آرماتوربندی دال همکف و تست مقاومت کششی میلگرد تایید شد.',
            photosCount: 3,
            gpsVerified: true,
            status: 'synced',
            updatedAt: '۱۴۰۴/۰۷/۲۳ ۱۶:۳۰'
          },
          {
            clientUuid: 'task-initial-2',
            projectId: 'proj-01',
            physicalProgress: 44,
            notes: 'نمونه‌گیری بتن ستون‌های محور C3 و آماده‌سازی قالب‌بندی سقف اول.',
            photosCount: 2,
            gpsVerified: true,
            status: 'synced',
            updatedAt: '۱۴۰۴/۰۷/۲۴ ۰۹:۱۵'
          }
        ];
        await this.putBatch<FieldProgressReport>(STORES.SITE_TASKS, initialTasks);
      }

      const existingSeismic = await this.getAll<OfflineSeismicRecord>(STORES.SEISMIC_DATA);
      if (existingSeismic.length === 0) {
        const initialSeismicRecords: OfflineSeismicRecord[] = INITIAL_SOIL_TESTS.map((st, idx) => ({
          id: `seismic-${st.projectId || 'proj-01'}-${idx + 1}`,
          projectId: st.projectId || 'proj-01',
          cityName: idx % 2 === 0 ? 'کابل' : 'هرات',
          pga: idx % 2 === 0 ? 0.35 : 0.28,
          liquefactionScore: 4.2,
          soilClassification: st.soilClassification,
          bearingCapacityKpa: st.bearingCapacityKpa,
          riskTier: 'HIGH',
          highRiskElementIds: ['RAFT-FND-01', 'COL-F0-1', 'COL-F0-2'],
          notes: st.engineerNotes,
          updatedAt: st.testDate || new Date().toISOString(),
          timestamp: Date.now() - (idx * 86400000)
        }));
        await this.putBatch<OfflineSeismicRecord>(STORES.SEISMIC_DATA, initialSeismicRecords);
      }
    } catch (err) {
      console.warn('[IndexedDB] Seed initialization notice:', err);
    }
  }

  // Generic Get All
  public async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic Get By ID
  public async getById<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic Put Item
  public async putItem<T>(storeName: StoreName, item: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Generic Put Batch
  public async putBatch<T>(storeName: StoreName, items: T[]): Promise<void> {
    if (items.length === 0) return;
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Generic Delete Item
  public async deleteItem(storeName: StoreName, key: IDBValidKey): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Generic Clear Store
  public async clearStore(storeName: StoreName): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Module 1: Projects Convenience
  public async getOfflineProjects(): Promise<Project[]> {
    return this.getAll<Project>(STORES.PROJECTS);
  }

  public async saveOfflineProject(project: Project): Promise<void> {
    return this.putItem<Project>(STORES.PROJECTS, project);
  }

  // Module 2: BOQ Items Convenience
  public async getOfflineBOQItems(projectId?: string): Promise<BOQItem[]> {
    const all = await this.getAll<BOQItem>(STORES.BOQ_ITEMS);
    if (!projectId) return all;
    return all.filter((item) => item.projectId === projectId);
  }

  public async saveOfflineBOQItem(item: BOQItem): Promise<void> {
    return this.putItem<BOQItem>(STORES.BOQ_ITEMS, item);
  }

  public async deleteOfflineBOQItem(id: string): Promise<void> {
    return this.deleteItem(STORES.BOQ_ITEMS, id);
  }

  // Module 3: Site Tasks Convenience
  public async getOfflineSiteTasks(projectId?: string): Promise<FieldProgressReport[]> {
    const all = await this.getAll<FieldProgressReport>(STORES.SITE_TASKS);
    if (!projectId) return all;
    return all.filter((task) => task.projectId === projectId);
  }

  public async saveOfflineSiteTask(task: FieldProgressReport): Promise<void> {
    return this.putItem<FieldProgressReport>(STORES.SITE_TASKS, task);
  }

  // Module 4: Seismic Data Convenience
  public async getOfflineSeismicRecords(projectId?: string): Promise<OfflineSeismicRecord[]> {
    const all = await this.getAll<OfflineSeismicRecord>(STORES.SEISMIC_DATA);
    if (!projectId) return all;
    return all.filter((rec) => rec.projectId === projectId);
  }

  public async saveOfflineSeismicRecord(record: OfflineSeismicRecord): Promise<void> {
    return this.putItem<OfflineSeismicRecord>(STORES.SEISMIC_DATA, record);
  }

  // Sync Queue Convenience
  public async getPendingSyncQueue(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
    return all.filter((item) => item.status === 'pending' || item.status === 'failed');
  }

  public async getAllSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  }

  public async enqueueSyncItem(item: SyncQueueItem): Promise<void> {
    return this.putItem<SyncQueueItem>(STORES.SYNC_QUEUE, item);
  }

  public async updateSyncItem(item: SyncQueueItem): Promise<void> {
    return this.putItem<SyncQueueItem>(STORES.SYNC_QUEUE, item);
  }

  public async removeSyncItem(queueId: string): Promise<void> {
    return this.deleteItem(STORES.SYNC_QUEUE, queueId);
  }

  public async clearCompletedSyncQueue(): Promise<void> {
    const all = await this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
    const toDelete = all.filter((item) => item.status === 'synced' || item.status === 'conflict_resolved');
    for (const item of toDelete) {
      await this.removeSyncItem(item.queueId);
    }
  }
}

export const indexedDBService = new IndexedDBService();
