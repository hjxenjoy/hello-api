// <app-shell> Web Component - overall responsive layout

import './sidebar-nav.js';
import './request-editor.js';
import './response-viewer.js';
import './env-manager.js';
import './storage-indicator.js';
import { getActiveEnvironment } from '../db/environments.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      font-family: var(--font-sans);
    }
    .layout {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .sidebar {
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--color-border);
      overflow: hidden;
      background: var(--color-surface-1);
    }
    .main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--color-bg-base);
      position: relative;
    }
    .topbar {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: var(--header-height);
      border-bottom: 1px solid var(--color-border);
      gap: 8px;
      flex-shrink: 0;
      background: var(--color-surface-1);
    }
    .menu-btn {
      display: none;
      width: 28px;
      height: 28px;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      color: var(--color-text-secondary);
      font-size: 18px;
      transition: background 0.15s;
    }
    .menu-btn:hover { background: var(--color-surface-3); }
    .topbar-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      flex: 1;
    }
    .env-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.15s;
      background: var(--color-surface-2);
    }
    .env-badge:hover { border-color: var(--color-accent); color: var(--color-text-primary); }
    .env-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-border-strong);
    }
    .env-dot.active { background: var(--color-success); }
    .theme-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      color: var(--color-text-secondary);
      font-size: 15px;
      transition: background 0.15s;
    }
    .theme-btn:hover { background: var(--color-surface-3); }
    .workspace {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      overflow: hidden;
      min-height: 0;
    }
    .request-panel {
      border-right: 1px solid var(--color-border);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .response-panel {
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .env-overlay {
      position: absolute;
      top: var(--header-height);
      right: 0;
      width: 380px;
      height: calc(100% - var(--header-height));
      z-index: var(--z-dropdown);
      box-shadow: var(--shadow-lg);
      border-left: 1px solid var(--color-border);
      display: none;
    }
    .env-overlay.open { display: flex; flex-direction: column; }
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: calc(var(--z-overlay) - 1);
    }
    .empty-workspace {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--color-text-tertiary);
      gap: 8px;
      font-size: 13px;
    }
    .empty-icon { font-size: 36px; opacity: 0.3; }

    /* Mobile */
    @media (max-width: 767px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar {
        position: fixed;
        top: 0; left: 0;
        width: var(--sidebar-width);
        height: 100%;
        z-index: var(--z-overlay);
        transform: translateX(-100%);
        transition: transform var(--transition-slow);
      }
      .sidebar.open { transform: translateX(0); }
      .sidebar-overlay.visible { display: block; }
      .menu-btn { display: flex; }
      .workspace { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
      .request-panel { border-right: none; border-bottom: 1px solid var(--color-border); }
      .env-overlay { width: 100%; }
    }
  </style>

  <div class="sidebar-overlay" id="sidebar-overlay"></div>

  <div class="layout">
    <div class="sidebar" id="sidebar">
      <sidebar-nav id="sidebar-nav"></sidebar-nav>
    </div>

    <div class="main" id="main">
      <div class="topbar">
        <div class="menu-btn" id="menu-btn">☰</div>
        <span class="topbar-title" id="topbar-title">Hello API</span>
        <div class="env-badge" id="env-badge" title="切换环境">
          <div class="env-dot" id="env-dot"></div>
          <span id="env-name">无环境</span>
        </div>
        <div class="theme-btn" id="theme-btn" title="切换主题">◑</div>
      </div>

      <div class="workspace" id="workspace">
        <div class="empty-workspace" id="empty-workspace">
          <div class="empty-icon">🚀</div>
          <div>从左侧选择或新建一个请求</div>
        </div>
      </div>

      <div class="env-overlay" id="env-overlay">
        <env-manager id="env-manager"></env-manager>
      </div>
    </div>
  </div>
`;

class AppShell extends HTMLElement {
  #currentProjectId = null;
  #currentEnvironment = null;

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.#bindEvents();
    }
  }

  #bindEvents() {
    // Mobile menu
    this.shadowRoot.getElementById('menu-btn').addEventListener('click', () => this.#openSidebar());
    this.shadowRoot
      .getElementById('sidebar-overlay')
      .addEventListener('click', () => this.#closeSidebar());

    // Theme toggle
    this.shadowRoot.getElementById('theme-btn').addEventListener('click', () => {
      const html = document.documentElement;
      html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    });

    // Env badge
    this.shadowRoot
      .getElementById('env-badge')
      .addEventListener('click', () => this.#toggleEnvOverlay());

    // Sidebar nav events
    const nav = this.shadowRoot.getElementById('sidebar-nav');
    nav.addEventListener('project-selected', (e) => {
      this.#currentProjectId = e.detail.project.id;
      this.#loadActiveEnv();
    });
    nav.addEventListener('request-selected', async (e) => {
      const { request, projectId } = e.detail;
      if (projectId) this.#currentProjectId = projectId;
      await this.#loadActiveEnv();
      this.#showRequestEditor(request);
    });
    nav.addEventListener('request-cleared', () => this.#showEmptyWorkspace());
    nav.addEventListener('open-env-manager', () => this.#toggleEnvOverlay());

    // Env manager events
    const envMgr = this.shadowRoot.getElementById('env-manager');
    envMgr.addEventListener('env-manager-close', () => this.#closeEnvOverlay());
    envMgr.addEventListener('env-changed', (e) => {
      this.#currentEnvironment = e.detail.environment;
      this.#updateEnvBadge();
      const editor = this.shadowRoot.querySelector('request-editor');
      editor?.setEnvironment(this.#currentEnvironment);
    });

    // Request/response relay
    this.shadowRoot.addEventListener('request-sending', () => {
      const viewer = this.shadowRoot.querySelector('response-viewer');
      viewer?.setLoading();
    });
    this.shadowRoot.addEventListener('request-response', (e) => {
      const viewer = this.shadowRoot.querySelector('response-viewer');
      viewer?.setResponse(e.detail);
    });
  }

  async #loadActiveEnv() {
    if (!this.#currentProjectId) return;
    const { getActiveEnvironment } = await import('../db/environments.js');
    this.#currentEnvironment = await getActiveEnvironment(this.#currentProjectId);
    this.#updateEnvBadge();

    const envMgr = this.shadowRoot.getElementById('env-manager');
    envMgr.loadProject(this.#currentProjectId);
  }

  #updateEnvBadge() {
    const dot = this.shadowRoot.getElementById('env-dot');
    const name = this.shadowRoot.getElementById('env-name');
    if (this.#currentEnvironment) {
      dot.className = 'env-dot active';
      name.textContent = this.#currentEnvironment.name;
    } else {
      dot.className = 'env-dot';
      name.textContent = '无环境';
    }
  }

  #showEmptyWorkspace() {
    const workspace = this.shadowRoot.getElementById('workspace');
    workspace.innerHTML = `
      <div class="empty-workspace" id="empty-workspace">
        <div class="empty-icon">🚀</div>
        <div>从左侧选择或新建一个请求</div>
      </div>
    `;
  }

  #showRequestEditor(request) {
    const workspace = this.shadowRoot.getElementById('workspace');
    workspace.innerHTML = `
      <div class="request-panel">
        <request-editor id="req-editor"></request-editor>
      </div>
      <div class="response-panel">
        <response-viewer id="resp-viewer"></response-viewer>
      </div>
    `;
    const editor = workspace.querySelector('request-editor');
    editor.loadRequest(request, this.#currentEnvironment);
  }

  #openSidebar() {
    this.shadowRoot.getElementById('sidebar').classList.add('open');
    this.shadowRoot.getElementById('sidebar-overlay').classList.add('visible');
  }

  #closeSidebar() {
    this.shadowRoot.getElementById('sidebar').classList.remove('open');
    this.shadowRoot.getElementById('sidebar-overlay').classList.remove('visible');
  }

  #toggleEnvOverlay() {
    const overlay = this.shadowRoot.getElementById('env-overlay');
    const isOpen = overlay.classList.toggle('open');
    if (isOpen && this.#currentProjectId) {
      this.shadowRoot.getElementById('env-manager').loadProject(this.#currentProjectId);
    }
  }

  #closeEnvOverlay() {
    this.shadowRoot.getElementById('env-overlay').classList.remove('open');
  }
}

customElements.define('app-shell', AppShell);
