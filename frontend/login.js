/* ─────────────────────────────────────────
   LOGIN.JS  —  TaskFlow Login Page
   Django REST Framework JWT Auth
───────────────────────────────────────── */

'use strict';

// ── Config ────────────────────────────────
const LOGIN_PATH = '/api/token/';       // JWT endpoint (obtain pair)
const REDIRECT_AFTER_LOGIN = 'index.html';   // todo page

// ── Selectors ─────────────────────────────
const form        = document.getElementById('loginForm');
const btnSubmit   = document.getElementById('btnSubmit');
const alertBox    = document.getElementById('alert');
const apiBaseInput = document.getElementById('apiBase');
const connDot     = document.getElementById('connDot');
const togglePassBtn = document.getElementById('togglePass');
const passwordInput = document.getElementById('password');

// ── Helpers ───────────────────────────────

/** Build the full URL from the API base field */
function apiUrl(path) {
  return apiBaseInput.value.replace(/\/$/, '') + path;
}

/** Show / hide the alert banner */
function showAlert(msg, type = 'error') {
  alertBox.textContent = msg;
  alertBox.className   = `alert ${type}`;
}
function hideAlert() {
  alertBox.className   = 'alert';
  alertBox.textContent = '';
}

/** Mark a field as having an error */
function setFieldError(fieldId, msg) {
  const group = document.getElementById(`group-${fieldId}`);
  const errEl = document.getElementById(`err-${fieldId}`);
  if (group) group.classList.add('has-error');
  if (errEl) errEl.textContent = msg;
}

/** Clear field error */
function clearFieldError(fieldId) {
  const group = document.getElementById(`group-${fieldId}`);
  const errEl = document.getElementById(`err-${fieldId}`);
  if (group) group.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
}

/** Toggle loading state on the submit button */
function setLoading(on) {
  btnSubmit.disabled = on;
  btnSubmit.classList.toggle('loading', on);
}

/** Set connection dot state */
function setConnected(state) {
  connDot.className = 'conn-dot' + (state === 'connected' ? ' connected' : state === 'error' ? ' error' : '');
}

/** Save auth token(s) to localStorage + optionally save API base */
function saveAuthData(data, apiBase) {
  if (data.access)  localStorage.setItem('access_token',  data.access);
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
  if (data.token)   localStorage.setItem('access_token',  data.token);   // fallback
  if (data.key)     localStorage.setItem('access_token',  data.key);     // fallback
  // Save API base URL for the todo page
  if (apiBase) localStorage.setItem('api_base_url', apiBase.replace(/\/$/, ''));
}

// ── Validation ─────────────────────────────
function validateForm(username, password) {
  let valid = true;

  clearFieldError('username');
  clearFieldError('password');
  hideAlert();

  if (!username.trim()) {
    setFieldError('username', 'Username is required.');
    valid = false;
  } else if (username.trim().length < 3) {
    setFieldError('username', 'Username must be at least 3 characters.');
    valid = false;
  }

  if (!password) {
    setFieldError('password', 'Password is required.');
    valid = false;
  } else if (password.length < 6) {
    setFieldError('password', 'Password must be at least 6 characters.');
    valid = false;
  }

  return valid;
}

// ── Password Toggle ────────────────────────
togglePassBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePassBtn.querySelector('.eye-open').classList.toggle('hidden', isPassword);
  togglePassBtn.querySelector('.eye-closed').classList.toggle('hidden', !isPassword);
});

// ── Real-time field clear on input ─────────
document.getElementById('username').addEventListener('input', () => clearFieldError('username'));
passwordInput.addEventListener('input', () => clearFieldError('password'));

// ── Form Submit ────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = passwordInput.value;
  const remember = document.getElementById('remember').checked;
  const apiBase  = apiBaseInput.value.replace(/\/$/, '');

  if (!validateForm(username, password)) return;

  setLoading(true);
  hideAlert();

  const payload = { username: username.trim(), password };

  try {
    const response = await fetch(apiUrl(LOGIN_PATH), {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setConnected('connected');
      saveAuthData(data, apiBase);

      if (remember) {
        localStorage.setItem('saved_username', username.trim());
      } else {
        localStorage.removeItem('saved_username');
      }

      showAlert('Login successful! Redirecting…', 'success');

      setTimeout(() => {
        window.location.href = REDIRECT_AFTER_LOGIN;
      }, 900);
    } else {
      setConnected('error');
      let errorMsg = 'Invalid username or password.';

      if (data.detail)              errorMsg = data.detail;
      else if (data.non_field_errors) errorMsg = data.non_field_errors[0];
      else if (data.username)       { setFieldError('username', data.username[0]); errorMsg = null; }
      else if (data.password)       { setFieldError('password', data.password[0]); errorMsg = null; }

      if (errorMsg) showAlert(errorMsg, 'error');
    }
  } catch (err) {
    setConnected('error');
    showAlert('Could not reach the server. Make sure Django is running and CORS is enabled.', 'error');
    console.error('[TaskFlow] Login error:', err);
  } finally {
    setLoading(false);
  }
});

// ── Restore saved username ─────────────────
(function restoreUsername() {
  const saved = localStorage.getItem('saved_username');
  if (saved) {
    document.getElementById('username').value = saved;
    document.getElementById('remember').checked = true;
  }
})();

// ── Restore saved API base ─────────────────
(function restoreApiBase() {
  const savedApi = localStorage.getItem('api_base_url');
  if (savedApi) apiBaseInput.value = savedApi;
})();

// ── Ping backend on load ───────────────────
(async function pingBackend() {
  try {
    const res = await fetch(apiUrl('/api/'), { method: 'GET' });
    setConnected(res.ok || res.status === 401 ? 'connected' : 'error');
  } catch {
    try {
      await fetch(apiBaseInput.value, { method: 'HEAD', mode: 'no-cors' });
      setConnected('connected');
    } catch {
      setConnected('error');
    }
  }
})();

// ── Re-ping when API base changes ─────────
let pingDebounce;
apiBaseInput.addEventListener('input', () => {
  clearTimeout(pingDebounce);
  setConnected('idle');
  pingDebounce = setTimeout(async () => {
    try {
      const res = await fetch(apiUrl('/api/'), { method: 'GET' });
      setConnected(res.ok || res.status === 401 || res.status === 403 ? 'connected' : 'error');
    } catch {
      setConnected('error');
    }
  }, 600);
});