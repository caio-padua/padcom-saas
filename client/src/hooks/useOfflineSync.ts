import { useState, useEffect, useCallback } from 'react';

interface QueueItem {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

const QUEUE_KEY = 'padcom-offline-queue';

function getQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(getQueue().length);
  const [syncing, setSyncing] = useState(false);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'OFFLINE_QUEUE_ADD') {
        const queue = getQueue();
        queue.push(event.data.payload);
        saveQueue(queue);
        setQueueLength(queue.length);
      }
      if (event.data?.type === 'SYNC_OFFLINE_QUEUE') {
        syncQueue();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, []);

  const syncQueue = useCallback(async () => {
    if (syncing || !navigator.onLine) return;
    
    const queue = getQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    const failed: QueueItem[] = [];

    for (const item of queue) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });
      } catch {
        failed.push(item);
      }
    }

    saveQueue(failed);
    setQueueLength(failed.length);
    setSyncing(false);
  }, [syncing]);

  const addToQueue = useCallback((item: QueueItem) => {
    const queue = getQueue();
    queue.push(item);
    saveQueue(queue);
    setQueueLength(queue.length);
  }, []);

  const clearQueue = useCallback(() => {
    saveQueue([]);
    setQueueLength(0);
  }, []);

  return {
    isOnline,
    queueLength,
    syncing,
    syncQueue,
    addToQueue,
    clearQueue,
  };
}

// Register service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err);
        });
    });
  }
}
