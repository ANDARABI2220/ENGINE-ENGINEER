import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncManager, SyncState } from '../services/syncManager';
import {
  indexedDBService,
  SyncQueueItem,
  SyncEntityType,
  SyncAction
} from '../services/indexedDBService';

interface SyncContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  queueCount: number;
  queuedItems: SyncQueueItem[];
  lastSyncTime: string | null;
  lastSyncNote: string | null;
  triggerSync: () => Promise<void>;
  toggleSimulatedOffline: () => void;
  enqueueChange: (
    entityType: SyncEntityType,
    action: SyncAction,
    recordId: string,
    payload: any
  ) => Promise<SyncQueueItem>;
  refreshQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncState, setSyncState] = useState<SyncState>(syncManager.getState());
  const [queueCount, setQueueCount] = useState<number>(0);
  const [queuedItems, setQueuedItems] = useState<SyncQueueItem[]>([]);

  const refreshQueue = useCallback(async () => {
    try {
      const allItems = await indexedDBService.getAllSyncQueue();
      // sort by timestamp descending
      allItems.sort((a, b) => b.timestamp - a.timestamp);
      setQueuedItems(allItems);
      const pendingCount = allItems.filter((i) => i.status === 'pending' || i.status === 'syncing').length;
      setQueueCount(pendingCount);
    } catch (err) {
      console.warn('[SyncContext] Failed to load queue:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueue();

    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
      refreshQueue();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshQueue]);

  const triggerSync = async () => {
    await syncManager.processSyncQueue();
    await refreshQueue();
  };

  const toggleSimulatedOffline = () => {
    syncManager.toggleSimulatedOffline();
  };

  const enqueueChange = async (
    entityType: SyncEntityType,
    action: SyncAction,
    recordId: string,
    payload: any
  ): Promise<SyncQueueItem> => {
    const item = await syncManager.enqueueChange(entityType, action, recordId, payload);
    await refreshQueue();
    return item;
  };

  return (
    <SyncContext.Provider
      value={{
        isOnline: syncState.isOnline,
        isSimulatedOffline: syncState.isSimulatedOffline,
        isSyncing: syncState.isSyncing,
        queueCount,
        queuedItems,
        lastSyncTime: syncState.lastSyncTime,
        lastSyncNote: syncState.lastSyncNote,
        triggerSync,
        toggleSimulatedOffline,
        enqueueChange,
        refreshQueue
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncContext = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};
