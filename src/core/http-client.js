// fetch wrapper - request sending, timing, error handling

export async function sendRequest({
  method,
  url,
  headers = [],
  params = [],
  body = { type: 'none', content: '' },
}) {
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
        const pairs = (body.content ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const idx = line.indexOf('=');
            if (idx === -1) return null;
            return `${encodeURIComponent(line.slice(0, idx).trim())}=${encodeURIComponent(line.slice(idx + 1).trim())}`;
          })
          .filter(Boolean);
        fetchBody = pairs.join('&');
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
    });

    const duration = Math.round(performance.now() - startTime);
    const bodyText = await response.text();
    const size = new TextEncoder().encode(bodyText).length;

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: bodyText,
      duration,
      size,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    return {
      error: err.message,
      duration,
    };
  }
}
