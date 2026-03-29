// Custom dialog helpers replacing native prompt() / confirm()

const STYLE_ID = 'app-dialog-styles';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    dialog.app-dialog {
      background: var(--color-surface-2);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-strong);
      border-radius: 10px;
      padding: 0;
      box-shadow: var(--shadow-lg);
      min-width: 320px;
      max-width: 480px;
      width: min(90vw, 440px);
      font-family: var(--font-sans);
      font-size: 13px;
      outline: none;
      animation: app-dialog-in 0.15s ease;
    }
    @keyframes app-dialog-in {
      from { opacity: 0; transform: scale(0.96) translateY(-6px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    dialog.app-dialog::backdrop {
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);
      animation: app-dialog-backdrop-in 0.15s ease;
    }
    @keyframes app-dialog-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .app-dialog__body {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 20px 20px 16px;
    }
    .app-dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .app-dialog__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.3;
    }
    .app-dialog__desc {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    .app-dialog__input {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 13px;
      color: var(--color-text-primary);
      outline: none;
      width: 100%;
      font-family: var(--font-sans);
      transition: border-color 0.15s;
    }
    .app-dialog__input:focus {
      border-color: var(--color-input-border-focus);
    }
    .app-dialog__input::placeholder {
      color: var(--color-input-placeholder);
    }
    .app-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 2px;
    }
    .app-dialog__btn {
      padding: 6px 16px;
      border-radius: 5px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--color-border);
      background: var(--color-surface-3);
      color: var(--color-text-secondary);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      font-family: var(--font-sans);
      line-height: 1.4;
    }
    .app-dialog__btn:hover {
      background: var(--color-bg-subtle);
      color: var(--color-text-primary);
    }
    .app-dialog__btn:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    .app-dialog__btn--primary {
      background: var(--color-accent);
      color: #fff;
      border-color: var(--color-accent);
    }
    .app-dialog__btn--primary:hover {
      background: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }
    .app-dialog__btn--danger {
      background: var(--color-error);
      color: #fff;
      border-color: var(--color-error);
    }
    .app-dialog__btn--danger:hover {
      background: #dc2626;
      border-color: #dc2626;
    }
  `;
  document.head.appendChild(style);
}

let _el = null;

function getEl() {
  ensureStyles();
  if (!_el || !_el.isConnected) {
    _el = document.createElement('dialog');
    _el.className = 'app-dialog';
    document.body.appendChild(_el);
  }
  return _el;
}

/**
 * Show a prompt dialog. Returns the trimmed input string, or null if cancelled.
 * @param {string} title
 * @param {{ placeholder?: string, defaultValue?: string, confirmLabel?: string }} [opts]
 * @returns {Promise<string|null>}
 */
export function showPrompt(
  title,
  { placeholder = '', defaultValue = '', confirmLabel = '确认' } = {}
) {
  return new Promise((resolve) => {
    const el = getEl();

    el.innerHTML = `
      <form class="app-dialog__body" method="dialog">
        <div class="app-dialog__header">
          <span class="app-dialog__title">${esc(title)}</span>
        </div>
        <input
          class="app-dialog__input"
          id="app-dialog-input"
          type="text"
          placeholder="${esc(placeholder)}"
          value="${esc(defaultValue)}"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="app-dialog__actions">
          <button class="app-dialog__btn" id="app-dialog-cancel" type="button">取消</button>
          <button class="app-dialog__btn app-dialog__btn--primary" id="app-dialog-confirm" type="submit">
            ${esc(confirmLabel)}
          </button>
        </div>
      </form>
    `;

    const input = el.querySelector('#app-dialog-input');
    let result = null;

    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      result = input.value.trim() || null;
      el.close();
    });

    el.querySelector('#app-dialog-cancel').addEventListener('click', () => {
      el.close();
    });

    el.addEventListener('close', () => resolve(result), { once: true });

    el.showModal();
    input.focus();
    if (defaultValue) input.select();
  });
}

/**
 * Show a confirm dialog. Returns true if confirmed, false otherwise.
 * @param {string} message
 * @param {{ confirmLabel?: string, danger?: boolean, title?: string }} [opts]
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, { confirmLabel = '确认', danger = false, title = '' } = {}) {
  return new Promise((resolve) => {
    const el = getEl();

    el.innerHTML = `
      <div class="app-dialog__body">
        ${title ? `<div class="app-dialog__header"><span class="app-dialog__title">${esc(title)}</span></div>` : ''}
        <div class="app-dialog__desc">${esc(message)}</div>
        <div class="app-dialog__actions">
          <button class="app-dialog__btn" id="app-dialog-cancel">取消</button>
          <button class="app-dialog__btn ${danger ? 'app-dialog__btn--danger' : 'app-dialog__btn--primary'}" id="app-dialog-confirm">
            ${esc(confirmLabel)}
          </button>
        </div>
      </div>
    `;

    let result = false;

    el.querySelector('#app-dialog-confirm').addEventListener('click', () => {
      result = true;
      el.close();
    });

    el.querySelector('#app-dialog-cancel').addEventListener('click', () => {
      el.close();
    });

    el.addEventListener('close', () => resolve(result), { once: true });

    el.showModal();
    el.querySelector('#app-dialog-confirm').focus();
  });
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
