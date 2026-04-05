import { openDB, IDBPDatabase } from 'idb';
import { Shift, Receipt } from '@/types';

const DB_NAME = 'VeroFlowOffline';
const DB_VERSION = 1;

export interface OfflineDB extends IDBPDatabase {
  shifts: Shift;
  receipts: Receipt;
  pendingSync: {
    id?: string;
    type: 'shift' | 'receipt';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
  };
}

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('shifts')) {
        db.createObjectStore('shifts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('receipts')) {
        db.createObjectStore('receipts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

function createOfflineId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveShiftOffline(shift: Shift) {
  const db = await initDB();
  const record = {
    ...shift,
    id: shift.id || createOfflineId('shift')
  };

  await db.put('shifts', record);
  await db.add('pendingSync', {
    type: 'shift',
    action: 'create',
    data: record,
    timestamp: new Date().toISOString()
  });
}

export async function saveReceiptOffline(receipt: Receipt) {
  const db = await initDB();
  const record = {
    ...receipt,
    id: receipt.id || createOfflineId('receipt')
  };

  await db.put('receipts', record);
  await db.add('pendingSync', {
    type: 'receipt',
    action: 'create',
    data: record,
    timestamp: new Date().toISOString()
  });
}

export async function getPendingSync() {
  const db = await initDB();
  return db.getAll('pendingSync');
}

export async function clearPendingSync(id: number) {
  const db = await initDB();
  await db.delete('pendingSync', id);
}

export async function clearOfflineStorage() {
  const db = await initDB();
  await Promise.all([
    db.clear('shifts'),
    db.clear('receipts'),
    db.clear('pendingSync'),
  ]);
}

export async function getOfflineShifts() {
  const db = await initDB();
  return db.getAll('shifts');
}

export async function getOfflineReceipts() {
  const db = await initDB();
  return db.getAll('receipts');
}
