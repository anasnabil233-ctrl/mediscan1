import { SavedRecord, User } from '../types';

const DB_NAME = 'MediScanDB';
const DB_VERSION = 3; // Bumped to 3 to ensure schema upgrade triggers
const STORE_RECORDS = 'records';
const STORE_USERS = 'users';

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error: ", request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("Database upgrade blocked. Please close other tabs of this app.");
      alert("يرجى إغلاق علامات التبويب الأخرى للتطبيق لتحديث قاعدة البيانات.");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log("Upgrading Database to version", DB_VERSION);
      const db = request.result;
      
      // Create Records Store
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
      }

      // Create Users Store
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Add or Update a record in the database (Upsert)
 */
export const addRecordToDB = async (record: SavedRecord): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RECORDS], 'readwrite');
      const store = transaction.objectStore(STORE_RECORDS);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error adding record to DB:", e);
    throw e;
  }
};

/**
 * Get all records from the database
 */
export const getAllRecordsFromDB = async (): Promise<SavedRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RECORDS], 'readonly');
      const store = transaction.objectStore(STORE_RECORDS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as SavedRecord[];
        // Sort by timestamp desc (newest first)
        results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error getting records from DB:", e);
    return [];
  }
};

/**
 * Delete a record from the database
 */
export const deleteRecordFromDB = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RECORDS], 'readwrite');
      const store = transaction.objectStore(STORE_RECORDS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error deleting record from DB:", e);
    throw e;
  }
};

// --- USER DATABASE OPERATIONS ---

/**
 * Add or Update a USER in the database
 */
export const saveUserToDB = async (user: User): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_USERS], 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.put(user);

      request.onsuccess = () => {
          console.log(`User ${user.name} saved to DB.`);
          resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error saving user to DB:", e);
  }
};

/**
 * Get all USERS from the database
 */
export const getAllUsersFromDB = async (): Promise<User[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_USERS], 'readonly');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as User[];
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error getting users from DB:", e);
    return [];
  }
};