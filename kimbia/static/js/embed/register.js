/**
 * Kimbia — public registration widget (embed/register.js)
 * ---------------------------------------------------------------------
 * Drop this script into any external static site (e.g. glenstriders.co.zw)
 * to let visitors register for Kimbia directly, using JavaScript `fetch`
 * against the REST API (`POST /api/v1/auth/register/`). No build step,
 * no framework and no cookies required — only CORS, which must allow the
 * embedding site's origin via the `CORS_ALLOWED_ORIGINS` setting.
 *
 * If this script cannot run (JavaScript disabled, blocked, etc.) use the
 * htmx/no-JS fallback instead: embed `{DJANGO_HOST}/register/embed/` in an
 * <iframe>.
 *
 * Usage:
 *   <form data-kimbia-register>
 *     <input name="first_name" required>
 *     <input name="last_name" required>
 *     <input name="email" type="email" required>
 *     <input name="phone">
 *     <input name="password" type="password" required>
 *     <input name="password_confirm" type="password" required>
 *     <button type="submit">Join</button>
 *     <div data-kimbia-register-message></div>
 *   </form>
 *   <script>window.KIMBIA_API_BASE = 'https://app.kimbia.co.zw/api/v1';</script>
 *   <script src=".../embed/register.js"></script>
 */
(function () {
  'use strict';

  var FIELDS = [
    'first_name', 'last_name', 'email', 'phone', 'password', 'password_confirm',
  ];

  function apiBase() {
    return window.KIMBIA_API_BASE || '/api/v1';
  }

  function collectData(form) {
    var data = {};
    FIELDS.forEach(function (name) {
      var el = form.elements.namedItem(name);
      if (el) data[name] = el.value;
    });
    return data;
  }

  function showMessage(form, text, isError) {
    var target = form.querySelector('[data-kimbia-register-message]');
    if (!target) return;
    target.textContent = text;
    target.classList.toggle('kimbia-error', !!isError);
    target.classList.toggle('kimbia-success', !isError);
  }

  function flattenErrors(errors) {
    if (!errors || typeof errors !== 'object') return 'Registration failed.';
    return Object.keys(errors)
      .map(function (field) {
        var messages = [].concat(errors[field]);
        return field + ': ' + messages.join(' ');
      })
      .join(' ');
  }

  function handleSubmit(event) {
    var form = event.target;
    event.preventDefault();

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    showMessage(form, '', false);

    fetch(apiBase() + '/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(collectData(form)),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          showMessage(form, flattenErrors(result.body), true);
          form.dispatchEvent(new CustomEvent('kimbia:register:error', { detail: result.body }));
          return;
        }
        form.reset();
        showMessage(form, 'Welcome to Kimbia! Your account has been created.', false);
        form.dispatchEvent(new CustomEvent('kimbia:register:success', { detail: result.body }));
      })
      .catch(function (err) {
        showMessage(form, 'Could not reach Kimbia. Please try again later.', true);
        form.dispatchEvent(new CustomEvent('kimbia:register:error', { detail: { message: err.message } }));
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-kimbia-register]');
    forms.forEach(function (form) {
      form.addEventListener('submit', handleSubmit);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
