import { SavedRecord } from '../types';
import { addRecordToDB, getAllRecordsFromDB, deleteRecordFromDB } from './db';
import { supabase } from './supabaseClient';

export const saveRecord = async (record: SavedRecord): Promise<boolean> => {
  // 1. Try Supabase
  if (supabase) {
    try {
      // NOTE: For production, you should upload `record.imageData` (base64) to Supabase Storage Bucket first,
      // then get the public URL and save that to the DB.
      // For this demo, we are saving the Base64 text directly to the JSONB or Text column, 
      // which is okay for small files but not recommended for large scale.
      
      const { error } = await supabase
        .from('records')
        .insert({
          id: record.id,
          user_id: record.userId,
          patient_name: record.patientName,
          result: record.result,
          image_data: record.imageData, // Storing base64 string directly
          category: record.category,
          created_at: new Date(record.timestamp).toISOString()
        });
      
      if (error) {
        console.error("Supabase Save Error:", error);
        throw error;
      }
      return true;
    } catch (e) {
      console.warn("Falling back to local DB due to error:", e);
    }
  }

  // 2. Fallback to IndexedDB
  try {
    await addRecordToDB(record);
    return true;
  } catch (e) {
    console.error("Storage error (IndexedDB)", e);
    return false;
  }
};

export const loadHistory = async (): Promise<SavedRecord[]> => {
  // 1. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Map DB structure back to app structure
        return data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          patientName: item.patient_name,
          timestamp: new Date(item.created_at).getTime(),
          result: item.result,
          imageData: item.image_data,
          category: item.category
        }));
      }
    } catch (e) {
      console.warn("Supabase Load Error, checking local...", e);
    }
  }

  // 2. Fallback to IndexedDB
  try {
    return await getAllRecordsFromDB();
  } catch (e) {
    console.error("Error loading history", e);
    return [];
  }
};

export const deleteRecord = async (id: string): Promise<SavedRecord[]> => {
  // 1. Try Supabase
  if (supabase) {
    try {
      await supabase.from('records').delete().eq('id', id);
      return await loadHistory();
    } catch (e) {
      console.error("Supabase delete error", e);
    }
  }

  // 2. Fallback
  try {
    await deleteRecordFromDB(id);
    return await getAllRecordsFromDB(); // This only returns local records, might be inconsistent if mixed
  } catch (e) {
    console.error("Error deleting record", e);
    return [];
  }
};