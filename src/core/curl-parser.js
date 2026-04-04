// cURL command parser — converts a curl string into a request object

/**
 * Parse a curl command string into a partial request object.
 * Returns null if the input doesn't look like a valid curl command.
 *
 * @param {string} cmd
 * @returns {{ method: string, url: string, headers: Array, params: Array, body: object, auth: object } | null}
 */
export function parseCurl(cmd) {
  if (!cmd) return null;
  const normalized = cmd.trim().replace(/\\\n\s*/g, ' ');
  if (!/^curl\b/i.test(normalized)) return null;

  const tokens = tokenize(normalized);
  if (tokens.length < 2) return null;

  let method = null;
  let url = null;
  const headers = [];
  let rawBody = null;
  const formPairs = [];
  let username = null;
  let password = null;
  let isDataGet = false;

  for (let i = 1; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok === '-X' || tok === '--request') {
      method = tokens[++i]?.toUpperCase();
    } else if (tok === '-H' || tok === '--header') {
      const hdr = tokens[++i] ?? '';
      const ci = hdr.indexOf(':');
      if (ci > 0) {
        headers.push({
          key: hdr.slice(0, ci).trim(),
          value: hdr.slice(ci + 1).trim(),
          enabled: true,
        });
      }
    } else if (
      tok === '-d' ||
      tok === '--data' ||
      tok === '--data-raw' ||
      tok === '--data-ascii' ||
      tok === '--data-binary'
    ) {
      rawBody = tokens[++i] ?? '';
    } else if (tok === '--data-urlencode') {
      const pair = tokens[++i] ?? '';
      const ei = pair.indexOf('=');
      formPairs.push({
        key: ei >= 0 ? safeDecodeURI(pair.slice(0, ei)) : pair,
        value: ei >= 0 ? safeDecodeURI(pair.slice(ei + 1)) : '',
        enabled: true,
      });
    } else if (tok === '-F' || tok === '--form' || tok === '--form-string') {
      const pair = tokens[++i] ?? '';
      const ei = pair.indexOf('=');
      formPairs.push({
        key: ei >= 0 ? pair.slice(0, ei) : pair,
        value: ei >= 0 ? pair.slice(ei + 1) : '',
        enabled: true,
      });
    } else if (tok === '-u' || tok === '--user') {
      const creds = tokens[++i] ?? '';
      const ci = creds.indexOf(':');
      username = ci >= 0 ? creds.slice(0, ci) : creds;
      password = ci >= 0 ? creds.slice(ci + 1) : '';
    } else if (tok === '-G' || tok === '--get') {
      isDataGet = true;
    } else if (tok === '-I' || tok === '--head') {
      method = method ?? 'HEAD';
    } else if (tok === '--url') {
      url = tokens[++i];
    } else if (
      tok === '-m' ||
      tok === '--max-time' ||
      tok === '--connect-timeout' ||
      tok === '--retry' ||
      tok === '-o' ||
      tok === '--output' ||
      tok === '-A' ||
      tok === '--user-agent' ||
      tok === '--proxy' ||
      tok === '-x' ||
      tok === '-e' ||
      tok === '--referer' ||
      tok === '--cacert' ||
      tok === '--cert' ||
      tok === '--key' ||
      tok === '--pass' ||
      tok === '--resolve' ||
      tok === '--dns-servers'
    ) {
      i++; // skip value
    } else if (!tok.startsWith('-')) {
      url = url ?? tok;
    }
    // boolean flags (no value) — silently ignored
  }

  if (!url) return null;

  // Determine body type
  let bodyType = 'none';
  let bodyContent = '';
  let bodyPairs = [];
  let bodyContentType = 'text/plain';

  const ctHeader = headers.find((h) => h.key.toLowerCase() === 'content-type');
  const ct = ctHeader?.value?.toLowerCase() ?? '';

  if (rawBody !== null) {
    if (ct.includes('application/json') || (!ct && isLikelyJson(rawBody))) {
      bodyType = 'json';
      bodyContent = rawBody;
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      bodyType = 'form-urlencoded';
      bodyPairs = parseFormBody(rawBody);
    } else {
      bodyType = 'raw';
      bodyContent = rawBody;
      bodyContentType = ctHeader?.value ?? 'text/plain';
    }
  } else if (formPairs.length > 0) {
    bodyType = 'form-urlencoded';
    bodyPairs = formPairs;
  }

  // Determine method
  if (!method) {
    method = rawBody !== null || formPairs.length > 0 ? (isDataGet ? 'GET' : 'POST') : 'GET';
  }

  // Resolve auth from headers or -u flag
  let auth = { type: 'none' };
  const authHeader = headers.find((h) => h.key.toLowerCase() === 'authorization');
  if (authHeader) {
    const val = authHeader.value;
    if (/^bearer /i.test(val)) {
      auth = { type: 'bearer', token: val.slice(7).trim() };
      headers.splice(headers.indexOf(authHeader), 1);
    } else if (/^basic /i.test(val)) {
      try {
        const decoded = atob(val.slice(6).trim());
        const ci = decoded.indexOf(':');
        auth = {
          type: 'basic',
          username: ci >= 0 ? decoded.slice(0, ci) : decoded,
          password: ci >= 0 ? decoded.slice(ci + 1) : '',
        };
        headers.splice(headers.indexOf(authHeader), 1);
      } catch {
        // leave auth as none if base64 decode fails
      }
    }
  } else if (username !== null) {
    auth = { type: 'basic', username, password: password ?? '' };
  }

  return {
    method,
    url,
    headers,
    params: [],
    body: {
      type: bodyType,
      content: bodyContent,
      pairs: bodyPairs,
      contentType: bodyContentType,
    },
    auth,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function tokenize(str) {
  const tokens = [];
  let i = 0;
  const len = str.length;

  while (i < len) {
    // Skip spaces / tabs
    while (i < len && (str[i] === ' ' || str[i] === '\t')) i++;
    if (i >= len) break;

    let tok = '';

    // $'...' ANSI-C quoting (common in browser DevTools curl export)
    if (str[i] === '$' && str[i + 1] === "'") {
      i += 2;
      while (i < len && str[i] !== "'") {
        if (str[i] === '\\' && i + 1 < len) {
          i++;
          const esc = str[i++];
          switch (esc) {
            case 'n':
              tok += '\n';
              break;
            case 't':
              tok += '\t';
              break;
            case 'r':
              tok += '\r';
              break;
            case '\\':
              tok += '\\';
              break;
            case "'":
              tok += "'";
              break;
            default:
              tok += '\\' + esc;
          }
        } else {
          tok += str[i++];
        }
      }
      if (i < len) i++; // closing quote
      tokens.push(tok);
      continue;
    }

    // Normal token — may include quoted segments
    while (i < len && str[i] !== ' ' && str[i] !== '\t') {
      const ch = str[i];
      if (ch === "'") {
        i++;
        while (i < len && str[i] !== "'") tok += str[i++];
        if (i < len) i++; // closing '
      } else if (ch === '"') {
        i++;
        while (i < len && str[i] !== '"') {
          if (str[i] === '\\' && i + 1 < len) {
            i++;
            tok += str[i++];
          } else {
            tok += str[i++];
          }
        }
        if (i < len) i++; // closing "
      } else {
        tok += str[i++];
      }
    }

    if (tok) tokens.push(tok);
  }

  return tokens;
}

function isLikelyJson(str) {
  const s = str.trim();
  if (!s) return false;
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try {
      JSON.parse(s);
      return true;
    } catch {
      // not valid json
    }
  }
  return false;
}

function parseFormBody(str) {
  return str
    .split('&')
    .filter(Boolean)
    .map((pair) => {
      const ei = pair.indexOf('=');
      const key = ei >= 0 ? pair.slice(0, ei) : pair;
      const val = ei >= 0 ? pair.slice(ei + 1) : '';
      return { key: safeDecodeURI(key), value: safeDecodeURI(val), enabled: true };
    });
}

function safeDecodeURI(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
