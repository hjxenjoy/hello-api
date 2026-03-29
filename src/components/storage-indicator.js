// <storage-indicator> Web Component - real-time IndexedDB storage usage display

import { getStorageStats } from '../core/storage-stats.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 11px;
      color: var(--color-text-tertiary);
    }
    .bar-wrap {
      flex: 1;
      height: 3px;
      background: var(--color-border);
      border-radius: 9999px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      background: var(--color-accent);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .bar.warn { background: var(--color-warning); }
    .bar.danger { background: var(--color-error); }
    .label { white-space: nowrap; }
  </style>
  <span class="label" id="label">--</span>
  <div class="bar-wrap">
    <div class="bar" id="bar" style="width:0%"></div>
  </div>
`;

class StorageIndicator extends HTMLElement {
  #interval = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    this.#refresh();
    this.#interval = setInterval(() => this.#refresh(), 30_000);
  }

  disconnectedCallback() {
    clearInterval(this.#interval);
  }

  async #refresh() {
    const stats = await getStorageStats();
    const label = this.shadowRoot.getElementById('label');
    const bar = this.shadowRoot.getElementById('bar');

    if (stats.usageFormatted === 'N/A') {
      label.textContent = '存储: N/A';
      return;
    }

    label.textContent = `${stats.usageFormatted} / ${stats.quotaFormatted}`;
    bar.style.width = `${stats.percent}%`;
    bar.className = `bar${stats.percent >= 90 ? ' danger' : stats.percent >= 70 ? ' warn' : ''}`;
  }
}

customElements.define('storage-indicator', StorageIndicator);
