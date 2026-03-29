// Environment variables CRUD

import { getDB } from './index.js';

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function now() {
  return new Date().toISOString();
}

export async function createEnvironment(data) {
  const db = getDB();
  const env = {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    name: data.name ?? 'Untitled Environment',
    variables: data.variables ?? [],
    isActive: data.isActive ?? false,
    createdAt: now(),
    updatedAt: now(),
  };
  const tx = db.transaction('environments', 'readwrite');
  await idbRequest(tx.objectStore('environments').add(env));
  return env;
}

export async function getEnvironment(id) {
  const db = getDB();
  const tx = db.transaction('environments', 'readonly');
  return idbRequest(tx.objectStore('environments').get(id));
}

export async function listEnvironments(projectId) {
  const db = getDB();
  const tx = db.transaction('environments', 'readonly');
  const index = tx.objectStore('environments').index('projectId');
  const all = await idbRequest(index.getAll(projectId));
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateEnvironment(id, data) {
  const db = getDB();
  const tx = db.transaction('environments', 'readwrite');
  const store = tx.objectStore('environments');
  const existing = await idbRequest(store.get(id));
  if (!existing) throw new Error(`Environment ${id} not found`);
  const updated = { ...existing, ...data, id, updatedAt: now() };
  await idbRequest(store.put(updated));
  return updated;
}

export async function deleteEnvironment(id) {
  const db = getDB();
  const tx = db.transaction('environments', 'readwrite');
  await idbRequest(tx.objectStore('environments').delete(id));
}

export async function setActiveEnvironment(projectId, envId) {
  const envs = await listEnvironments(projectId);
  const db = getDB();
  const tx = db.transaction('environments', 'readwrite');
  const store = tx.objectStore('environments');

  for (const env of envs) {
    const updated = { ...env, isActive: env.id === envId, updatedAt: now() };
    store.put(updated);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getActiveEnvironment(projectId) {
  const envs = await listEnvironments(projectId);
  return envs.find((e) => e.isActive) ?? null;
}
