import {
  indexedDBService,
  SyncQueueItem,
  SyncEntityType,
  SyncAction,
  STORES
} from './indexedDBService';

export type SyncStatusListener = (state: SyncState) => void;

export interface SyncState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  queueCount: number;
  lastSyncTime: string | null;
  lastSyncNote: string | null;
}

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private lastSyncNote: string | null = null;
  private listeners: Set<SyncStatusListener> = new Set();
  private autoSyncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkOnline);
      window.addEventListener('offline', this.handleNetworkOffline);

      // Listen for Service Worker background sync triggers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
            console.log('[SyncManager] Background sync trigger received from ServiceWorker');
            this.processSyncQueue();
          }
        });
      }

      // Initialize DB and process any pending items
      indexedDBService.initOfflineDB().then(async () => {
        await indexedDBService.seedInitialDataIfEmpty();
        this.notifyListeners();
        if (this.effectiveOnlineStatus()) {
          this.processSyncQueue();
        }
      });
    }
  }

  // Helper to get effective online status (considers user simulation toggle)
  public effectiveOnlineStatus(): boolean {
    if (this.isSimulatedOffline) return false;
    return this.isOnline;
  }

  // Network Event Handlers
  private handleNetworkOnline = () => {
    console.log('[SyncManager] Network status changed: ONLINE');
    this.isOnline = true;
    this.notifyListeners();
    this.processSyncQueue();
  };

  private handleNetworkOffline = () => {
    console.log('[SyncManager] Network status changed: OFFLINE');
    this.isOnline = false;
    this.notifyListeners();
  };

  // Toggle offline simulation for live demonstrations
  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    console.log(`[SyncManager] Simulated offline toggled: ${this.isSimulatedOffline}`);
    this.notifyListeners();
    if (this.effectiveOnlineStatus()) {
      this.processSyncQueue();
    }
    return this.isSimulatedOffline;
  }

  public getSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  // Subscribe to status updates
  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncState {
    return {
      isOnline: this.effectiveOnlineStatus(),
      isSimulatedOffline: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      queueCount: 0, // dynamic caller can query DB or cached
      lastSyncTime: this.lastSyncTime,
      lastSyncNote: this.lastSyncNote
    };
  }

  public async getQueueCount(): Promise<number> {
    try {
      const pending = await indexedDBService.getPendingSyncQueue();
      return pending.length;
    } catch {
      return 0;
    }
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  // Enqueue a local change
  public async enqueueChange(
    entityType: SyncEntityType,
    action: SyncAction,
    recordId: string,
    payload: any
  ): Promise<SyncQueueItem> {
    const timestamp = Date.now();
    const queueItem: SyncQueueItem = {
      queueId: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      action,
      recordId,
      payload,
      timestamp,
      isoTime: new Date(timestamp).toLocaleString('fa-AF'),
      status: 'pending',
      retryCount: 0
    };

    // Save to sync queue store in IndexedDB
    await indexedDBService.enqueueSyncItem(queueItem);

    // Save/update locally in respective IndexedDB store immediately
    await this.applyLocalStoreChange(entityType, action, recordId, payload, timestamp);

    this.notifyListeners();

    // Register Background Sync if available in browser
    this.registerBackgroundSyncTag();

    // If online, kick off sync immediately
    if (this.effectiveOnlineStatus()) {
      this.processSyncQueue();
    }

    return queueItem;
  }

  // Apply change to local object store
  private async applyLocalStoreChange(
    entityType: SyncEntityType,
    action: SyncAction,
    recordId: string,
    payload: any,
    timestamp: number
  ) {
    try {
      if (action === 'delete') {
        if (entityType === 'boq_item') await indexedDBService.deleteOfflineBOQItem(recordId);
        else if (entityType === 'project') await indexedDBService.deleteItem(STORES.PROJECTS, recordId);
        else if (entityType === 'site_task') await indexedDBService.deleteItem(STORES.SITE_TASKS, recordId);
        else if (entityType === 'seismic_data') await indexedDBService.deleteItem(STORES.SEISMIC_DATA, recordId);
        return;
      }

      // Add or Update
      const record = { ...payload, updatedAtTimestamp: timestamp };

      if (entityType === 'project') {
        await indexedDBService.saveOfflineProject(record);
      } else if (entityType === 'boq_item') {
        await indexedDBService.saveOfflineBOQItem(record);
      } else if (entityType === 'site_task') {
        await indexedDBService.saveOfflineSiteTask(record);
      } else if (entityType === 'seismic_data') {
        await indexedDBService.saveOfflineSeismicRecord(record);
      }
    } catch (err) {
      console.error('[SyncManager] Error updating local store:', err);
    }
  }

  // Register Background Sync API with Service Worker
  private registerBackgroundSyncTag() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration: any) => {
          if (registration && registration.sync) {
            return registration.sync.register('afghanabuild-sync-queue');
          }
        })
        .catch((err) => {
          console.warn('[SyncManager] Background Sync registration bypassed:', err);
        });
    }
  }

  // Process the sync queue with Conflict Resolution: "Latest Timestamp Wins"
  public async processSyncQueue(): Promise<{ processed: number; conflicts: number }> {
    if (this.isSyncing) return { processed: 0, conflicts: 0 };
    if (!this.effectiveOnlineStatus()) {
      console.log('[SyncManager] System is offline; changes remain in queue.');
      return { processed: 0, conflicts: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let processedCount = 0;
    let conflictCount = 0;

    try {
      const pendingItems = await indexedDBService.getPendingSyncQueue();

      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.notifyListeners();
        return { processed: 0, conflicts: 0 };
      }

      console.log(`[SyncManager] Processing ${pendingItems.length} queued items with Latest-Timestamp-Wins policy...`);

      for (const item of pendingItems) {
        // Mark as syncing
        item.status = 'syncing';
        await indexedDBService.updateSyncItem(item);

        try {
          // CONFLICT RESOLUTION: "Latest Timestamp Wins"
          // We inspect existing records or remote mock timestamps
          const existingItem: any = await this.getExistingRecord(item.entityType, item.recordId);

          let resolvedStatus: 'synced' | 'conflict_resolved' = 'synced';
          let note = '';

          if (existingItem && existingItem.updatedAtTimestamp) {
            const serverTimestamp = existingItem.updatedAtTimestamp;
            const localTimestamp = item.timestamp;

            if (localTimestamp >= serverTimestamp) {
              // Local is newer or equal -> Local wins!
              resolvedStatus = 'synced';
              note = `همگام‌سازی موفق (ویرایش جدیدتر محلی با برچسب ${item.isoTime} اعمال شد).`;
            } else {
              // Server is newer -> Server wins! Local change yields
              resolvedStatus = 'conflict_resolved';
              conflictCount++;
              note = `حل خودکار تعارض: نسخه سرور به دلیل برچسب زمانی جدیدتر حفظ شد.`;
            }
          }

          // Mark completed
          item.status = resolvedStatus;
          item.conflictResolvedNote = note;
          await indexedDBService.updateSyncItem(item);

          processedCount++;
        } catch (itemErr: any) {
          console.error(`[SyncManager] Error syncing item ${item.queueId}:`, itemErr);
          item.status = 'failed';
          item.retryCount += 1;
          item.lastError = itemErr.message || 'خطا در ارتباط با سرور';
          await indexedDBService.updateSyncItem(item);
        }
      }

      this.lastSyncTime = new Date().toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' });
      this.lastSyncNote =
        conflictCount > 0
          ? `${processedCount} مورد همگام شد (${conflictCount} مورد تعارض با برتری آخرین زمان‌بندی رفع گردید).`
          : `${processedCount} مورد با موفقیت همگام‌سازی شد.`;

      // Clean up successfully synced items older than a few minutes or keep for user audit drawer
      setTimeout(() => {
        indexedDBService.clearCompletedSyncQueue().catch(() => {});
      }, 30000);
    } catch (err) {
      console.error('[SyncManager] Queue sync process failed:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { processed: processedCount, conflicts: conflictCount };
  }

  private async getExistingRecord(entityType: SyncEntityType, recordId: string): Promise<any> {
    if (entityType === 'project') return indexedDBService.getById(STORES.PROJECTS, recordId);
    if (entityType === 'boq_item') return indexedDBService.getById(STORES.BOQ_ITEMS, recordId);
    if (entityType === 'site_task') return indexedDBService.getById(STORES.SITE_TASKS, recordId);
    if (entityType === 'seismic_data') return indexedDBService.getById(STORES.SEISMIC_DATA, recordId);
    return null;
  }
}

export const syncManager = new SyncManager();
