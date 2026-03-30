// <request-editor> Web Component - request builder (Method, URL, Headers, Body)

import { sendRequest } from '../core/http-client.js';
import { interpolateRequest, envToVariables } from '../core/interpolation.js';
import { updateRequest, saveRequestResponse } from '../db/requests.js';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const RAW_CONTENT_TYPES = [
  'text/plain',
  'application/json',
  'application/xml',
  'text/html',
  'application/javascript',
  'text/css',
];

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
    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .kv-row {
      display: grid;
      grid-template-columns: 24px 1fr 1fr 28px;
      gap: 4px;
      align-items: center;
      min-width: 0;
    }
    .kv-check { width: 14px; height: 14px; cursor: pointer; accent-color: var(--color-accent); flex-shrink: 0; }
    .kv-input {
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
      min-width: 0;
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
    .body-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
    }
    .body-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
    .raw-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .raw-bar-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    select.raw-type {
      flex: 1;
      border: 1px solid var(--color-input-border);
      background: var(--color-input-bg);
      border-radius: 3px;
      padding: 4px 6px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--color-text-primary);
      outline: none;
      cursor: pointer;
    }
    select.raw-type:focus { border-color: var(--color-input-border-focus); }
    .json-toolbar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex-shrink: 0;
    }
    .json-format-btn {
      padding: 2px 8px;
      font-size: 11px;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      background: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .json-format-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-surface-3);
      border-color: var(--color-border-strong);
    }
    .cm-container {
      flex: 1;
      min-height: 120px;
      border: 1px solid var(--color-input-border);
      border-radius: 4px;
      overflow: hidden;
      font-size: 12px;
    }
    .cm-container:focus-within {
      border-color: var(--color-input-border-focus);
    }
    .cm-container .cm-editor {
      height: 100%;
    }
    .cm-container .cm-scroller {
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
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
    <div class="kv-list" id="params-list"></div>
    <button class="add-row-btn" id="add-param-btn">+ 添加参数</button>
  </div>
  <div class="panel" id="panel-headers">
    <div class="kv-list" id="headers-list"></div>
    <button class="add-row-btn" id="add-header-btn">+ 添加 Header</button>
  </div>
  <div class="panel" id="panel-body">
    <div class="body-type-bar" id="body-type-bar">
      <button class="body-type-btn active" data-type="none">无</button>
      <button class="body-type-btn" data-type="json">JSON</button>
      <button class="body-type-btn" data-type="form-urlencoded">Form</button>
      <button class="body-type-btn" data-type="raw">Raw</button>
    </div>
    <div class="body-area" id="body-area"></div>
  </div>
`;

class RequestEditor extends HTMLElement {
  #request = null;
  #environment = null;
  #saveTimer = null;
  #cmEditor = null;

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
      // Render body area only when panel is visible (CodeMirror needs a sized container)
      if (name === 'body' && this.#request) this.#renderBodyArea();
    });

    // Body type switching
    this.shadowRoot.getElementById('body-type-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.body-type-btn');
      if (!btn) return;
      const type = btn.dataset.type;
      this.shadowRoot
        .querySelectorAll('.body-type-btn')
        .forEach((b) => b.classList.toggle('active', b === btn));

      if (this.#request) {
        // Capture current body values before switching
        const prevType = this.#request.body?.type;
        if (prevType === 'json' && this.#cmEditor) {
          this.#request.body.content = this.#cmEditor.state.doc.toString();
        } else if (prevType === 'raw') {
          const ta = this.shadowRoot.getElementById('body-textarea');
          if (ta) this.#request.body.content = ta.value;
          const rs = this.shadowRoot.getElementById('raw-type-select');
          if (rs) this.#request.body.contentType = rs.value;
        }
        this.#request.body.type = type;
        if (type === 'form-urlencoded' && !Array.isArray(this.#request.body.pairs)) {
          this.#request.body.pairs = [];
        }
      }

      this.#renderBodyArea();
      this.#scheduleSave();
    });

    // Send
    this.shadowRoot.getElementById('send-btn').addEventListener('click', () => this.#send());

    // Keyboard shortcut: ⌘+Enter / Ctrl+Enter
    this.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.#send();
      }
    });

    // URL auto-save
    this.shadowRoot
      .getElementById('url-input')
      .addEventListener('input', () => this.#scheduleSave());

    // Name save
    this.shadowRoot
      .getElementById('name-input')
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
      body: {
        type: request.body?.type ?? 'none',
        content: request.body?.content ?? '',
        contentType: request.body?.contentType ?? 'text/plain',
        pairs: Array.isArray(request.body?.pairs) ? [...request.body.pairs] : [],
      },
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

    // Destroy any existing editor — new request content must be loaded fresh
    if (this.#cmEditor) {
      this.#cmEditor.destroy();
      this.#cmEditor = null;
    }

    const bodyType = this.#request.body.type;
    this.shadowRoot.querySelectorAll('.body-type-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.type === bodyType);
    });
    // Only render body area when the panel is already visible
    if (this.shadowRoot.getElementById('panel-body')?.classList.contains('active')) {
      this.#renderBodyArea();
    }
  }

  setEnvironment(environment) {
    this.#environment = environment;
  }

  #renderBodyArea() {
    const type = this.#request?.body?.type ?? 'none';

    // Reuse existing json editor when switching back to the Body tab
    if (type === 'json' && this.#cmEditor) return;

    // Destroy any existing CodeMirror instance before clearing the DOM
    if (this.#cmEditor) {
      this.#cmEditor.destroy();
      this.#cmEditor = null;
    }

    const area = this.shadowRoot.getElementById('body-area');
    area.innerHTML = '';

    if (type === 'none') {
      const el = document.createElement('div');
      el.className = 'body-empty';
      el.textContent = '该请求无 Body';
      area.appendChild(el);
      return;
    }

    if (type === 'form-urlencoded') {
      this.#renderFormPairs();
      return;
    }

    if (type === 'json') {
      const toolbar = document.createElement('div');
      toolbar.className = 'json-toolbar';
      const fmtBtn = document.createElement('button');
      fmtBtn.className = 'json-format-btn';
      fmtBtn.textContent = '格式化';
      fmtBtn.addEventListener('click', () => this.#formatJson());
      toolbar.appendChild(fmtBtn);
      area.appendChild(toolbar);

      const container = document.createElement('div');
      container.className = 'cm-container';
      area.appendChild(container);
      this.#createJsonEditor(container, this.#request.body.content ?? '');
      return;
    }

    if (type === 'raw') {
      const rawBar = document.createElement('div');
      rawBar.className = 'raw-bar';

      const label = document.createElement('span');
      label.className = 'raw-bar-label';
      label.textContent = 'Content-Type';

      const sel = document.createElement('select');
      sel.className = 'raw-type';
      sel.id = 'raw-type-select';
      for (const ct of RAW_CONTENT_TYPES) {
        const opt = document.createElement('option');
        opt.value = ct;
        opt.textContent = ct;
        if (ct === (this.#request.body.contentType ?? 'text/plain')) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => this.#scheduleSave());

      rawBar.appendChild(label);
      rawBar.appendChild(sel);
      area.appendChild(rawBar);
    }

    // json or raw: textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'body-textarea';
    textarea.id = 'body-textarea';
    textarea.placeholder = type === 'json' ? 'JSON 内容' : '请求体内容';
    textarea.value = this.#request.body.content ?? '';
    textarea.addEventListener('input', () => this.#scheduleSave());
    area.appendChild(textarea);
  }

  async #createJsonEditor(container, initialValue) {
    try {
      const [{ basicSetup, EditorView }, { json }, { oneDark }] = await Promise.all([
        import('https://esm.sh/codemirror@6'),
        import('https://esm.sh/@codemirror/lang-json@6'),
        import('https://esm.sh/@codemirror/theme-one-dark@6'),
      ]);

      // Guard: body type may have changed while loading
      if (this.#request?.body?.type !== 'json') return;

      const isDark =
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      const extensions = [
        basicSetup,
        json(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) this.#scheduleSave();
        }),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'var(--color-input-bg)' },
          '&.cm-focused': { outline: 'none' },
          '.cm-gutters': {
            backgroundColor: 'var(--color-surface-2)',
            borderRight: '1px solid var(--color-border)',
            color: 'var(--color-text-tertiary)',
          },
          '.cm-activeLineGutter': { backgroundColor: 'var(--color-surface-3)' },
          '.cm-activeLine': { backgroundColor: 'var(--color-bg-subtle)' },
        }),
      ];
      if (isDark) extensions.push(oneDark);

      this.#cmEditor = new EditorView({
        doc: initialValue,
        extensions,
        parent: container,
      });
    } catch {
      // Fallback to plain textarea when CDN unavailable
      if (this.#request?.body?.type !== 'json') return;
      const area = this.shadowRoot.getElementById('body-area');
      const container2 = area?.querySelector('.cm-container');
      if (!container2) return;
      container2.innerHTML = '';
      const ta = document.createElement('textarea');
      ta.className = 'body-textarea';
      ta.id = 'body-textarea';
      ta.placeholder = 'JSON 内容';
      ta.value = this.#request.body.content ?? '';
      ta.addEventListener('input', () => this.#scheduleSave());
      container2.appendChild(ta);
    }
  }

  #formatJson() {
    if (!this.#cmEditor) return;
    const content = this.#cmEditor.state.doc.toString();
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      this.#cmEditor.dispatch({
        changes: { from: 0, to: this.#cmEditor.state.doc.length, insert: formatted },
      });
      this.#scheduleSave();
    } catch {
      // Invalid JSON — ignore silently
    }
  }

  #renderFormPairs() {
    const area = this.shadowRoot.getElementById('body-area');
    area.innerHTML = '';

    const pairs = this.#request.body.pairs ?? [];

    const list = document.createElement('div');
    list.className = 'kv-list';

    pairs.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'kv-row';
      row.innerHTML = `
        <input type="checkbox" class="kv-check" ${item.enabled !== false ? 'checked' : ''} />
        <input class="kv-input" placeholder="字段名" value="${this.#esc(item.key)}" />
        <input class="kv-input" placeholder="值" value="${this.#esc(item.value ?? '')}" />
        <div class="kv-del" title="删除">×</div>
      `;
      row.querySelector('.kv-check').addEventListener('change', (e) => {
        pairs[i].enabled = e.target.checked;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[0].addEventListener('input', (e) => {
        pairs[i].key = e.target.value;
        this.#scheduleSave();
      });
      row.querySelectorAll('.kv-input')[1].addEventListener('input', (e) => {
        pairs[i].value = e.target.value;
        this.#scheduleSave();
      });
      row.querySelector('.kv-del').addEventListener('click', () => {
        pairs.splice(i, 1);
        this.#renderFormPairs();
        this.#scheduleSave();
      });
      list.appendChild(row);
    });

    area.appendChild(list);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-row-btn';
    addBtn.textContent = '+ 添加字段';
    addBtn.addEventListener('click', () => {
      this.#request.body.pairs.push({ key: '', value: '', enabled: true });
      this.#renderFormPairs();
      this.#scheduleSave();
    });
    area.appendChild(addBtn);
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

    const body = { type: activeType };
    if (activeType === 'form-urlencoded') {
      body.pairs = this.#request?.body?.pairs ?? [];
    } else if (activeType === 'raw') {
      body.content = this.shadowRoot.getElementById('body-textarea')?.value ?? '';
      body.contentType =
        this.shadowRoot.getElementById('raw-type-select')?.value ??
        this.#request?.body?.contentType ??
        'text/plain';
    } else if (activeType === 'json') {
      body.content = this.#cmEditor
        ? this.#cmEditor.state.doc.toString()
        : (this.shadowRoot.getElementById('body-textarea')?.value ?? '');
    } else if (activeType !== 'none') {
      body.content = this.shadowRoot.getElementById('body-textarea')?.value ?? '';
    }

    return {
      ...this.#request,
      name,
      method,
      url,
      headers: this.#request?.headers ?? [],
      params: this.#request?.params ?? [],
      body,
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

    // Persist response to IndexedDB (strip blobUrl — it's a temporary object URL)
    if (this.#request?.id && !response.error) {
      const { blobUrl, ...storable } = response;
      storable.requestedAt = Date.now();
      saveRequestResponse(this.#request.id, storable).catch(() => {});
    }

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
