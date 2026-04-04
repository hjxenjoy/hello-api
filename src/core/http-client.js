// fetch wrapper - request sending, timing, error handling

import { t } from './i18n.js';

export async function sendRequest({
  method,
  url,
  headers = [],
  params = [],
  body = { type: 'none', content: '' },
  signal,
} = {}) {
  // Build URL with query params
  let finalUrl = url;
  const enabledParams = params.filter((p) => p.enabled !== false && p.key);
  if (enabledParams.length > 0) {
    const separator = url.includes('?') ? '&' : '?';
    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value ?? '')}`)
      .join('&');
    finalUrl = `${url}${separator}${queryString}`;
  }

  // Build headers object
  const headersObj = {};
  for (const h of headers) {
    if (h.enabled !== false && h.key) {
      headersObj[h.key] = h.value ?? '';
    }
  }

  // Build body
  let fetchBody;
  if (method !== 'GET' && method !== 'HEAD') {
    switch (body.type) {
      case 'json':
        headersObj['Content-Type'] = headersObj['Content-Type'] ?? 'application/json';
        fetchBody = body.content;
        break;
      case 'form-urlencoded': {
        headersObj['Content-Type'] = 'application/x-www-form-urlencoded';
        if (Array.isArray(body.pairs)) {
          fetchBody = body.pairs
            .filter((p) => p.enabled !== false && p.key)
            .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value ?? '')}`)
            .join('&');
        } else {
          // legacy text content fallback
          const pairs = (body.content ?? '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => {
              const idx = l.indexOf('=');
              if (idx === -1) return null;
              return `${encodeURIComponent(l.slice(0, idx).trim())}=${encodeURIComponent(l.slice(idx + 1).trim())}`;
            })
            .filter(Boolean);
          fetchBody = pairs.join('&');
        }
        break;
      }
      case 'raw':
        headersObj['Content-Type'] = headersObj['Content-Type'] ?? body.contentType ?? 'text/plain';
        fetchBody = body.content;
        break;
      case 'none':
      default:
        fetchBody = undefined;
    }
  }

  const startTime = performance.now();

  try {
    const response = await fetch(finalUrl, {
      method,
      headers: headersObj,
      body: fetchBody,
      signal,
    });

    const duration = Math.round(performance.now() - startTime);

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const contentType = responseHeaders['content-type'] ?? '';
    // Binary types: read as blob for preview; SVG is text-based so excluded
    const isBinary = /^(image\/(?!svg\+xml)|audio\/|video\/|application\/pdf)/i.test(contentType);

    let bodyText,
      blobUrl = null,
      size;
    if (isBinary) {
      const blob = await response.blob();
      size = blob.size;
      blobUrl = URL.createObjectURL(blob);
      bodyText = t('res.binaryContent', { type: contentType });
    } else {
      bodyText = await response.text();
      size = new TextEncoder().encode(bodyText).length;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: bodyText,
      blobUrl,
      duration,
      size,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    if (err.name === 'AbortError') {
      return { cancelled: true, duration };
    }
    let message = err.message;
    if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(message)) {
      message +=
        '\n\n可能原因：① 服务器 CORS 限制（未允许跨域请求）② 网络不可达或已断开 ③ URL 地址错误';
    }
    return { error: message, duration };
  }
}
