# Hello API

一个安全、离线优先的 HTTP 接口测试与管理工具。

## 设计原则

1. **零依赖** —— Web 应用运行时不引入任何第三方 JS 库，彻底避免供应链风险
2. **离线优先** —— Service Worker 缓存所有静态资源，断网可用
3. **本地数据** —— 所有数据存储在 IndexedDB，用户完全掌控
4. **响应式** —— 移动端与桌面端同等优先，不得只顾桌面端
5. **主题化** —— CSS Custom Properties 驱动，所有视觉 token 集中在 tokens.css

## 技术栈

- **UI**: 原生 HTML/CSS + Web Components（Custom Elements + Shadow DOM）
- **逻辑**: Vanilla JS（ES2024+，ES Modules，无构建工具）
- **存储**: IndexedDB（通过 `src/db/` 封装层访问）
- **离线**: Service Worker（`sw.js`）
- **PWA**: Web App Manifest（`manifest.json`）
- **格式化**: Prettier（仅 devDependency，不影响运行时）

## 开发约定

### 代码规范

- 所有 CSS 变量必须定义在 `src/styles/tokens.css`，**禁止**在组件内硬编码颜色、间距、字体等视觉值
- Web Components 均使用 Shadow DOM 封装样式，防止样式污染
- DB 操作**只能**通过 `src/db/` 层进行，**禁止**在组件或 core 层直接操作 IndexedDB
- HTTP 请求**只能**通过 `src/core/http-client.js` 发出
- 变量插值（`{{name}}`）统一走 `src/core/interpolation.js`

### 格式化规则

- 每次迭代完成后，提交前必须运行格式化：
  ```bash
  pnpm format
  ```
- 格式化工具：Prettier，配置见 `.prettierrc`

### Git 提交规范

- **每次迭代必须提交一个 commit**，不允许积累多个迭代再提交
- 提交前必须先执行 `pnpm format`
- Commit message 使用约定式提交格式：

  ```
  <type>(<scope>): <简短描述>

  类型说明：
  feat     新功能
  fix      修复 bug
  style    样式调整（不影响逻辑）
  refactor 重构（不新增功能也不修复 bug）
  chore    构建/工具/配置变更
  docs     文档变更
  ```

- 示例：
  ```
  feat(db): 初始化 IndexedDB schema 及 projects CRUD
  feat(components): 实现 request-editor 组件
  style(tokens): 补充暗色主题 CSS 变量
  ```

## 项目结构

```
hello-api/
├── CLAUDE.md
├── index.html                   # 入口，挂载 <app-shell>，注册 SW
├── manifest.json                # PWA Manifest
├── sw.js                        # Service Worker（缓存策略）
├── package.json                 # 仅含 devDependencies（prettier）
├── .prettierrc                  # Prettier 配置
├── .gitignore
│
├── src/
│   ├── app.js                   # 初始化 DB、注册所有 Web Components
│   │
│   ├── components/              # Web Components
│   │   ├── app-shell.js         # 整体布局（响应式，侧边栏 + 主区）
│   │   ├── sidebar-nav.js       # 左侧项目/请求树形导航
│   │   ├── request-editor.js    # 请求构建器（Method、URL、Headers、Body）
│   │   ├── response-viewer.js   # 响应查看器（状态码、耗时、格式化 Body）
│   │   ├── env-manager.js       # 环境变量管理面板
│   │   └── storage-indicator.js # 实时 IndexedDB 存储用量指示器
│   │
│   ├── db/                      # IndexedDB 数据层（唯一允许操作 IDB 的地方）
│   │   ├── index.js             # DB 初始化、schema 版本管理
│   │   ├── projects.js          # 项目 & 集合 CRUD
│   │   ├── requests.js          # 请求 CRUD
│   │   └── environments.js      # 环境变量 CRUD
│   │
│   ├── core/                    # 核心业务逻辑
│   │   ├── http-client.js       # fetch 封装（发送请求、计时、错误处理）
│   │   ├── interpolation.js     # {{variable}} 变量插值引擎
│   │   └── storage-stats.js     # navigator.storage.estimate() 封装
│   │
│   └── styles/
│       ├── tokens.css           # 所有 CSS 变量（颜色、间距、字体、圆角…）
│       ├── base.css             # Reset + 基础排版
│       ├── layout.css           # 响应式断点与网格
│       └── themes/
│           ├── light.css        # 亮色主题
│           └── dark.css         # 暗色主题
│
└── assets/
    └── icons/                   # PWA 图标（192px、512px）
```

## Backlog（暂不开发）

- Pre/Post 请求脚本（Web Worker 沙盒执行）
- 自动化测试 & 断言
- Mock 服务（Service Worker 拦截真实请求返回 Mock 数据）
- 文档生成（Markdown / OpenAPI 导出）
- HAR 格式导入（从浏览器 DevTools 网络面板导入抓包）
- GraphQL 支持
- WebSocket 支持
- 团队协作 / 分享链接
