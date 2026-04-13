const BASE = '/api';

function getToken() { return localStorage.getItem('bf_token'); }
function getUser() { return localStorage.getItem('bf_user'); }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

async function request(method, path, body) {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (res.status === 401) { logout(); return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),

  download: async (path, filename) => {
    const res = await fetch(BASE + path, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) { showToast('Download failed', 'error'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
};

function logout() {
  localStorage.removeItem('bf_token');
  localStorage.removeItem('bf_user');
  window.location.href = '/pages/login.html';
}

function requireAuth() {
  if (!getToken()) { window.location.href = '/pages/login.html'; return false; }
  const el = document.getElementById('sidebar-user');
  if (el) el.textContent = getUser() || 'Owner';
  return true;
}

// Toast notifications
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// Modal helpers
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Number formatting
function fmtRupee(n) {
  return '₹' + parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(s) {
  const map = { paid: 'success', unpaid: 'danger', partial: 'warning' };
  return `<span class="badge badge-${map[s] || 'gray'}">${s}</span>`;
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
  }
});
