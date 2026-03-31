# Hello API

一个安全、离线优先的 HTTP 接口测试与管理工具。无需注册、无需后端、所有数据存在本地浏览器。

**在线访问** → [hello-api-cf7.pages.dev](https://hello-api-cf7.pages.dev)

---

## 功能特性

- **项目 / 集合 / 请求** 三级树形管理，支持重命名、备注、展开状态持久化
- **HTTP 方法** GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS
- **请求参数**：Query Params、Headers、JSON Body（CodeMirror 编辑器）、Form、Raw
- **变量插值**：`{{variable}}` 语法，配合环境变量使用
- **响应查看**：状态码、耗时、格式化 JSON、响应头
- **快速操作**：⌘↩ 发送请求、请求 Duplicate、URL 自动同步为请求标题
- **离线可用**：Service Worker 缓存所有静态资源，断网照常使用（PWA）
- **本地存储**：所有数据存储在 IndexedDB，不上传任何服务器
- **主题**：亮色 / 暗色自由切换

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
│   ├── favicon.svg         # SVG 图标（浏览器 tab）
│   ├── favicon.png         # PNG 回退图标
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
    │   └── storage-stats.js
    └── styles/             # CSS 设计令牌与主题
        ├── tokens.css
        ├── base.css
        ├── layout.css
        └── themes/
```

## License

MIT
