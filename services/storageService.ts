import { SavedRecord } from '../types';
import { addRecordToDB, getAllRecordsFromDB, deleteRecordFromDB } from './db';
import { supabase } from './supabaseClient';

/**
 * Saves a record.
 * Strategy: Offline-First.
 * 1. Save to IndexedDB immediately (synced=false).
 * 2. If online & Supabase configured, try to upload.
 * 3. If upload success, update IndexedDB (synced=true).
 */
export const saveRecord = async (record: SavedRecord): Promise<boolean> => {
  // 1. Always save locally first
  try {
    const localRecord = { ...record, synced: false };
    await addRecordToDB(localRecord);
  } catch (e) {
    console.error("Critical Error: Failed to save locally", e);
    return false;
  }

  // 2. Try Supabase if available and online
  if (supabase && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('records')
        .insert({
          id: record.id,
          user_id: record.userId,
          patient_name: record.patientName,
          result: record.result,
          image_data: record.imageData,
          category: record.category,
          created_at: new Date(record.timestamp).toISOString()
        });
      
      if (!error) {
        // Success: Mark as synced locally
        await addRecordToDB({ ...record, synced: true });
      } else {
        console.warn("Supabase insert failed, keeping local record as unsynced:", error);
      }
    } catch (e) {
      console.warn("Network error during save, keeping local record as unsynced:", e);
    }
  }

  return true;
};

/**
 * Loads history.
 * Strategy: Cache-First / Stale-While-Revalidate
 * 1. Return local records immediately.
 * 2. If online, fetch from Supabase and update local DB to ensure future offline access.
 */
export const loadHistory = async (): Promise<SavedRecord[]> => {
  // 1. Get Local Data
  let localData: SavedRecord[] = [];
  try {
    localData = await getAllRecordsFromDB();
  } catch (e) {
    console.error("Error loading local history", e);
  }

  // 2. Background Sync (Fire and Forget) if online
  if (supabase && navigator.onLine) {
    syncRemoteToLocal().catch(err => console.error("Background sync failed", err));
  }

  return localData;
};

/**
 * Fetches data from Supabase and updates local IndexedDB
 */
const syncRemoteToLocal = async () => {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return;

  // Upsert all remote records into local DB
  for (const item of data) {
    const record: SavedRecord = {
      id: item.id,
      userId: item.user_id,
      patientName: item.patient_name,
      timestamp: new Date(item.created_at).getTime(),
      result: item.result,
      imageData: item.image_data,
      category: item.category,
      synced: true // Coming from server, so it is synced
    };
    await addRecordToDB(record);
  }
};

/**
 * Triggered when app comes online.
 * Finds all records where synced=false and uploads them.
 */
export const syncPendingRecords = async (): Promise<number> => {
  if (!supabase || !navigator.onLine) return 0;

  const allRecords = await getAllRecordsFromDB();
  const pendingRecords = allRecords.filter(r => !r.synced);

  if (pendingRecords.length === 0) return 0;

  let syncedCount = 0;

  for (const record of pendingRecords) {
    try {
      // check if it exists on server first to avoid duplicates if previous attempt partially failed
      const { data: existing } = await supabase.from('records').select('id').eq('id', record.id).single();

      let error = null;
      
      if (!existing) {
        const res = await supabase.from('records').insert({
          id: record.id,
          user_id: record.userId,
          patient_name: record.patientName,
          result: record.result,
          image_data: record.imageData,
          category: record.category,
          created_at: new Date(record.timestamp).toISOString()
        });
        error = res.error;
      }

      if (!error) {
        await addRecordToDB({ ...record, synced: true });
        syncedCount++;
      }
    } catch (e) {
      console.error("Failed to sync record", record.id, e);
    }
  }

  return syncedCount;
};

export const deleteRecord = async (id: string): Promise<SavedRecord[]> => {
  // 1. Delete locally
  try {
    await deleteRecordFromDB(id);
  } catch (e) {
    console.error("Error deleting local record", e);
  }

  // 2. Delete from Supabase if online
  if (supabase && navigator.onLine) {
    try {
      await supabase.from('records').delete().eq('id', id);
    } catch (e) {
      console.error("Supabase delete error", e);
      // Note: If offline, the remote record remains. 
      // A robust system needs a 'deleted_at' flag and soft deletes to sync deletions.
      // For this implementation, we prioritize local cleanup.
    }
  }

  return await getAllRecordsFromDB();
};