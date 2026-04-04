// Internationalization — bilingual zh / en support

const LS_KEY = 'hapi-locale';

const TRANSLATIONS = {
  zh: {
    // app-shell
    'app.offline': '已离线',
    'app.noEnv': '无环境',
    'app.noRequest': '从左侧选择或新建一个请求',
    'app.menuTitle': '菜单',
    'app.toggleTheme': '切换主题',
    'app.toggleEnv': '切换环境',

    // sidebar
    'sidebar.title': '项目',
    'sidebar.newRequest': '快速新建请求',
    'sidebar.newProject': '新建项目',
    'sidebar.export': '导出所有数据',
    'sidebar.import': '从文件导入',
    'sidebar.envVars': '环境变量',
    'sidebar.emptyTitle': '暂无项目',
    'sidebar.emptyHint': '点击 + 新建项目，或直接新建请求',
    'sidebar.search': '搜索请求…',
    'sidebar.swTooltip': '注销 Service Worker',
    'sidebar.editBtn': '编辑',
    'sidebar.newCollectionBtn': '新建集合',
    'sidebar.deleteProjectBtn': '删除项目',
    'sidebar.renameBtn': '重命名',
    'sidebar.duplicateBtn': '复制请求',
    'sidebar.deleteReqBtn': '删除请求',
    'sidebar.deleteCollectionBtn': '删除集合',
    'sidebar.addRequestBtn': '新建请求',
    // dialogs
    'sidebar.newProjectTitle': '新建项目',
    'sidebar.nameLabel': '名称',
    'sidebar.namePlaceholder': '项目名称',
    'sidebar.descLabel': '备注',
    'sidebar.descPlaceholder': '可选备注（可留空）',
    'sidebar.saveLabel': '保存',
    'sidebar.editProjectTitle': '编辑项目',
    'sidebar.deleteProjectConfirm': '确认删除该项目及其所有集合与请求？此操作不可撤销。',
    'sidebar.deleteProjectTitle': '删除项目',
    'sidebar.deleteLabel': '删除',
    'sidebar.newCollectionTitle': '新建集合',
    'sidebar.collNamePlaceholder': '集合名称',
    'sidebar.editCollectionTitle': '编辑集合',
    'sidebar.deleteCollConfirm': '确认删除该集合及其所有请求？此操作不可撤销。',
    'sidebar.deleteCollTitle': '删除集合',
    'sidebar.renameReqTitle': '重命名请求',
    'sidebar.renameReqPlaceholder': '请求名称',
    'sidebar.deleteReqConfirm': '确认删除该请求？此操作不可撤销。',
    'sidebar.deleteReqTitle': '删除请求',
    'sidebar.swNone': '当前没有已注册的 Service Worker。',
    'sidebar.swTitle': 'Service Worker',
    'sidebar.swOk': '知道了',
    'sidebar.swConfirmMsg':
      '将注销 {count} 个 Service Worker，页面随后自动刷新。缓存的资源文件会被清除。',
    'sidebar.swConfirmTitle': '注销 Service Worker',
    'sidebar.swConfirmBtn': '注销并刷新',
    'sidebar.importSuccessTitle': '导入成功',
    'sidebar.importSuccessMsg': '成功导入 {projects} 个项目，共 {requests} 条请求。',
    'sidebar.importFailTitle': '导入错误',
    'sidebar.importOk': '确定',
    'sidebar.importInvalid': '无效的导入文件格式',
    'sidebar.defaultName': '默认',
    'sidebar.newRequestName': '新请求',

    // request editor
    'req.namePlaceholder': '请求名称',
    'req.descPlaceholder': '添加备注…',
    'req.send': '发送',
    'req.sending': '发送中…',
    'req.copyAsCurl': '复制为 cURL',
    'req.curlCopied': '已复制！',
    'req.tabParams': 'Params',
    'req.tabHeaders': 'Headers',
    'req.tabBody': 'Body',
    'req.tabAuth': 'Auth',
    'req.addParam': '+ 添加参数',
    'req.addHeader': '+ 添加 Header',
    'req.bodyNone': '无',
    'req.bodyJson': 'JSON',
    'req.bodyForm': 'Form',
    'req.bodyRaw': 'Raw',
    'req.bodyNoneHint': '该请求无 Body',
    'req.addFormField': '+ 添加字段',
    'req.formatJson': '格式化',
    'req.authType': '认证类型',
    'req.authNone': '无',
    'req.authBearer': 'Bearer Token',
    'req.authBasic': 'Basic Auth',
    'req.authApiKey': 'API Key',
    'req.authToken': 'Token',
    'req.authTokenPlaceholder': 'Bearer token 值',
    'req.authUsername': '用户名',
    'req.authUsernamePlaceholder': '用户名',
    'req.authPassword': '密码',
    'req.authPasswordPlaceholder': '密码',
    'req.authKey': 'Key',
    'req.authKeyPlaceholder': 'Header / 参数名',
    'req.authValue': 'Value',
    'req.authValuePlaceholder': 'API Key 值',
    'req.authAddTo': '添加到',
    'req.authHeader': 'Header',
    'req.authQuery': 'Query Params',
    'req.authEmpty': '未配置认证',
    'req.cancel': '取消',

    // response viewer
    'res.title': '响应',
    'res.tabBody': 'Body',
    'res.tabHeaders': 'Headers',
    'res.tabPreview': 'Preview',
    'res.copy': '复制',
    'res.copied': '已复制！',
    'res.empty': '发送请求后查看响应',
    'res.sending': '发送中…',
    'res.sendingBadge': '发送中',
    'res.error': '错误',
    'res.headerName': '名称',
    'res.headerValue': '值',
    'res.noPreview': '发送请求后查看预览',
    'res.failPreview': '请求失败，无内容可预览',
    'res.unsupportedPreview': '此内容类型不支持预览',
    'res.unsupportedBinary': '不支持预览此类型',
    'res.cached': '缓存',
    'res.durationLabel': '耗时',
    'res.sizeLabel': '大小',
    'res.cancelled': '已取消',
    'res.tabHistory': '历史',
    'res.historyEmpty': '暂无历史记录',
    'res.historyClear': '清除',
    'res.historyCount': '{count} 条记录',
    'res.binaryContent': '[二进制内容 · {type}]',

    // env manager
    'env.title': '环境变量',
    'env.newEnvTitle': '新建环境',
    'env.closeTitle': '关闭',
    'env.addVar': '+ 添加变量',
    'env.empty': '暂无环境，点击 + 创建',
    'env.newEnvPrompt': '新建环境',
    'env.newEnvPlaceholder': '环境名称，如：开发、生产',
    'env.deleteConfirm': '确认删除该环境及其所有变量？',
    'env.deleteTitle': '删除环境',
    'env.deleteBtn': '删除',
    'env.varNamePlaceholder': '变量名',
    'env.varValuePlaceholder': '值',
    'env.deleteEnvItem': '删除',
    'env.varsHeaderPrefix': '变量 — ',

    // storage indicator
    'storage.na': '存储: N/A',
    'storage.settingsTitle': '配置存储预警阈值',
    'storage.settingsFormTitle': '存储预警阈值',
    'storage.warnLabel': '黄色预警（MB）',
    'storage.dangerLabel': '红色警告（MB）',
    'storage.warnPlaceholder': '例如 100',
    'storage.dangerPlaceholder': '例如 1024',
    'storage.save': '保存',

    // dialog
    'dialog.cancel': '取消',
    'dialog.confirm': '确认',
    'dialog.save': '保存',
  },

  en: {
    // app-shell
    'app.offline': 'Offline',
    'app.noEnv': 'No Env',
    'app.noRequest': 'Select or create a request from the sidebar',
    'app.menuTitle': 'Menu',
    'app.toggleTheme': 'Toggle theme',
    'app.toggleEnv': 'Switch environment',

    // sidebar
    'sidebar.title': 'Projects',
    'sidebar.newRequest': 'Quick add request',
    'sidebar.newProject': 'New project',
    'sidebar.export': 'Export all data',
    'sidebar.import': 'Import from file',
    'sidebar.envVars': 'Environments',
    'sidebar.emptyTitle': 'No projects yet',
    'sidebar.emptyHint': 'Click + to add a project, or add a request directly',
    'sidebar.search': 'Search requests…',
    'sidebar.swTooltip': 'Unregister Service Worker',
    'sidebar.editBtn': 'Edit',
    'sidebar.newCollectionBtn': 'New collection',
    'sidebar.deleteProjectBtn': 'Delete project',
    'sidebar.renameBtn': 'Rename',
    'sidebar.duplicateBtn': 'Duplicate request',
    'sidebar.deleteReqBtn': 'Delete request',
    'sidebar.deleteCollectionBtn': 'Delete collection',
    'sidebar.addRequestBtn': 'New request',
    // dialogs
    'sidebar.newProjectTitle': 'New Project',
    'sidebar.nameLabel': 'Name',
    'sidebar.namePlaceholder': 'Project name',
    'sidebar.descLabel': 'Description',
    'sidebar.descPlaceholder': 'Optional description',
    'sidebar.saveLabel': 'Save',
    'sidebar.editProjectTitle': 'Edit Project',
    'sidebar.deleteProjectConfirm':
      'Delete this project and all its collections and requests? This cannot be undone.',
    'sidebar.deleteProjectTitle': 'Delete Project',
    'sidebar.deleteLabel': 'Delete',
    'sidebar.newCollectionTitle': 'New Collection',
    'sidebar.collNamePlaceholder': 'Collection name',
    'sidebar.editCollectionTitle': 'Edit Collection',
    'sidebar.deleteCollConfirm':
      'Delete this collection and all its requests? This cannot be undone.',
    'sidebar.deleteCollTitle': 'Delete Collection',
    'sidebar.renameReqTitle': 'Rename Request',
    'sidebar.renameReqPlaceholder': 'Request name',
    'sidebar.deleteReqConfirm': 'Delete this request? This cannot be undone.',
    'sidebar.deleteReqTitle': 'Delete Request',
    'sidebar.swNone': 'No Service Worker is currently registered.',
    'sidebar.swTitle': 'Service Worker',
    'sidebar.swOk': 'OK',
    'sidebar.swConfirmMsg':
      'Unregister {count} Service Worker(s) and reload. Cached assets will be cleared.',
    'sidebar.swConfirmTitle': 'Unregister Service Worker',
    'sidebar.swConfirmBtn': 'Unregister & Reload',
    'sidebar.importSuccessTitle': 'Import Successful',
    'sidebar.importSuccessMsg': 'Imported {projects} project(s) with {requests} request(s).',
    'sidebar.importFailTitle': 'Import Error',
    'sidebar.importOk': 'OK',
    'sidebar.importInvalid': 'Invalid import file format',
    'sidebar.defaultName': 'Default',
    'sidebar.newRequestName': 'New Request',

    // request editor
    'req.namePlaceholder': 'Request name',
    'req.descPlaceholder': 'Add a description…',
    'req.send': 'Send',
    'req.sending': 'Sending…',
    'req.copyAsCurl': 'Copy as cURL',
    'req.curlCopied': 'Copied!',
    'req.tabParams': 'Params',
    'req.tabHeaders': 'Headers',
    'req.tabBody': 'Body',
    'req.tabAuth': 'Auth',
    'req.addParam': '+ Add Param',
    'req.addHeader': '+ Add Header',
    'req.bodyNone': 'None',
    'req.bodyJson': 'JSON',
    'req.bodyForm': 'Form',
    'req.bodyRaw': 'Raw',
    'req.bodyNoneHint': 'No body for this request',
    'req.addFormField': '+ Add Field',
    'req.formatJson': 'Format',
    'req.authType': 'Auth Type',
    'req.authNone': 'None',
    'req.authBearer': 'Bearer Token',
    'req.authBasic': 'Basic Auth',
    'req.authApiKey': 'API Key',
    'req.authToken': 'Token',
    'req.authTokenPlaceholder': 'Bearer token value',
    'req.authUsername': 'Username',
    'req.authUsernamePlaceholder': 'Username',
    'req.authPassword': 'Password',
    'req.authPasswordPlaceholder': 'Password',
    'req.authKey': 'Key',
    'req.authKeyPlaceholder': 'Header / param name',
    'req.authValue': 'Value',
    'req.authValuePlaceholder': 'API Key value',
    'req.authAddTo': 'Add to',
    'req.authHeader': 'Header',
    'req.authQuery': 'Query Params',
    'req.authEmpty': 'No authentication configured',
    'req.cancel': 'Cancel',

    // response viewer
    'res.title': 'Response',
    'res.tabBody': 'Body',
    'res.tabHeaders': 'Headers',
    'res.tabPreview': 'Preview',
    'res.copy': 'Copy',
    'res.copied': 'Copied!',
    'res.empty': 'Send a request to see the response',
    'res.sending': 'Sending…',
    'res.sendingBadge': 'Sending',
    'res.error': 'Error',
    'res.headerName': 'Name',
    'res.headerValue': 'Value',
    'res.noPreview': 'Send a request to see the preview',
    'res.failPreview': 'Request failed, nothing to preview',
    'res.unsupportedPreview': 'Preview not supported for this content type',
    'res.unsupportedBinary': 'Preview not supported for this type',
    'res.cached': 'Cached',
    'res.durationLabel': 'Time',
    'res.sizeLabel': 'Size',
    'res.cancelled': 'Cancelled',
    'res.tabHistory': 'History',
    'res.historyEmpty': 'No history yet',
    'res.historyClear': 'Clear',
    'res.historyCount': '{count} entries',
    'res.binaryContent': '[Binary content · {type}]',

    // env manager
    'env.title': 'Environments',
    'env.newEnvTitle': 'New environment',
    'env.closeTitle': 'Close',
    'env.addVar': '+ Add Variable',
    'env.empty': 'No environments yet. Click + to create one.',
    'env.newEnvPrompt': 'New Environment',
    'env.newEnvPlaceholder': 'e.g. Development, Production',
    'env.deleteConfirm': 'Delete this environment and all its variables?',
    'env.deleteTitle': 'Delete Environment',
    'env.deleteBtn': 'Delete',
    'env.varNamePlaceholder': 'Variable name',
    'env.varValuePlaceholder': 'Value',
    'env.deleteEnvItem': 'Delete',
    'env.varsHeaderPrefix': 'Variables — ',

    // storage indicator
    'storage.na': 'Storage: N/A',
    'storage.settingsTitle': 'Storage alert thresholds',
    'storage.settingsFormTitle': 'Storage Thresholds',
    'storage.warnLabel': 'Warning (MB)',
    'storage.dangerLabel': 'Danger (MB)',
    'storage.warnPlaceholder': 'e.g. 100',
    'storage.dangerPlaceholder': 'e.g. 1024',
    'storage.save': 'Save',

    // dialog
    'dialog.cancel': 'Cancel',
    'dialog.confirm': 'Confirm',
    'dialog.save': 'Save',
  },
};

function detectLocale() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved && TRANSLATIONS[saved]) return saved;
  const lang = navigator.language?.toLowerCase() ?? '';
  return lang.startsWith('zh') ? 'zh' : 'en';
}

let _locale = detectLocale();
document.documentElement.lang = _locale;

/**
 * Translate a key with optional variable substitution.
 * Variables use {name} syntax: t('sidebar.swConfirmMsg', { count: 2 })
 */
export function t(key, vars = {}) {
  const str = TRANSLATIONS[_locale]?.[key] ?? TRANSLATIONS.zh[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function getLocale() {
  return _locale;
}

export function setLocale(locale) {
  if (!TRANSLATIONS[locale] || locale === _locale) return;
  _locale = locale;
  localStorage.setItem(LS_KEY, locale);
  document.documentElement.lang = locale;
  window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale } }));
}

/**
 * Apply i18n to a shadow root or element by reading data-i18n* attributes:
 *   data-i18n             → textContent
 *   data-i18n-title       → title attribute
 *   data-i18n-placeholder → placeholder attribute
 *   data-i18n-tooltip     → data-tooltip attribute (CSS-based tooltip)
 */
export function applyI18n(root) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-tooltip]').forEach((el) => {
    el.dataset.tooltip = t(el.dataset.i18nTooltip);
  });
}
