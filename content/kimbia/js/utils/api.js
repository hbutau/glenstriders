/**
 * Kimbia API utility — thin wrapper around fetch with JWT support.
 */
const Api = (function () {
  'use strict';

  // Defaults to a same-origin relative path (normal deployment, or when
  // this app is reverse-proxied under a subpath like /kimbia/api/v1).
  // Set `window.KIMBIA_API_BASE` before this script loads to point the
  // whole SPA at a Kimbia instance hosted on another origin — e.g. when
  // the SPA assets themselves are copied onto an external static site
  // instead of being reverse-proxied. See
  // docs/glenstriders_spa_deployment.rst for details.
  const BASE = window.KIMBIA_API_BASE || '/api/v1';

  function getToken() {
    return localStorage.getItem('kimbia_access');
  }

  function getRefreshToken() {
    return localStorage.getItem('kimbia_refresh');
  }

  function storeTokens(access, refresh) {
    localStorage.setItem('kimbia_access', access);
    if (refresh) localStorage.setItem('kimbia_refresh', refresh);
  }

  function clearTokens() {
    localStorage.removeItem('kimbia_access');
    localStorage.removeItem('kimbia_refresh');
  }

  async function refreshAccess() {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const resp = await fetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!resp.ok) { clearTokens(); throw new Error('Session expired'); }
    const data = await resp.json();
    storeTokens(data.access, data.refresh);
    return data.access;
  }

  async function request(method, path, body, retry) {
    if (retry === undefined) retry = true;
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var opts = { method: method, headers: headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    var resp = await fetch(BASE + path, opts);

    if (resp.status === 401 && retry) {
      try {
        await refreshAccess();
        return request(method, path, body, false);
      } catch (_) {
        clearTokens();
        window.location.reload();
      }
    }

    if (!resp.ok) {
      var errData;
      try { errData = await resp.json(); } catch (_) { errData = {}; }
      var msg = errData.detail || JSON.stringify(errData) || ('HTTP ' + resp.status);
      throw new Error(msg);
    }

    if (resp.status === 204) return null;
    return resp.json();
  }

  return {
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    patch: function (path, body) { return request('PATCH', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path, body) { return request('DELETE', path, body); },
    storeTokens: storeTokens,
    clearTokens: clearTokens,
    getToken: getToken,
  };
})();
