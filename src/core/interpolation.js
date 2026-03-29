// {{variable}} interpolation engine

export function interpolate(str, variables) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    return Object.prototype.hasOwnProperty.call(variables, trimmed) ? variables[trimmed] : match;
  });
}

export function envToVariables(environment) {
  if (!environment) return {};
  const result = {};
  for (const v of environment.variables ?? []) {
    if (v.enabled !== false && v.key) {
      result[v.key] = v.value ?? '';
    }
  }
  return result;
}

export function interpolateRequest(request, variables) {
  const interpolatedHeaders = (request.headers ?? []).map((h) => ({
    ...h,
    key: interpolate(h.key, variables),
    value: interpolate(h.value, variables),
  }));

  const interpolatedParams = (request.params ?? []).map((p) => ({
    ...p,
    key: interpolate(p.key, variables),
    value: interpolate(p.value, variables),
  }));

  const interpolatedBody = {
    ...request.body,
    content: interpolate(request.body?.content, variables),
  };

  return {
    ...request,
    url: interpolate(request.url, variables),
    headers: interpolatedHeaders,
    params: interpolatedParams,
    body: interpolatedBody,
  };
}
