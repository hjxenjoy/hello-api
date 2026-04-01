# Hello API

一个安全、离线优先的 HTTP 接口测试与管理工具。无需注册、无需后端、所有数据存在本地浏览器。

**在线访问** → [hello-api-cf7.pages.dev](https://hello-api-cf7.pages.dev)

[English](README.md)

---

## 功能特性

### 请求构建

- **HTTP 方法** — GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS
- **请求参数** — Query Params、Headers、JSON Body（CodeMirror 6 编辑器）、Form、Raw
- **认证（Auth 选项卡）** — Bearer Token、Basic Auth、API Key（Header 或 Query）
- **变量插值** — `{{variable}}` 语法，配合环境变量使用
- **请求备注** — 为每条请求添加说明文字，持久化存储

### 响应查看

- 状态码、耗时、响应大小
- 格式化 JSON（语法着色）、响应头列表
- 媒体预览：图片、音视频、PDF、HTML、SVG
- **复制响应 Body** — 一键将响应内容复制到剪贴板

### 项目管理

- **项目 / 集合 / 请求** 三级树形导航，支持重命名与备注
- **搜索过滤** — 实时搜索项目、集合、请求名称及 URL，高亮匹配内容
- **拖拽排序** — 集合和请求均可在同级内自由拖拽调整顺序
- 展开/折叠状态持久化，刷新后保持
- 请求复制（Duplicate）、快速新建请求（无需先建项目）
- URL 自动同步为请求标题，手动修改后锁定

### 快捷操作

- **⌘↩ / Ctrl↩** — 发送请求
- **复制为 cURL** — 一键生成含认证信息的完整 curl 命令
- **导出数据** — 将所有项目序列化为 JSON 文件下载
- **导入数据** — 从 JSON 文件还原项目结构，不覆盖现有数据

### 工程特性

- **离线可用** — Service Worker 缓存所有静态资源，断网照常使用（PWA）
- **本地存储** — 所有数据存储在 IndexedDB，不上传任何服务器
- **双语界面** — 中文 / 英文，自动读取浏览器语言，用户修改后持久化到 `localStorage`
- **主题** — 亮色 / 暗色自由切换

---

## 设计原则

| 原则         | 说明                                               |
| ------------ | -------------------------------------------------- |
| 零运行时依赖 | Web 应用不引入任何第三方 JS 库，彻底规避供应链风险 |
| 离线优先     | Service Worker + Cache API，网络不可用时完整可用   |
| 本地数据     | IndexedDB 存储，用户完全掌控自己的数据             |
| 响应式       | 移动端与桌面端同等优先                             |

## 技术栈

- **UI**：原生 HTML/CSS + Web Components（Custom Elements + Shadow DOM）
- **逻辑**：Vanilla JS（ES2024+，ES Modules，无构建工具）
- **存储**：IndexedDB
- **离线**：Service Worker
- **代码编辑器**：CodeMirror 6（仅 JSON Body，按需从 CDN 加载）
- **国际化**：内置双语（中/英），零依赖

## 本地开发

无需安装任何依赖即可运行，用任意静态文件服务器打开即可：

```bash
# 方式一：使用 VS Code Live Server 插件直接打开 index.html

# 方式二：Node.js
npx serve .

# 方式三：Python
python3 -m http.server 8080
```

格式化代码（需要 Node.js）：

```bash
pnpm install   # 仅安装 prettier（devDependency）
pnpm format
```

重新生成 PWA 图标：

```bash
pnpm gen-icons
```

## 部署

项目连接 GitHub 后由 **Cloudflare Pages** 自动部署，配置如下：

| 字段                   | 值              |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | （留空）        |

每次推送 `main` 分支后自动触发重新部署。

## 项目结构

```
hello-api/
├── index.html              # 入口
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── assets/
│   ├── favicon.svg
│   ├── favicon.png
│   └── icons/              # PWA 应用图标 192/512px
├── scripts/
│   └── gen-icons.js        # PNG 图标生成器（纯 Node.js）
└── src/
    ├── app.js              # 初始化入口
    ├── components/         # Web Components
    │   ├── app-shell.js
    │   ├── sidebar-nav.js
    │   ├── request-editor.js
    │   ├── response-viewer.js
    │   ├── env-manager.js
    │   └── storage-indicator.js
    ├── db/                 # IndexedDB 数据层
    │   ├── index.js
    │   ├── projects.js
    │   ├── requests.js
    │   └── environments.js
    ├── core/               # 核心业务逻辑
    │   ├── http-client.js
    │   ├── interpolation.js
    │   ├── dialog.js
    │   ├── i18n.js
    │   └── storage-stats.js
    └── styles/             # CSS 设计令牌与主题
        ├── tokens.css
        ├── base.css
        ├── layout.css
        └── themes/
```

## License

MIT
