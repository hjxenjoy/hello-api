// <request-editor> Web Component - request builder (Method, URL, Headers, Body)

import { sendRequest } from '../core/http-client.js';
import { interpolateRequest, envToVariables } from '../core/interpolation.js';
import { updateRequest } from '../db/requests.js';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
  HEAD: '#06b6d4',
  OPTIONS: '#64748b',
};

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg-base);
      font-family: var(--font-sans);
      font-size: 13px;
    }
    .url-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .request-name {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .request-name-input {
      background: none;
      border: none;
      outline: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      flex: 1;
      min-width: 0;
    }
    .request-name-input::placeholder { color: var(--color-text-tertiary); }
    select.method {
      appearance: none;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      outline: none;
      min-width: 90px;
    }
    select.method:focus { border-color: var(--color-accent); }
    .url-input {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 13px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
    }
    .url-input::placeholder { color: var(--color-input-placeholder); font-family: var(--font-sans); }
    .url-input:focus { border-color: var(--color-input-border-focus); }
    .send-btn {
      padding: 6px 16px;
      background: var(--color-accent);
      color: #fff;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .send-btn:hover { background: var(--color-accent-hover); }
    .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .tab {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      position: relative;
    }
    .tab:hover { color: var(--color-text-primary); }
    .tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
    .tab .count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 10px;
      background: var(--color-accent-muted);
      color: var(--color-accent);
      border-radius: 9999px;
      margin-left: 4px;
    }
    .panel { display: none; flex: 1; min-height: 0; overflow-y: auto; padding: 8px; }
    .panel.active { display: flex; flex-direction: column; gap: 4px; }
    .kv-row {
      display: grid;
      grid-template-columns: 24px 1fr 1fr 28px;
      gap: 4px;
      align-items: center;
    }
    .kv-check { width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-accent); }
    .kv-input {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
      width: 100%;
    }
    .kv-input::placeholder { color: var(--color-input-placeholder); font-family: var(--font-sans); }
    .kv-input:focus { border-color: var(--color-input-border-focus); }
    .kv-del {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      cursor: pointer;
      border-radius: 3px;
      font-size: 14px;
      line-height: 1;
    }
    .kv-del:hover { color: var(--color-error); background: var(--color-error-muted); }
    .add-row-btn {
      align-self: flex-start;
      margin-top: 4px;
      padding: 4px 10px;
      font-size: 12px;
      color: var(--color-accent);
      border: 1px dashed var(--color-accent);
      border-radius: 3px;
      background: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .add-row-btn:hover { background: var(--color-accent-muted); }
    .body-type-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
      flex-shrink: 0;
    }
    .body-type-btn {
      padding: 3px 10px;
      font-size: 12px;
      border-radius: 9999px;
      border: 1px solid var(--color-border);
      background: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .body-type-btn.active {
      background: var(--color-accent-muted);
      color: var(--color-accent);
      border-color: var(--color-accent);
    }
    .body-textarea {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      resize: none;
      outline: none;
      line-height: 1.6;
      min-height: 120px;
    }
    .body-textarea:focus { border-color: var(--color-input-border-focus); }
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
  </style>
  <div class="request-name" id="name-bar" style="display:none">
    <input class="request-name-input" id="name-input" placeholder="请求名称" />
  </div>
  <div class="url-bar">
    <select class="method" id="method-select"></select>
    <input class="url-input" id="url-input" placeholder="https://api.example.com/endpoint" />
    <button class="send-btn" id="send-btn">发送</button>
  </div>
  <div class="tabs" id="tabs">
    <div class="tab active" data-tab="params">Params</div>
    <div class="tab" data-tab="headers">Headers</div>
    <div class="tab" data-tab="body">Body</div>
  </div>
  <div class="panel active" id="panel-params">
    <div id="params-list"></div>
    <button class="add-row-btn" id="add-param-btn">+ 添加参数</button>
  </div>
  <div class="panel" id="panel-headers">
    <div id="headers-list"></div>
    <button class="add-row-btn" id="add-header-btn">+ 添加 Header</button>
  </div>
  <div class="panel" id="panel-body">
    <div class="body-type-bar" id="body-type-bar">
      <button class="body-type-btn active" data-type="none">无</button>
      <button class="body-type-btn" data-type="json">JSON</button>
      <button class="body-type-btn" data-type="form-urlencoded">Form</button>
      <button class="body-type-btn" data-type="raw">Raw</button>
    </div>
    <textarea class="body-textarea" id="body-textarea" placeholder="请求体内容" style="display:none"></textarea>
  </div>
`;

class RequestEditor extends HTMLElement {
  #request = null;
  #environment = null;
  #saveTimer = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#init();
    }
  }

  #init() {
    // Method select options
    const sel = this.shadowRoot.getElementById('method-select');
    for (const m of METHODS) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      opt.style.color = METHOD_COLORS[m] ?? 'inherit';
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      sel.style.color = METHOD_COLORS[sel.value] ?? 'inherit';
      this.#scheduleSave();
    });

    // Tabs
    this.shadowRoot.getElementById('tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const name = tab.dataset.tab;
      this.shadowRoot
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
      this.shadowRoot
        .querySelectorAll('.panel')
        .forEach((p) => p.classList.toggle('active', p.id === `panel-${name}`));
    });

    // Body type
    this.shadowRoot.getElementById('body-type-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.body-type-btn');
      if (!btn) return;
      this.shadowRoot
        .querySelectorAll('.body-type-btn')
        .forEach((b) => b.classList.toggle('active', b === btn));
      const isNone = btn.dataset.type === 'none';
      this.shadowRoot.getElementById('body-textarea').style.display = isNone ? 'none' : 'flex';
      this.#scheduleSave();
    });

    // Send
    this.shadowRoot.getElementById('send-btn').addEventListener('click', () => this.#send());

    // URL auto-save
    this.shadowRoot
      .getElementById('url-input')
      .addEventListener('input', () => this.#scheduleSave());

    // Name save
    this.shadowRoot
      .getElementById('name-input')
      .addEventListener('input', () => this.#scheduleSave());

    // Body textarea
    this.shadowRoot
      .getElementById('body-textarea')
      .addEventListener('input', () => this.#scheduleSave());

    // Add param/header
    this.shadowRoot.getElementById('add-param-btn').addEventListener('click', () => {
      if (this.#request) this.#request.params.push({ key: '', value: '', enabled: true });
      this.#renderKvList('params');
      this.#scheduleSave();
    });
    this.shadowRoot.getElementById('add-header-btn').addEventListener('click', () => {
      if (this.#request) this.#request.headers.push({ key: '', value: '', enabled: true });
      this.#renderKvList('headers');
      this.#scheduleSave();
    });
  }

  loadRequest(request, environment = null) {
    this.#request = {
      ...request,
      headers: [...(request.headers ?? [])],
      params: [...(request.params ?? [])],
    };
    this.#environment = environment;

    const nameBar = this.shadowRoot.getElementById('name-bar');
    nameBar.style.display = 'flex';
    this.shadowRoot.getElementById('name-input').value = request.name ?? '';

    const sel = this.shadowRoot.getElementById('method-select');
    sel.value = request.method ?? 'GET';
    sel.style.color = METHOD_COLORS[sel.value] ?? 'inherit';

    this.shadowRoot.getElementById('url-input').value = request.url ?? '';

    this.#renderKvList('params');
    this.#renderKvList('headers');

    const bodyType = request.body?.type ?? 'none';
    this.shadowRoot.querySelectorAll('.body-type-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.type === bodyType);
    });
    const textarea = this.shadowRoot.getElementById('body-textarea');
    textarea.style.display = bodyType === 'none' ? 'none' : 'flex';
    textarea.value = request.body?.content ?? '';
  }

  setEnvironment(environment) {
    this.#environment = environment;
  }

  #renderKvList(type) {
    const list = this.shadowRoot.getElementById(`${type}-list`);
    const items = this.#request?.[type] ?? [];
    list.innerHTML = '';
    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'kv-row';
      row.innerHTML = `
        <input type="checkbox" class="kv-check" ${item.enabled !== false ? 'checked' : ''} />
        <input class="kv-input" placeholder="名称" value="${this.#esc(item.key)}" />
        <input class="kv-input" placeholder="值" value="${this.#esc(item.value ?? '')}" />
        <div class="kv-del" title="删除">×</div>
      `;
      row.querySelector('.kv-check').addEventListener('change', (e) => {
        items[i].enabled = e.target.checked;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[0].addEventListener('input', (e) => {
        items[i].key = e.target.value;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[1].addEventListener('input', (e) => {
        items[i].value = e.target.value;
        this.#scheduleSave();
      });
      row.querySelector('.kv-del').addEventListener('click', () => {
        items.splice(i, 1);
        this.#renderKvList(type);
        this.#scheduleSave();
      });
      list.appendChild(row);
    });
  }

  #buildCurrentRequest() {
    const method = this.shadowRoot.getElementById('method-select').value;
    const url = this.shadowRoot.getElementById('url-input').value;
    const name = this.shadowRoot.getElementById('name-input').value;
    const activeType =
      this.shadowRoot.querySelector('.body-type-btn.active')?.dataset.type ?? 'none';
    const bodyContent = this.shadowRoot.getElementById('body-textarea').value;
    return {
      ...this.#request,
      name,
      method,
      url,
      headers: this.#request?.headers ?? [],
      params: this.#request?.params ?? [],
      body: { type: activeType, content: bodyContent },
    };
  }

  #scheduleSave() {
    clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => this.#save(), 800);
  }

  async #save() {
    if (!this.#request?.id) return;
    const data = this.#buildCurrentRequest();
    try {
      await updateRequest(this.#request.id, data);
      this.#request = data;
    } catch {
      // ignore save errors silently
    }
  }

  async #send() {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById('send-btn');
    btn.disabled = true;
    btn.textContent = '发送中…';

    this.dispatchEvent(new CustomEvent('request-sending', { bubbles: true, composed: true }));

    const req = this.#buildCurrentRequest();
    const vars = envToVariables(this.#environment);
    const interpolated = interpolateRequest(req, vars);

    const response = await sendRequest(interpolated);

    btn.disabled = false;
    btn.textContent = '发送';

    this.dispatchEvent(
      new CustomEvent('request-response', {
        detail: response,
        bubbles: true,
        composed: true,
      })
    );
  }

  #esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }
}

customElements.define('request-editor', RequestEditor);
