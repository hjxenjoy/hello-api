// Application entry point

import { openDB } from './db/index.js';
import './components/app-shell.js';

async function init() {
  await openDB();
}

init().catch((err) => {
  console.error('Failed to initialize Hello API:', err);
});
