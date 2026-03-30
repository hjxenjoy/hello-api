// Requests CRUD

import { openDB } from './index.js';

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function now() {
  return new Date().toISOString();
}

export async function createRequest(data) {
  const db = await openDB();
  const req = {
    id: crypto.randomUUID(),
    collectionId: data.collectionId,
    name: data.name ?? 'Untitled Request',
    method: data.method ?? 'GET',
    url: data.url ?? '',
    headers: data.headers ?? [],
    params: data.params ?? [],
    body: data.body ?? { type: 'none', content: '' },
    description: data.description ?? '',
    order: data.order ?? 0,
    createdAt: now(),
    updatedAt: now(),
  };
  const tx = db.transaction('requests', 'readwrite');
  await idbRequest(tx.objectStore('requests').add(req));
  return req;
}

export async function getRequest(id) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readonly');
  return idbRequest(tx.objectStore('requests').get(id));
}

export async function listRequests(collectionId) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readonly');
  const index = tx.objectStore('requests').index('collectionId');
  const all = await idbRequest(index.getAll(collectionId));
  return all.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function updateRequest(id, data) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');
  const existing = await idbRequest(store.get(id));
  if (!existing) throw new Error(`Request ${id} not found`);
  const updated = { ...existing, ...data, id, updatedAt: now() };
  await idbRequest(store.put(updated));
  return updated;
}

export async function deleteRequest(id) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readwrite');
  await idbRequest(tx.objectStore('requests').delete(id));
}

export async function saveRequestResponse(id, response) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');
  const existing = await idbRequest(store.get(id));
  if (!existing) return;
  existing.lastResponse = response;
  await idbRequest(store.put(existing));
}

export async function duplicateRequest(id) {
  const db = await openDB();
  const tx = db.transaction('requests', 'readonly');
  const original = await idbRequest(tx.objectStore('requests').get(id));
  if (!original) throw new Error(`Request ${id} not found`);

  const copy = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    createdAt: now(),
    updatedAt: now(),
  };

  const tx2 = db.transaction('requests', 'readwrite');
  await idbRequest(tx2.objectStore('requests').add(copy));
  return copy;
}
