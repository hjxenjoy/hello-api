// <env-manager> Web Component - environment variables management panel

import {
  listEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
} from '../db/environments.js';
import { showPrompt, showConfirm } from '../core/dialog.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg-elevated);
      font-family: var(--font-sans);
      font-size: 13px;
    }
    .header {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 40px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
      gap: 8px;
    }
    .title {
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
    }
    .icon-btn:hover { background: var(--color-surface-3); color: var(--color-text-primary); }
    .close-btn { font-size: 20px; }
    .env-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px;
      border-bottom: 1px solid var(--color-border);
    }
    .env-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .env-item:hover { background: var(--color-surface-3); }
    .env-item.active { background: var(--color-accent-muted); }
    .env-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border-strong);
      flex-shrink: 0;
    }
    .env-item.active .env-dot { background: var(--color-accent); }
    .env-name { flex: 1; font-size: 13px; color: var(--color-text-primary); }
    .env-del {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      border-radius: 3px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.15s, color 0.15s;
    }
    .env-item:hover .env-del { opacity: 1; }
    .env-del:hover { color: var(--color-error); }
    .vars-section {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .vars-header {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border);
    }
    .vars-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .kv-row {
      display: grid;
      grid-template-columns: 24px 1fr 1fr 24px;
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
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      cursor: pointer;
      border-radius: 3px;
      font-size: 14px;
    }
    .kv-del:hover { color: var(--color-error); }
    .add-row-btn {
      align-self: flex-start;
      margin: 4px 8px 8px;
      padding: 4px 10px;
      font-size: 12px;
      color: var(--color-accent);
      border: 1px dashed var(--color-accent);
      border-radius: 3px;
      background: none;
      cursor: pointer;
    }
    .add-row-btn:hover { background: var(--color-accent-muted); }
    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--color-text-tertiary);
      font-size: 12px;
    }
  </style>
  <div class="header">
    <span class="title">环境变量</span>
    <div class="icon-btn" id="add-env-btn" title="新建环境">+</div>
    <div class="icon-btn close-btn" id="close-btn" title="关闭">×</div>
  </div>
  <div class="env-list" id="env-list"></div>
  <div class="vars-section" id="vars-section" style="display:none">
    <div class="vars-header" id="vars-header">变量</div>
    <div class="vars-list" id="vars-list"></div>
    <button class="add-row-btn" id="add-var-btn">+ 添加变量</button>
  </div>
  <div class="empty" id="empty-state">暂无环境，点击 + 创建</div>
`;

class EnvManager extends HTMLElement {
  #projectId = null;
  #envs = [];
  #selectedEnvId = null;
  #saveTimer = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#bindEvents();
    }
  }

  #bindEvents() {
    this.shadowRoot.getElementById('close-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('env-manager-close', { bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('add-env-btn').addEventListener('click', () => this.#addEnv());
    this.shadowRoot.getElementById('add-var-btn').addEventListener('click', () => this.#addVar());
  }

  async loadProject(projectId) {
    this.#projectId = projectId;
    this.#envs = await listEnvironments(projectId);
    const active = this.#envs.find((e) => e.isActive);
    this.#selectedEnvId = active?.id ?? this.#envs[0]?.id ?? null;
    this.#renderEnvList();
    this.#renderVarList();
  }

  #renderEnvList() {
    const list = this.shadowRoot.getElementById('env-list');
    const empty = this.shadowRoot.getElementById('empty-state');
    const varsSection = this.shadowRoot.getElementById('vars-section');

    if (this.#envs.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'flex';
      varsSection.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    varsSection.style.display = 'flex';

    list.innerHTML = '';
    for (const env of this.#envs) {
      const item = document.createElement('div');
      item.className = `env-item${env.id === this.#selectedEnvId ? ' active' : ''}`;
      item.innerHTML = `
        <div class="env-dot"></div>
        <div class="env-name">${this.#esc(env.name)}</div>
        <div class="env-del" title="删除">×</div>
      `;
      item.addEventListener('click', async (e) => {
        if (e.target.closest('.env-del')) {
          await this.#deleteEnv(env.id);
          return;
        }
        this.#selectedEnvId = env.id;
        await setActiveEnvironment(this.#projectId, env.id);
        this.#envs = await listEnvironments(this.#projectId);
        this.#renderEnvList();
        this.#renderVarList();
        this.dispatchEvent(
          new CustomEvent('env-changed', {
            detail: { environment: env },
            bubbles: true,
            composed: true,
          })
        );
      });
      list.appendChild(item);
    }
  }

  #renderVarList() {
    const env = this.#envs.find((e) => e.id === this.#selectedEnvId);
    const varsHeader = this.shadowRoot.getElementById('vars-header');
    const varsList = this.shadowRoot.getElementById('vars-list');
    if (!env) {
      varsList.innerHTML = '';
      return;
    }

    varsHeader.textContent = `变量 — ${env.name}`;
    varsList.innerHTML = '';

    for (let i = 0; i < env.variables.length; i++) {
      const v = env.variables[i];
      const row = document.createElement('div');
      row.className = 'kv-row';
      row.innerHTML = `
        <input type="checkbox" class="kv-check" ${v.enabled !== false ? 'checked' : ''} />
        <input class="kv-input" placeholder="变量名" value="${this.#esc(v.key)}" />
        <input class="kv-input" placeholder="值" value="${this.#esc(v.value ?? '')}" />
        <div class="kv-del">×</div>
      `;
      row.querySelector('.kv-check').addEventListener('change', (e) => {
        env.variables[i].enabled = e.target.checked;
        this.#scheduleSave(env);
      });
      row.querySelectorAll('.kv-input')[0].addEventListener('input', (e) => {
        env.variables[i].key = e.target.value;
        this.#scheduleSave(env);
      });
      row.querySelectorAll('.kv-input')[1].addEventListener('input', (e) => {
        env.variables[i].value = e.target.value;
        this.#scheduleSave(env);
      });
      row.querySelector('.kv-del').addEventListener('click', () => {
        env.variables.splice(i, 1);
        this.#renderVarList();
        this.#scheduleSave(env);
      });
      varsList.appendChild(row);
    }
  }

  async #addEnv() {
    if (!this.#projectId) return;
    const name = await showPrompt('新建环境', { placeholder: '环境名称，如：开发、生产' });
    if (!name) return;
    const env = await createEnvironment({ projectId: this.#projectId, name });
    this.#envs.push(env);
    this.#selectedEnvId = env.id;
    this.#renderEnvList();
    this.#renderVarList();
  }

  async #deleteEnv(id) {
    const ok = await showConfirm('确认删除该环境及其所有变量？', {
      title: '删除环境',
      confirmLabel: '删除',
      danger: true,
    });
    if (!ok) return;
    await deleteEnvironment(id);
    this.#envs = this.#envs.filter((e) => e.id !== id);
    if (this.#selectedEnvId === id) {
      this.#selectedEnvId = this.#envs[0]?.id ?? null;
    }
    this.#renderEnvList();
    this.#renderVarList();
  }

  #addVar() {
    const env = this.#envs.find((e) => e.id === this.#selectedEnvId);
    if (!env) return;
    env.variables.push({ key: '', value: '', enabled: true });
    this.#renderVarList();
    this.#scheduleSave(env);
  }

  #scheduleSave(env) {
    clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      updateEnvironment(env.id, { variables: env.variables }).catch(() => {});
    }, 600);
  }

  #esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }
}

customElements.define('env-manager', EnvManager);
