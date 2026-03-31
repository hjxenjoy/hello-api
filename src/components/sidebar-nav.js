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
const ICON_TRASH = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 3h8"/><path d="M3.5 3V2h4v1"/><path d="M2.5 3l.5 5.5h5l.5-5.5"/></svg>`;
const ICON_NEW_PROJECT = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 5.5a1 1 0 011-1h2.8l1.5 1.5H12a1 1 0 011 1v4a1 1 0 01-1 1H2.5a1 1 0 01-1-1V5.5z"/><path d="M7 7.5v2.5M5.75 8.75h2.5"/></svg>`;

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
    <div class="icon-btn" id="new-project-btn" title="新建项目">${ICON_NEW_PROJECT}</div>
    <div class="icon-btn" id="env-btn" title="环境变量">${ICON_SLIDERS}</div>
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
    this.shadowRoot.getElementById('sw-btn').addEventListener('click', () => this.#unregisterSW());
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

    for (const project of this.#projects) {
      const section = document.createElement('div');
      section.className = 'project-section';

      const isOpen = this.#expanded.has(project.id);

      const row = document.createElement('div');
      row.className = 'project-row';
      row.innerHTML = `
        <div class="chevron${isOpen ? ' open' : ''}">${ICON_CHEVRON}</div>
        <div class="node-icon">${ICON_PROJECT}</div>
        <div class="project-name">${this.#esc(project.name)}</div>
        <div class="row-actions">
          <div class="action-btn" data-action="rename" title="编辑">${ICON_PENCIL}</div>
          <div class="action-btn" data-action="add-collection" title="新建集合">${ICON_PLUS}</div>
          <div class="action-btn del" data-action="delete" title="删除项目">${ICON_TRASH}</div>
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
        const collections = await listCollections(project.id);
        const colContainer = document.createElement('div');
        colContainer.className = 'collections';

        for (const col of collections) {
          const colOpen = this.#expandedCollections.has(col.id);
          const colRow = document.createElement('div');
          colRow.className = 'collection-row';
          colRow.innerHTML = `
            <div class="chevron${colOpen ? ' open' : ''}">${ICON_CHEVRON}</div>
            <div class="node-icon">${ICON_COLLECTION}</div>
            <div class="collection-name">${this.#esc(col.name)}</div>
            <div class="row-actions">
              <div class="action-btn" data-action="rename" title="编辑">${ICON_PENCIL}</div>
              <div class="action-btn" data-action="add-request" title="新建请求">${ICON_PLUS}</div>
              <div class="action-btn del" data-action="delete" title="删除集合">${ICON_TRASH}</div>
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
            this.#expandedCollections.has(col.id)
              ? this.#expandedCollections.delete(col.id)
              : this.#expandedCollections.add(col.id);
            this.#persistExpanded();
            this.#renderTree();
          });

          colContainer.appendChild(colRow);

          if (colOpen) {
            const requests = await listRequests(col.id);
            const reqContainer = document.createElement('div');
            reqContainer.className = 'requests';

            for (const req of requests) {
              const reqRow = document.createElement('div');
              reqRow.className = `request-row${req.id === this.#activeRequestId ? ' active' : ''}`;
              const color = METHOD_COLORS[req.method] ?? '#64748b';
              reqRow.innerHTML = `
                <div class="node-icon">${ICON_REQUEST_FILE}</div>
                <span class="method-badge" style="color:${color}">${this.#esc(req.method)}</span>
                <span class="request-name">${this.#esc(req.name)}</span>
                <div class="row-actions">
                  <div class="action-btn" data-action="rename" title="重命名">${ICON_PENCIL}</div>
                  <div class="action-btn" data-action="duplicate" title="复制请求">${ICON_COPY}</div>
                  <div class="action-btn del" data-action="delete" title="删除请求">${ICON_TRASH}</div>
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

  #esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

customElements.define('sidebar-nav', SidebarNav);
