// <sidebar-nav> Web Component - project/request tree navigation

import {
  listProjects,
  createProject,
  deleteProject,
  createCollection,
  deleteCollection,
  listCollections,
} from '../db/projects.js';
import { listRequests, createRequest, deleteRequest } from '../db/requests.js';

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
    }
  </style>
  <div class="header">
    <span class="header-title">项目</span>
    <div class="icon-btn" id="new-project-btn" title="新建项目">+</div>
    <div class="icon-btn" id="env-btn" title="环境变量" style="font-size:14px">⚙</div>
  </div>
  <div class="tree" id="tree">
    <div class="empty-projects" id="empty-state">
      <div class="empty-icon">📂</div>
      <div>暂无项目</div>
      <div>点击 + 新建第一个项目</div>
    </div>
  </div>
  <div class="footer">
    <storage-indicator></storage-indicator>
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
        <div class="chevron${isOpen ? ' open' : ''}">▶</div>
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
            <div class="chevron${colOpen ? ' open' : ''}">▶</div>
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
    const name = prompt('项目名称：');
    if (!name?.trim()) return;
    const project = await createProject({ name: name.trim() });
    this.#expanded.add(project.id);
    await this.refresh();
  }

  async #deleteProject(id) {
    if (!confirm('确认删除该项目及其所有数据？')) return;
    await deleteProject(id);
    this.#expanded.delete(id);
    await this.refresh();
  }

  async #newCollection(projectId) {
    const name = prompt('集合名称：');
    if (!name?.trim()) return;
    const col = await createCollection({ projectId, name: name.trim() });
    this.#expanded.add(projectId);
    this.#expandedCollections.add(col.id);
    await this.refresh();
  }

  async #deleteCollection(id) {
    if (!confirm('确认删除该集合及其所有请求？')) return;
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
    if (!confirm('确认删除该请求？')) return;
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
