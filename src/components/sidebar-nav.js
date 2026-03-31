// <sidebar-nav> Web Component - project/request tree navigation

const ICON_CHEVRON = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 2L7 5l-3.5 3"/></svg>`;
const ICON_SLIDERS = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M2 5h10"/><circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none"/><path d="M2 9h10"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const ICON_FOLDER = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a2 2 0 012-2h7l2.5 2.5H26a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V11z"/></svg>`;
const ICON_SW = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 1.5L2 3.5v3c0 2.8 2 4.5 4.5 5 2.5-.5 4.5-2.2 4.5-5v-3L6.5 1.5z"/><path d="M4.5 6.5l1.5 1.5 2.5-2.5"/></svg>`;
const ICON_COPY = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="6" height="6" rx="1"/><path d="M1.5 7.5V2a1 1 0 011-1h5.5"/></svg>`;
// Node-type icons
const ICON_PROJECT = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="4.5" width="11" height="8" rx="1.5"/><path d="M5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5"/><path d="M1.5 8.5h11"/></svg>`;
const ICON_COLLECTION = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 5.5a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1v4.5a1 1 0 01-1 1H2.5a1 1 0 01-1-1V5.5z"/></svg>`;
const ICON_REQUEST_FILE = `<svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="1.5" width="9" height="10" rx="1.5"/><path d="M4 4.5h5M4 6.5h3.5M4 8.5h2"/></svg>`;
const ICON_PENCIL = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 1.5l2 2-6 6H2.5V7.5l6-6z"/><path d="M7 3l2 2"/></svg>`;
const ICON_ADD_REQ = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 1.5H3a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 003 12.5h8a1.5 1.5 0 001.5-1.5V6.5"/><path d="M10.5 1.5v4M8.5 3.5h4"/></svg>`;
// Action icons for row buttons
const ICON_PLUS = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5.5 1.5v8M1.5 5.5h8"/></svg>`;
const ICON_CROSS = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7"/></svg>`;
const ICON_EXPORT = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1.5v7"/><path d="M4.5 6L7 8.5 9.5 6"/><path d="M2 10.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>`;
const ICON_IMPORT = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9.5v-7"/><path d="M4.5 5L7 2.5 9.5 5"/><path d="M2 10.5v1a1 1 0 001 1h8a1 1 0 001-1v-1"/></svg>`;

import {
  listProjects,
  createProject,
  deleteProject,
  updateProject,
  createCollection,
  deleteCollection,
  updateCollection,
  listCollections,
} from '../db/projects.js';
import {
  listRequests,
  createRequest,
  deleteRequest,
  duplicateRequest,
  updateRequest,
} from '../db/requests.js';
import { showPrompt, showConfirm, showForm } from '../core/dialog.js';

const LS_EXPANDED = 'hapi-sidebar-expanded';
const LS_EXPANDED_COLL = 'hapi-sidebar-expanded-coll';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-surface-1);
      font-family: var(--font-sans);
      font-size: 13px;
    }
    .header {
      display: flex;
      align-items: center;
      padding: 0 8px 0 12px;
      height: 40px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      gap: 4px;
    }
    .header-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex: 1;
    }
    .icon-btn {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }
    .icon-btn:hover { background: var(--color-surface-3); color: var(--color-text-primary); }
    .tree {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }
    .project-section { margin-bottom: 2px; }
    .project-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 8px 5px 10px;
      cursor: pointer;
      border-radius: 4px;
      margin: 0 4px;
      transition: background 0.1s;
      user-select: none;
    }
    .project-row:hover { background: var(--color-surface-3); }
    .project-row.active { background: var(--color-surface-2); }
    .chevron {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      font-size: 10px;
      transition: transform 0.15s;
      flex-shrink: 0;
    }
    .chevron.open { transform: rotate(90deg); }
    .node-icon {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.75;
    }
    .project-row .node-icon { color: var(--color-accent); }
    .collection-row .node-icon { color: var(--color-text-secondary); }
    .request-row .node-icon { color: var(--color-text-tertiary); }
    .project-name {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.1s;
    }
    .project-row:hover .row-actions,
    .collection-row:hover .row-actions,
    .request-row:hover .row-actions { opacity: 1; }
    .action-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      color: var(--color-text-tertiary);
      cursor: pointer;
      transition: background 0.1s, color 0.1s;
    }
    .action-btn:hover { background: var(--color-border); color: var(--color-text-primary); }
    .action-btn.del:hover { background: var(--color-error-muted); color: var(--color-error); }
    .collections { padding-left: 16px; }
    .collection-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      margin: 0 4px;
      transition: background 0.1s;
      user-select: none;
    }
    .collection-row:hover { background: var(--color-surface-3); }
    .collection-name {
      flex: 1;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .requests { padding-left: 28px; }
    .request-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      margin: 0 4px;
      transition: background 0.1s;
      user-select: none;
    }
    .request-row:hover { background: var(--color-surface-3); }
    .request-row.active { background: var(--color-accent-muted); }
    .method-badge {
      font-size: 10px;
      font-weight: 700;
      font-family: var(--font-mono);
      min-width: 38px;
      text-align: center;
      flex-shrink: 0;
    }
    .request-name {
      flex: 1;
      font-size: 12px;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty-projects {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 40px 16px;
      color: var(--color-text-tertiary);
      font-size: 12px;
      text-align: center;
    }
    .empty-icon { font-size: 28px; opacity: 0.4; }
    .search-bar {
      padding: 6px 8px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .search-input {
      width: 100%;
      background: var(--color-input-bg);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      color: var(--color-text-primary);
      outline: none;
      box-sizing: border-box;
    }
    .search-input:focus { border-color: var(--color-input-border-focus); }
    .search-input::placeholder { color: var(--color-input-placeholder); }
    .search-match mark {
      background: var(--color-accent-muted);
      color: var(--color-accent);
      border-radius: 2px;
      font-style: normal;
    }
    .drag-over-top { border-top: 2px solid var(--color-accent) !important; }
    .drag-over-bottom { border-bottom: 2px solid var(--color-accent) !important; }
    .dragging { opacity: 0.4; }
    .footer {
      border-top: 1px solid var(--color-border);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      min-height: 32px;
    }
    .sw-btn {
      width: 28px;
      height: 28px;
      min-width: 28px;
      min-height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 4px;
      border: none;
      background: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      margin-right: 4px;
      transition: color 0.15s, background 0.15s;
      position: relative;
    }
    .sw-btn:hover { color: var(--color-text-secondary); background: var(--color-surface-3); }
    .sw-btn::before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 6px);
      right: 0;
      background: var(--color-surface-3);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      border-radius: 5px;
      padding: 5px 8px;
      font-size: 11px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      box-shadow: var(--shadow-md);
      z-index: 10;
    }
    .sw-btn:hover::before { opacity: 1; }
  </style>
  <div class="header">
    <span class="header-title">项目</span>
    <div class="icon-btn" id="new-request-btn" title="快速新建请求">${ICON_ADD_REQ}</div>
    <div class="icon-btn" id="new-project-btn" title="新建项目">${ICON_PLUS}</div>
    <div class="icon-btn" id="export-btn" title="导出所有数据">${ICON_EXPORT}</div>
    <div class="icon-btn" id="import-btn" title="从文件导入">${ICON_IMPORT}</div>
    <div class="icon-btn" id="env-btn" title="环境变量">${ICON_SLIDERS}</div>
  </div>
  <input type="file" id="import-file-input" accept=".json" style="display:none" />
  <div class="search-bar">
    <input class="search-input" id="search-input" placeholder="搜索请求…" />
  </div>
  <div class="tree" id="tree">
    <div class="empty-projects" id="empty-state">
      <div class="empty-icon">${ICON_FOLDER}</div>
      <div>暂无项目</div>
      <div>点击 + 新建项目，或直接新建请求</div>
    </div>
  </div>
  <div class="footer">
    <storage-indicator></storage-indicator>
    <button
      class="sw-btn"
      id="sw-btn"
      data-tooltip="注销 Service Worker"
    >${ICON_SW}</button>
  </div>
`;

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
  HEAD: '#06b6d4',
  OPTIONS: '#64748b',
};

class SidebarNav extends HTMLElement {
  #projects = [];
  #expanded = new Set();
  #expandedCollections = new Set();
  #activeRequestId = null;
  #searchQuery = '';
  #dragSrc = null; // { type: 'request'|'collection', id, parentId }
  #dropTarget = null; // { id, position: 'before'|'after' }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#loadExpandState();
      this.#bindTopActions();
    }
    this.refresh();
  }

  #loadExpandState() {
    try {
      const p = localStorage.getItem(LS_EXPANDED);
      const c = localStorage.getItem(LS_EXPANDED_COLL);
      if (p) this.#expanded = new Set(JSON.parse(p));
      if (c) this.#expandedCollections = new Set(JSON.parse(c));
    } catch {
      // ignore corrupt localStorage data
    }
  }

  #persistExpanded() {
    localStorage.setItem(LS_EXPANDED, JSON.stringify([...this.#expanded]));
    localStorage.setItem(LS_EXPANDED_COLL, JSON.stringify([...this.#expandedCollections]));
  }

  #bindTopActions() {
    this.shadowRoot
      .getElementById('new-project-btn')
      .addEventListener('click', () => this.#newProject());
    this.shadowRoot
      .getElementById('new-request-btn')
      .addEventListener('click', () => this.#quickAddRequest());
    this.shadowRoot.getElementById('env-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-env-manager', { bubbles: true, composed: true }));
    });
    this.shadowRoot
      .getElementById('export-btn')
      .addEventListener('click', () => this.#exportData());
    this.shadowRoot.getElementById('import-btn').addEventListener('click', () => {
      this.shadowRoot.getElementById('import-file-input').click();
    });
    this.shadowRoot.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.#importData(file);
      e.target.value = '';
    });
    this.shadowRoot.getElementById('sw-btn').addEventListener('click', () => this.#unregisterSW());

    this.shadowRoot.getElementById('search-input').addEventListener('input', (e) => {
      this.#searchQuery = e.target.value.trim().toLowerCase();
      this.#renderTree();
    });
  }

  async #unregisterSW() {
    if (!('serviceWorker' in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
      await showConfirm('当前没有已注册的 Service Worker。', {
        title: 'Service Worker',
        confirmLabel: '知道了',
      });
      return;
    }
    const ok = await showConfirm(
      `将注销 ${regs.length} 个 Service Worker，页面随后自动刷新。缓存的资源文件会被清除。`,
      { title: '注销 Service Worker', confirmLabel: '注销并刷新', danger: true }
    );
    if (!ok) return;
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    location.reload();
  }

  async refresh() {
    this.#projects = await listProjects();
    this.#renderTree();
  }

  async #renderTree() {
    const tree = this.shadowRoot.getElementById('tree');
    const empty = this.shadowRoot.getElementById('empty-state');

    if (this.#projects.length === 0) {
      tree.innerHTML = '';
      tree.appendChild(empty);
      return;
    }

    tree.innerHTML = '';
    const q = this.#searchQuery;

    for (const project of this.#projects) {
      const collections = await listCollections(project.id);

      // Search: build filtered collections + requests
      let filteredCols = null;
      if (q) {
        filteredCols = [];
        for (const col of collections) {
          const reqs = await listRequests(col.id);
          const colMatches = col.name.toLowerCase().includes(q);
          const matchingReqs = reqs.filter(
            (r) => r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
          );
          if (colMatches || matchingReqs.length > 0) {
            filteredCols.push({ col, requests: colMatches ? reqs : matchingReqs });
          }
        }
        if (!project.name.toLowerCase().includes(q) && filteredCols.length === 0) continue;
      }

      const isOpen = q ? true : this.#expanded.has(project.id);
      const section = document.createElement('div');
      section.className = 'project-section';

      const row = document.createElement('div');
      row.className = 'project-row';
      row.innerHTML = `
        <div class="chevron${isOpen ? ' open' : ''}">${ICON_CHEVRON}</div>
        <div class="node-icon">${ICON_PROJECT}</div>
        <div class="project-name">${this.#highlight(project.name, q)}</div>
        <div class="row-actions">
          <div class="action-btn" data-action="rename" title="编辑">${ICON_PENCIL}</div>
          <div class="action-btn" data-action="add-collection" title="新建集合">${ICON_PLUS}</div>
          <div class="action-btn del" data-action="delete" title="删除项目">${ICON_CROSS}</div>
        </div>
      `;
      row.addEventListener('click', async (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action === 'rename') {
          e.stopPropagation();
          await this.#renameProject(project);
          return;
        }
        if (action === 'add-collection') {
          await this.#newCollection(project.id);
          return;
        }
        if (action === 'delete') {
          await this.#deleteProject(project.id);
          return;
        }
        if (q) return;
        this.#expanded.has(project.id)
          ? this.#expanded.delete(project.id)
          : this.#expanded.add(project.id);
        this.#persistExpanded();
        this.#renderTree();
        this.dispatchEvent(
          new CustomEvent('project-selected', {
            detail: { project },
            bubbles: true,
            composed: true,
          })
        );
      });
      section.appendChild(row);

      if (isOpen) {
        const colsToRender = filteredCols ? filteredCols.map((f) => f.col) : collections;
        const colContainer = document.createElement('div');
        colContainer.className = 'collections';

        for (let ci = 0; ci < colsToRender.length; ci++) {
          const col = colsToRender[ci];
          const filteredEntry = filteredCols ? filteredCols[ci] : null;
          const colOpen = q ? true : this.#expandedCollections.has(col.id);

          const colRow = document.createElement('div');
          colRow.className = 'collection-row';
          if (!q) {
            colRow.draggable = true;
            this.#bindDrag(
              colRow,
              { type: 'collection', id: col.id, parentId: project.id },
              colsToRender
            );
          }
          colRow.innerHTML = `
            <div class="chevron${colOpen ? ' open' : ''}">${ICON_CHEVRON}</div>
            <div class="node-icon">${ICON_COLLECTION}</div>
            <div class="collection-name">${this.#highlight(col.name, q)}</div>
            <div class="row-actions">
              <div class="action-btn" data-action="rename" title="编辑">${ICON_PENCIL}</div>
              <div class="action-btn" data-action="add-request" title="新建请求">${ICON_PLUS}</div>
              <div class="action-btn del" data-action="delete" title="删除集合">${ICON_CROSS}</div>
            </div>
          `;
          colRow.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'rename') {
              e.stopPropagation();
              await this.#renameCollection(col);
              return;
            }
            if (action === 'add-request') {
              await this.#newRequest(col.id, project.id);
              return;
            }
            if (action === 'delete') {
              await this.#deleteCollection(col.id);
              return;
            }
            if (q) return;
            this.#expandedCollections.has(col.id)
              ? this.#expandedCollections.delete(col.id)
              : this.#expandedCollections.add(col.id);
            this.#persistExpanded();
            this.#renderTree();
          });
          colContainer.appendChild(colRow);

          if (colOpen) {
            const requests = filteredEntry?.requests ?? (await listRequests(col.id));
            const reqContainer = document.createElement('div');
            reqContainer.className = 'requests';

            for (const req of requests) {
              const reqRow = document.createElement('div');
              reqRow.className = `request-row${req.id === this.#activeRequestId ? ' active' : ''}`;
              if (!q) {
                reqRow.draggable = true;
                this.#bindDrag(reqRow, { type: 'request', id: req.id, parentId: col.id }, requests);
              }
              const color = METHOD_COLORS[req.method] ?? '#64748b';
              reqRow.innerHTML = `
                <div class="node-icon">${ICON_REQUEST_FILE}</div>
                <span class="method-badge" style="color:${color}">${this.#esc(req.method)}</span>
                <span class="request-name">${this.#highlight(req.name, q)}</span>
                <div class="row-actions">
                  <div class="action-btn" data-action="rename" title="重命名">${ICON_PENCIL}</div>
                  <div class="action-btn" data-action="duplicate" title="复制请求">${ICON_COPY}</div>
                  <div class="action-btn del" data-action="delete" title="删除请求">${ICON_CROSS}</div>
                </div>
              `;
              reqRow.addEventListener('click', async (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'rename') {
                  e.stopPropagation();
                  await this.#renameRequest(req);
                  return;
                }
                if (action === 'duplicate') {
                  await this.#duplicateReq(req.id);
                  return;
                }
                if (action === 'delete') {
                  await this.#deleteReq(req.id);
                  return;
                }
                this.#activeRequestId = req.id;
                this.#renderTree();
                this.dispatchEvent(
                  new CustomEvent('request-selected', {
                    detail: { request: req, projectId: project.id },
                    bubbles: true,
                    composed: true,
                  })
                );
              });
              reqContainer.appendChild(reqRow);
            }
            colContainer.appendChild(reqContainer);
          }
        }
        section.appendChild(colContainer);
      }

      tree.appendChild(section);
    }
  }

  #bindDrag(row, src, siblings) {
    row.addEventListener('dragstart', (e) => {
      this.#dragSrc = src;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', src.id);
      setTimeout(() => row.classList.add('dragging'), 0);
    });
    row.addEventListener('dragend', () => {
      this.#clearDragClasses();
      this.#dragSrc = null;
      this.#dropTarget = null;
    });
    row.addEventListener('dragover', (e) => {
      if (
        !this.#dragSrc ||
        this.#dragSrc.type !== src.type ||
        this.#dragSrc.parentId !== src.parentId ||
        this.#dragSrc.id === src.id
      )
        return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.#clearDragClasses();
      const rect = row.getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;
      row.classList.add(isTop ? 'drag-over-top' : 'drag-over-bottom');
      this.#dropTarget = { id: src.id, position: isTop ? 'before' : 'after' };
    });
    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (
        !this.#dragSrc ||
        !this.#dropTarget ||
        this.#dragSrc.type !== src.type ||
        this.#dragSrc.parentId !== src.parentId ||
        this.#dragSrc.id === this.#dropTarget.id
      )
        return;
      const s = { ...this.#dragSrc };
      const t = { ...this.#dropTarget };
      this.#dragSrc = null;
      this.#dropTarget = null;
      await this.#doReorder(s.type, s.parentId, s.id, t);
    });
  }

  async #doReorder(type, parentId, srcId, target) {
    const items =
      type === 'request' ? await listRequests(parentId) : await listCollections(parentId);
    const fromIdx = items.findIndex((x) => x.id === srcId);
    const toIdx = items.findIndex((x) => x.id === target.id);
    if (fromIdx === -1 || toIdx === -1) return;

    const [item] = items.splice(fromIdx, 1);
    const adjustedTo = toIdx > fromIdx ? toIdx - 1 : toIdx;
    const insertAt = target.position === 'before' ? adjustedTo : adjustedTo + 1;
    items.splice(Math.max(0, Math.min(items.length, insertAt)), 0, item);

    const updater = type === 'request' ? updateRequest : updateCollection;
    await Promise.all(items.map((x, i) => updater(x.id, { order: i })));
    await this.refresh();
  }

  #clearDragClasses() {
    this.shadowRoot
      .querySelectorAll('.drag-over-top, .drag-over-bottom, .dragging')
      .forEach((el) => el.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging'));
  }

  #highlight(text, q) {
    const escaped = this.#esc(text);
    if (!q) return escaped;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escaped;
    return (
      this.#esc(text.slice(0, idx)) +
      `<mark>${this.#esc(text.slice(idx, idx + q.length))}</mark>` +
      this.#esc(text.slice(idx + q.length))
    );
  }

  async #newProject() {
    const result = await showForm('新建项目', [
      { id: 'name', label: '名称', placeholder: '项目名称' },
      { id: 'description', label: '备注', type: 'textarea', placeholder: '可选备注（可留空）' },
    ]);
    if (!result || !result.name.trim()) return;
    const project = await createProject({
      name: result.name.trim(),
      description: result.description,
    });
    this.#expanded.add(project.id);
    this.#persistExpanded();
    await this.refresh();
  }

  async #renameProject(project) {
    const result = await showForm('编辑项目', [
      { id: 'name', label: '名称', defaultValue: project.name, placeholder: '项目名称' },
      {
        id: 'description',
        label: '备注',
        type: 'textarea',
        defaultValue: project.description ?? '',
        placeholder: '可选备注（可留空）',
      },
    ]);
    if (!result) return;
    const name = result.name.trim();
    if (!name) return;
    await updateProject(project.id, { name, description: result.description });
    await this.refresh();
  }

  async #deleteProject(id) {
    const ok = await showConfirm('确认删除该项目及其所有集合与请求？此操作不可撤销。', {
      title: '删除项目',
      confirmLabel: '删除',
      danger: true,
    });
    if (!ok) return;
    await deleteProject(id);
    this.#expanded.delete(id);
    this.#persistExpanded();
    await this.refresh();
  }

  async #newCollection(projectId) {
    const result = await showForm('新建集合', [
      { id: 'name', label: '名称', placeholder: '集合名称' },
      { id: 'description', label: '备注', type: 'textarea', placeholder: '可选备注（可留空）' },
    ]);
    if (!result || !result.name.trim()) return;
    const col = await createCollection({
      projectId,
      name: result.name.trim(),
      description: result.description,
    });
    this.#expanded.add(projectId);
    this.#expandedCollections.add(col.id);
    this.#persistExpanded();
    await this.refresh();
  }

  async #renameCollection(col) {
    const result = await showForm('编辑集合', [
      { id: 'name', label: '名称', defaultValue: col.name, placeholder: '集合名称' },
      {
        id: 'description',
        label: '备注',
        type: 'textarea',
        defaultValue: col.description ?? '',
        placeholder: '可选备注（可留空）',
      },
    ]);
    if (!result) return;
    const name = result.name.trim();
    if (!name) return;
    await updateCollection(col.id, { name, description: result.description });
    await this.refresh();
  }

  async #deleteCollection(id) {
    const ok = await showConfirm('确认删除该集合及其所有请求？此操作不可撤销。', {
      title: '删除集合',
      confirmLabel: '删除',
      danger: true,
    });
    if (!ok) return;
    await deleteCollection(id);
    this.#expandedCollections.delete(id);
    this.#persistExpanded();
    await this.refresh();
  }

  async #quickAddRequest() {
    // Ensure at least a default project + collection exist, then create a request
    const projects = await listProjects();
    let project;
    if (projects.length === 0) {
      project = await createProject({ name: '默认', description: '' });
    } else {
      project = projects[0];
    }
    const collections = await listCollections(project.id);
    let col;
    if (collections.length === 0) {
      col = await createCollection({ projectId: project.id, name: '默认', description: '' });
    } else {
      col = collections[0];
    }
    this.#expanded.add(project.id);
    this.#expandedCollections.add(col.id);
    this.#persistExpanded();
    await this.#newRequest(col.id, project.id);
  }

  async #newRequest(collectionId, projectId = null) {
    const req = await createRequest({ collectionId, name: '新请求' });
    this.#activeRequestId = req.id;
    await this.refresh();
    this.dispatchEvent(
      new CustomEvent('request-selected', {
        detail: { request: req, projectId },
        bubbles: true,
        composed: true,
      })
    );
  }

  async #renameRequest(req) {
    const name = await showPrompt('重命名请求', {
      defaultValue: req.name,
      placeholder: '请求名称',
    });
    if (!name) return;
    await updateRequest(req.id, { name, nameIsAuto: false });
    await this.refresh();
  }

  async #duplicateReq(id) {
    await duplicateRequest(id);
    await this.refresh();
  }

  async #deleteReq(id) {
    const ok = await showConfirm('确认删除该请求？此操作不可撤销。', {
      title: '删除请求',
      confirmLabel: '删除',
      danger: true,
    });
    if (!ok) return;
    if (this.#activeRequestId === id) this.#activeRequestId = null;
    await deleteRequest(id);
    await this.refresh();
    if (this.#activeRequestId === null) {
      this.dispatchEvent(new CustomEvent('request-cleared', { bubbles: true, composed: true }));
    }
  }

  async #exportData() {
    const projects = await listProjects();
    const result = { version: 1, exportedAt: new Date().toISOString(), projects: [] };
    for (const project of projects) {
      const pData = {
        name: project.name,
        description: project.description ?? '',
        order: project.order ?? 0,
        collections: [],
      };
      const collections = await listCollections(project.id);
      for (const col of collections) {
        const cData = {
          name: col.name,
          description: col.description ?? '',
          order: col.order ?? 0,
          requests: [],
        };
        const requests = await listRequests(col.id);
        for (const req of requests) {
          // Strip storage-only fields
          const { id, collectionId, createdAt, updatedAt, lastResponse, ...rest } = req;
          cData.requests.push(rest);
        }
        pData.collections.push(cData);
      }
      result.projects.push(pData);
    }
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hapi-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async #importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('无效的导入文件格式');
      }
      let importedReqs = 0;
      for (const p of data.projects) {
        if (!p.name) continue;
        const project = await createProject({ name: p.name, description: p.description ?? '' });
        this.#expanded.add(project.id);
        for (const c of p.collections ?? []) {
          if (!c.name) continue;
          const col = await createCollection({
            projectId: project.id,
            name: c.name,
            description: c.description ?? '',
          });
          this.#expandedCollections.add(col.id);
          for (const req of c.requests ?? []) {
            await createRequest({ ...req, collectionId: col.id });
            importedReqs++;
          }
        }
      }
      this.#persistExpanded();
      await this.refresh();
      await showConfirm(`成功导入 ${data.projects.length} 个项目，共 ${importedReqs} 条请求。`, {
        title: '导入成功',
        confirmLabel: '确定',
      });
    } catch (err) {
      await showConfirm(`导入失败：${err.message}`, {
        title: '导入错误',
        confirmLabel: '确定',
        danger: true,
      });
    }
  }

  #esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

customElements.define('sidebar-nav', SidebarNav);
