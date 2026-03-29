// Projects & collections CRUD

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

// ── Projects ──

export async function createProject(data) {
  const db = await openDB();
  const project = {
    id: crypto.randomUUID(),
    name: data.name ?? 'Untitled Project',
    description: data.description ?? '',
    createdAt: now(),
    updatedAt: now(),
  };
  const tx = db.transaction('projects', 'readwrite');
  await idbRequest(tx.objectStore('projects').add(project));
  return project;
}

export async function getProject(id) {
  const db = await openDB();
  const tx = db.transaction('projects', 'readonly');
  return idbRequest(tx.objectStore('projects').get(id));
}

export async function listProjects() {
  const db = await openDB();
  const tx = db.transaction('projects', 'readonly');
  const all = await idbRequest(tx.objectStore('projects').getAll());
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateProject(id, data) {
  const db = await openDB();
  const tx = db.transaction('projects', 'readwrite');
  const store = tx.objectStore('projects');
  const existing = await idbRequest(store.get(id));
  if (!existing) throw new Error(`Project ${id} not found`);
  const updated = { ...existing, ...data, id, updatedAt: now() };
  await idbRequest(store.put(updated));
  return updated;
}

export async function deleteProject(id) {
  const db = await openDB();

  // cascade: delete all collections and their requests
  const collections = await listCollections(id);
  for (const col of collections) {
    await deleteCollection(col.id);
  }

  const tx = db.transaction('projects', 'readwrite');
  await idbRequest(tx.objectStore('projects').delete(id));
}

// ── Collections ──

export async function createCollection(data) {
  const db = await openDB();
  const collection = {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    name: data.name ?? 'Untitled Collection',
    description: data.description ?? '',
    order: data.order ?? 0,
    createdAt: now(),
    updatedAt: now(),
  };
  const tx = db.transaction('collections', 'readwrite');
  await idbRequest(tx.objectStore('collections').add(collection));
  return collection;
}

export async function getCollection(id) {
  const db = await openDB();
  const tx = db.transaction('collections', 'readonly');
  return idbRequest(tx.objectStore('collections').get(id));
}

export async function listCollections(projectId) {
  const db = await openDB();
  const tx = db.transaction('collections', 'readonly');
  const index = tx.objectStore('collections').index('projectId');
  const all = await idbRequest(index.getAll(projectId));
  return all.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function updateCollection(id, data) {
  const db = await openDB();
  const tx = db.transaction('collections', 'readwrite');
  const store = tx.objectStore('collections');
  const existing = await idbRequest(store.get(id));
  if (!existing) throw new Error(`Collection ${id} not found`);
  const updated = { ...existing, ...data, id, updatedAt: now() };
  await idbRequest(store.put(updated));
  return updated;
}

export async function deleteCollection(id) {
  const db = await openDB();

  // cascade: delete all requests in this collection
  const { listRequests, deleteRequest } = await import('./requests.js');
  const requests = await listRequests(id);
  for (const req of requests) {
    await deleteRequest(req.id);
  }

  const tx = db.transaction('collections', 'readwrite');
  await idbRequest(tx.objectStore('collections').delete(id));
}
