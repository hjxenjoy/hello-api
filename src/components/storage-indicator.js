// <storage-indicator> Web Component - real-time IndexedDB storage usage display

import { getStorageStats, formatBytes } from '../core/storage-stats.js';
import { showForm } from '../core/dialog.js';

const WARN_KEY = 'storage-warn-bytes';
const DANGER_KEY = 'storage-danger-bytes';
const DEFAULT_WARN = 100 * 1024 * 1024; // 100 MB
const DEFAULT_DANGER = 1024 * 1024 * 1024; // 1 GB

function getThresholds() {
  const w = parseInt(localStorage.getItem(WARN_KEY), 10);
  const d = parseInt(localStorage.getItem(DANGER_KEY), 10);
  return {
    warn: w > 0 ? w : DEFAULT_WARN,
    danger: d > 0 ? d : DEFAULT_DANGER,
  };
}

const ICON_SETTINGS = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="2"/><path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.6 2.6l1.1 1.1M8.3 8.3l1.1 1.1M8.3 3.7l1.1-1.1M2.6 9.4l1.1-1.1"/></svg>`;

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px 5px 12px;
      font-size: 11px;
      color: var(--color-text-tertiary);
      flex: 1;
      min-width: 0;
    }
    .bar-wrap {
      flex: 1;
      height: 3px;
      background: var(--color-border);
      border-radius: 9999px;
      overflow: hidden;
      min-width: 0;
    }
    .bar {
      height: 100%;
      background: var(--color-accent);
      border-radius: 9999px;
      transition: width 0.4s ease, background 0.3s ease;
      max-width: 100%;
    }
    .bar.warn { background: var(--color-warning); }
    .bar.danger { background: var(--color-error); }
    .label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex-shrink: 1;
    }
    .settings-btn {
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      color: var(--color-text-tertiary);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
      background: none;
      border: none;
    }
    .settings-btn:hover {
      color: var(--color-text-secondary);
      background: var(--color-surface-3);
    }
  </style>
  <span class="label" id="label">--</span>
  <div class="bar-wrap">
    <div class="bar" id="bar" style="width:0%"></div>
  </div>
  <button class="settings-btn" id="settings-btn" title="配置存储预警阈值">
    ${ICON_SETTINGS}
  </button>
`;

class StorageIndicator extends HTMLElement {
  #interval = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.shadowRoot
        .getElementById('settings-btn')
        .addEventListener('click', () => this.#configure());
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
      bar.style.width = '0%';
      return;
    }

    const { warn, danger } = getThresholds();
    label.textContent = `${stats.usageFormatted} / ${stats.quotaFormatted}`;

    // Width: percentage of quota for visual display
    bar.style.width = `${Math.min(stats.percent, 100)}%`;

    // Color: based on absolute bytes vs user thresholds
    if (stats.usage >= danger) {
      bar.className = 'bar danger';
    } else if (stats.usage >= warn) {
      bar.className = 'bar warn';
    } else {
      bar.className = 'bar';
    }
  }

  async #configure() {
    const { warn, danger } = getThresholds();

    const result = await showForm(
      '存储预警阈值',
      [
        {
          id: 'warn',
          label: '黄色预警（MB）',
          placeholder: '例如 100',
          defaultValue: String(Math.round(warn / 1024 / 1024)),
          type: 'number',
        },
        {
          id: 'danger',
          label: '红色警告（MB）',
          placeholder: '例如 1024',
          defaultValue: String(Math.round(danger / 1024 / 1024)),
          type: 'number',
        },
      ],
      { confirmLabel: '保存' }
    );

    if (!result) return;

    const warnBytes = parseFloat(result.warn) * 1024 * 1024;
    const dangerBytes = parseFloat(result.danger) * 1024 * 1024;

    if (warnBytes > 0 && dangerBytes > 0 && warnBytes < dangerBytes) {
      localStorage.setItem(WARN_KEY, String(Math.round(warnBytes)));
      localStorage.setItem(DANGER_KEY, String(Math.round(dangerBytes)));
      this.#refresh();
    }
  }
}

customElements.define('storage-indicator', StorageIndicator);
