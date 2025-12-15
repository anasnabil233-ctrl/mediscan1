import { SavedRecord, User, UserRole } from '../types';
import { addRecordToDB, getAllRecordsFromDB, deleteRecordFromDB, getAllUsersFromDB, saveUserToDB } from './db';
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
 * Fetches RECORDS from Supabase and updates local IndexedDB
 */
export const syncRemoteToLocal = async () => {
  if (!supabase) return;

  // 1. Sync Records
  const { data: recordsData, error: recordsError } = await supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false });

  if (!recordsError && recordsData) {
    for (const item of recordsData) {
      const record: SavedRecord = {
        id: item.id,
        userId: item.user_id,
        patientName: item.patient_name,
        timestamp: new Date(item.created_at).getTime(),
        result: item.result,
        imageData: item.image_data,
        category: item.category,
        synced: true
      };
      await addRecordToDB(record);
    }
  }

  // 2. Sync Users (Profiles)
  await syncRemoteUsersToLocal();
};

/**
 * Fetches USERS from Supabase 'profiles' table and updates local IndexedDB
 */
export const syncRemoteUsersToLocal = async () => {
    if (!supabase) return;

    const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

    if (!usersError && usersData) {
        for (const item of usersData) {
            // Map Supabase profile to Local User
            const user: User = {
                id: item.id,
                name: item.name || 'Unknown',
                email: item.email || '',
                role: item.role as UserRole,
                status: 'Active',
                phoneNumber: item.phone_number,
                assignedDoctorId: item.assigned_doctor_id,
                password: item.password, // Sync password for custom auth compatibility
                permissions: item.permissions, // Sync permissions array
                lastLogin: Date.now() 
            };
            await saveUserToDB(user);
        }
        console.log(`Synced ${usersData.length} users from remote.`);
    }
};

/**
 * Pushes Local Users to Supabase 'profiles'
 */
export const syncLocalUsersToRemote = async () => {
    if (!supabase || !navigator.onLine) return;

    try {
        const localUsers = await getAllUsersFromDB();
        for (const user of localUsers) {
            // Upsert user profile
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone_number: user.phoneNumber,
                assigned_doctor_id: user.assignedDoctorId,
                password: user.password, // Sync password
                permissions: user.permissions
            });
            
            if (error) {
                console.error(`Error syncing user ${user.name}:`, JSON.stringify(error, null, 2));
            }
        }
    } catch (e) {
        console.error("Error in syncLocalUsersToRemote:", e);
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

/**
 * Performs a full two-way sync (Push pending, then Pull latest).
 * Should be called on app startup.
 */
export const syncAllData = async (): Promise<{ pulled: boolean; pushedCount: number }> => {
    if (!supabase || !navigator.onLine) return { pulled: false, pushedCount: 0 };
    
    console.log("Creating connection to database and syncing ALL data...");
    
    // 1. Push Local Records -> Remote
    const pushedCount = await syncPendingRecords();
    
    // 2. Push Local Users -> Remote
    await syncLocalUsersToRemote();

    // 3. Pull Remote Records & Users -> Local
    try {
        await syncRemoteToLocal(); // This now calls syncRemoteUsersToLocal internally too
        return { pulled: true, pushedCount };
    } catch (e) {
        console.error("Sync pull failed", e);
        return { pulled: false, pushedCount };
    }
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