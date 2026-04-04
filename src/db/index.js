// IndexedDB initialization and schema version management

const DB_NAME = 'hello-api-db';
const DB_VERSION = 2;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // projects
      if (!db.objectStoreNames.contains('projects')) {
        const projects = db.createObjectStore('projects', { keyPath: 'id' });
        projects.createIndex('name', 'name', { unique: false });
      }

      // collections
      if (!db.objectStoreNames.contains('collections')) {
        const collections = db.createObjectStore('collections', {
          keyPath: 'id',
        });
        collections.createIndex('projectId', 'projectId', { unique: false });
        collections.createIndex('name', 'name', { unique: false });
      }

      // requests
      if (!db.objectStoreNames.contains('requests')) {
        const requests = db.createObjectStore('requests', { keyPath: 'id' });
        requests.createIndex('collectionId', 'collectionId', { unique: false });
        requests.createIndex('name', 'name', { unique: false });
      }

      // environments
      if (!db.objectStoreNames.contains('environments')) {
        const environments = db.createObjectStore('environments', {
          keyPath: 'id',
        });
        environments.createIndex('projectId', 'projectId', { unique: false });
        environments.createIndex('name', 'name', { unique: false });
      }

      // v2: request history
      if (!db.objectStoreNames.contains('request_history')) {
        const history = db.createObjectStore('request_history', { keyPath: 'id' });
        history.createIndex('requestId', 'requestId', { unique: false });
        history.createIndex('requestedAt', 'requestedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      _db = event.target.result;
      resolve(_db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function getDB() {
  if (!_db) throw new Error('DB not initialized. Call openDB() first.');
  return _db;
}
