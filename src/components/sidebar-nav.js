// <sidebar-nav> Web Component - project/request tree navigation

const ICON_CHEVRON = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 2L7 5l-3.5 3"/></svg>`;
const ICON_SLIDERS = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M2 5h10"/><circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none"/><path d="M2 9h10"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const ICON_FOLDER = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11a2 2 0 012-2h7l2.5 2.5H26a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V11z"/></svg>`;
const ICON_SW = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 1.5L2 3.5v3c0 2.8 2 4.5 4.5 5 2.5-.5 4.5-2.2 4.5-5v-3L6.5 1.5z"/><path d="M4.5 6.5l1.5 1.5 2.5-2.5"/></svg>`;

import {
  listProjects,
  createProject,
  deleteProject,
  createCollection,
  deleteCollection,
  listCollections,
} from '../db/projects.js';
import { listRequests, createRequest, deleteRequest } from '../db/requests.js';
import { showPrompt, showConfirm } from '../core/dialog.js';

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
      font-size: 18px;
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
      gap: 6px;
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
    .project-icon {
      font-size: 13px;
      flex-shrink: 0;
    }
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
      font-size: 13px;
      transition: background 0.1s, color 0.1s;
    }
    .action-btn:hover { background: var(--color-border); color: var(--color-text-primary); }
    .action-btn.del:hover { background: var(--color-error-muted); color: var(--color-error); }
    .collections { padding-left: 16px; }
    .collection-row {
      display: flex;
      align-items: center;
      gap: 6px;
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
      gap: 6px;
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
      min-width: 40px;
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
    }
    .sw-btn {
      width: 28px;
      height: 28px;
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
      max-width: 220px;
      text-wrap: wrap;
      line-height: 1.4;
    }
    .sw-btn:hover::before { opacity: 1; }
  </style>
  <div class="header">
    <span class="header-title">项目</span>
    <div class="icon-btn" id="new-project-btn" title="新建项目">+</div>
    <div class="icon-btn" id="env-btn" title="环境变量">${ICON_SLIDERS}</div>
  </div>
  <div class="tree" id="tree">
    <div class="empty-projects" id="empty-state">
      <div class="empty-icon">${ICON_FOLDER}</div>
      <div>暂无项目</div>
      <div>点击 + 新建第一个项目</div>
    </div>
  </div>
  <div class="footer">
    <storage-indicator></storage-indicator>
    <button
      class="sw-btn"
      id="sw-btn"
      data-tooltip="注销 Service Worker（开发调试用，注销后自动刷新页面）"
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
      this.#bindTopActions();
    }
    this.refresh();
  }

  #bindTopActions() {
    this.shadowRoot
      .getElementById('new-project-btn')
      .addEventListener('click', () => this.#newProject());
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
    // Clear all caches
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
        <div class="project-name">${this.#esc(project.name)}</div>
        <div class="row-actions">
          <div class="action-btn" data-action="add-collection" title="新建集合">+</div>
          <div class="action-btn del" data-action="delete" title="删除项目">×</div>
        </div>
      `;

      row.addEventListener('click', async (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
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
            <div class="collection-name">${this.#esc(col.name)}</div>
            <div class="row-actions">
              <div class="action-btn" data-action="add-request" title="新建请求">+</div>
              <div class="action-btn del" data-action="delete" title="删除集合">×</div>
            </div>
          `;

          colRow.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'add-request') {
              await this.#newRequest(col.id);
              return;
            }
            if (action === 'delete') {
              await this.#deleteCollection(col.id);
              return;
            }
            this.#expandedCollections.has(col.id)
              ? this.#expandedCollections.delete(col.id)
              : this.#expandedCollections.add(col.id);
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
                <span class="method-badge" style="color:${color}">${this.#esc(req.method)}</span>
                <span class="request-name">${this.#esc(req.name)}</span>
                <div class="row-actions">
                  <div class="action-btn del" data-action="delete" title="删除请求">×</div>
                </div>
              `;
              reqRow.addEventListener('click', async (e) => {
                if (e.target.closest('[data-action]')?.dataset.action === 'delete') {
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
    const name = await showPrompt('新建项目', { placeholder: '项目名称' });
    if (!name) return;
    const project = await createProject({ name });
    this.#expanded.add(project.id);
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
    await this.refresh();
  }

  async #newCollection(projectId) {
    const name = await showPrompt('新建集合', { placeholder: '集合名称' });
    if (!name) return;
    const col = await createCollection({ projectId, name });
    this.#expanded.add(projectId);
    this.#expandedCollections.add(col.id);
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
    await this.refresh();
  }

  async #newRequest(collectionId) {
    const req = await createRequest({ collectionId, name: '新请求' });
    this.#activeRequestId = req.id;
    await this.refresh();
    this.dispatchEvent(
      new CustomEvent('request-selected', {
        detail: { request: req },
        bubbles: true,
        composed: true,
      })
    );
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
