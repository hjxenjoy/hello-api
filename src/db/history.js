// Request history CRUD — keeps the last MAX_HISTORY entries per request

import { openDB } from './index.js';

const MAX_HISTORY = 20;

function idbRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addHistory(entry) {
  const db = await openDB();

  // Read existing entries for this request (read-only tx is fine here)
  const readTx = db.transaction('request_history', 'readonly');
  const existing = await idbRequest(
    readTx.objectStore('request_history').index('requestId').getAll(entry.requestId)
  );

  const writeTx = db.transaction('request_history', 'readwrite');
  const store = writeTx.objectStore('request_history');

  await idbRequest(store.add({ id: crypto.randomUUID(), ...entry }));

  // Prune oldest entries beyond the cap
  existing.sort((a, b) => b.requestedAt - a.requestedAt);
  const pruneList = existing.slice(MAX_HISTORY - 1);
  for (const item of pruneList) {
    await idbRequest(store.delete(item.id));
  }
}

export async function listHistory(requestId) {
  const db = await openDB();
  const tx = db.transaction('request_history', 'readonly');
  const all = await idbRequest(
    tx.objectStore('request_history').index('requestId').getAll(requestId)
  );
  return all.sort((a, b) => b.requestedAt - a.requestedAt);
}

export async function clearHistory(requestId) {
  const db = await openDB();
  const readTx = db.transaction('request_history', 'readonly');
  const all = await idbRequest(
    readTx.objectStore('request_history').index('requestId').getAll(requestId)
  );
  if (!all.length) return;
  const writeTx = db.transaction('request_history', 'readwrite');
  const store = writeTx.objectStore('request_history');
  for (const item of all) {
    await idbRequest(store.delete(item.id));
  }
}
