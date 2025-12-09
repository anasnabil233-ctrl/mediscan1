import { SavedRecord } from '../types';
import { addRecordToDB, getAllRecordsFromDB, deleteRecordFromDB } from './db';

// We now use IndexedDB for heavy records (images), but we can keep using localStorage for small things if needed.
// This adapter ensures the App component works with the async nature of IndexedDB.

export const saveRecord = async (record: SavedRecord): Promise<boolean> => {
  try {
    await addRecordToDB(record);
    return true;
  } catch (e) {
    console.error("Storage error (IndexedDB)", e);
    return false;
  }
};

export const loadHistory = async (): Promise<SavedRecord[]> => {
  try {
    return await getAllRecordsFromDB();
  } catch (e) {
    console.error("Error loading history", e);
    return [];
  }
};

export const deleteRecord = async (id: string): Promise<SavedRecord[]> => {
  try {
    await deleteRecordFromDB(id);
    return await getAllRecordsFromDB();
  } catch (e) {
    console.error("Error deleting record", e);
    return [];
  }
};
