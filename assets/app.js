/* ============================================================
   OMNETTWEAR HRMS — SHARED FRONTEND
   One place for the API URL, the session, the app shell, the
   icon set and every formatter. Pages stay thin.
   ============================================================ */

/* ==============================================================
   THE ONLY LINE YOU EVER NEED TO EDIT: your deployed /exec URL.

   This is your existing deployment URL, already filled in. If you
   update that same deployment with the new Code.gs (Deploy ->
   Manage deployments -> pencil -> Version: New version), the URL
   does not change and you can leave this exactly as it is.
   If you create a brand new deployment instead, paste the new
   /exec link here. Nowhere else in the project holds this URL.
   ============================================================== */
const API_URL = 'https://script.google.com/macros/s/AKfycbyPlgYKTYFBgbYfYol2CpPmB4Kj95QoKmTspNdnm4KoVw9aPn0XPUSwV4MU2LMWkvDn6A/exec';

const IDLE_MINUTES = 30;
const SK = { session: 'hrms.session', seen: 'hrms.lastSeen', settings: 'hrms.settings' };

/* ===================== ICONS (inline SVG, no font, no emoji) =====================
   The old pages put emoji straight into the HTML, and because those files were
   saved in a non-UTF-8 encoding the browser rendered garbage next to every menu
   item. SVG paths are plain ASCII, so that failure cannot happen again. */

const ICONS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'calendar-check': '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'calendar-minus': '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M9 16h6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  menu: '<line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/><path d="m2 2 20 20"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  gift: '<rect width="20" height="5" x="2" y="7" rx="1"/><path d="M12 22V7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M7.5 7a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'
};

function icon(name, size, cls) {
  const p = ICONS[name] || ICONS.info;
  return '<svg class="' + (cls || '') + '" width="' + (size || 16) + '" height="' + (size || 16) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
}

/* ===================== HELPERS ===================== */

function el(id) { return document.getElementById(id); }

/** Every value that reaches innerHTML goes through this. */
function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).map(function (w) { return w[0]; })
    .slice(0, 2).join('').toUpperCase();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

function money(n, withSymbol) {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toLocaleString('en-IN');
  return (withSymbol === false ? '' : '\u20B9') + (v < 0 ? '-' : '') + s;
}

/** '11-08-2026' -> '11 Aug 2026' */
function niceDate(dmy) {
  const p = String(dmy || '').split('-');
  if (p.length !== 3) return dmy || '\u2014';
  return p[0] + ' ' + (MONTHS[Number(p[1]) - 1] || p[1]) + ' ' + p[2];
}

/** '2026-08' -> 'August 2026' */
function niceMonth(ym) {
  const p = String(ym || '').split('-');
  if (p.length !== 2) return ym || '\u2014';
  return (MONTHS_FULL[Number(p[1]) - 1] || p[1]) + ' ' + p[0];
}

function todayDMY() { return dmy(new Date()); }
function dmy(d) {
  return String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
}
function iso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function isoToDMY(s) {
  const p = String(s || '').split('-');
  return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : '';
}
function dmyToISO(s) {
  const p = String(s || '').split('-');
  return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : '';
}
function currentYM() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function monthOfDMY(s) { const p = String(s || '').split('-'); return p.length === 3 ? p[2] + '-' + p[1] : ''; }

/** '18:45' -> '06:45 PM' (backend stores 12-hour strings) */
function to12h(t) {
  const m = String(t || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  let h = Number(m[1]);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return String(h).padStart(2, '0') + ':' + m[2] + ' ' + ap;
}

/** '06:45 PM' -> '18:45' for <input type=time> */
function to24h(t) {
  const m = String(t || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return '';
  let h = Number(m[1]);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m[2];
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigit(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}

/** Indian numbering for payslips: 1,23,456 -> "One Lakh Twenty Three Thousand..." */
function amountInWords(amount) {
  let n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return 'Zero Rupees Only';
  const parts = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = Math.floor(n / 100); n %= 100;
  if (crore) parts.push(twoDigit(crore) + ' Crore');
  if (lakh) parts.push(twoDigit(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigit(thousand) + ' Thousand');
  if (hundred) parts.push(ONES[hundred] + ' Hundred');
  if (n) parts.push((parts.length ? 'and ' : '') + twoDigit(n));
  return 'Rupees ' + parts.join(' ') + ' Only';
}

function downloadCSV(filename, rows) {
  const csv = rows.map(function (r) {
    return r.map(function (c) {
      const s = c === null || c === undefined ? '' : String(c);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',');
  }).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = filename;
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

/* ===================== SESSION ===================== */

function store() { return localStorage; }

function getSession() {
  try {
    const s = store();
    const raw = s.getItem(SK.session);
    if (!raw) return null;
    const seen = Number(s.getItem(SK.seen) || 0);
    if (seen && (Date.now() - seen) / 60000 > IDLE_MINUTES) { clearSession(); return null; }
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function setSession(profile, token, remember, settings) {
  clearSession();
  const s = localStorage;
  s.setItem(SK.session, JSON.stringify({
    employeeId: profile.employeeId, name: profile.name, role: profile.role,
    department: profile.department, designation: profile.designation,
    photoUrl: profile.photoUrl, token: token
  }));
  s.setItem(SK.seen, String(Date.now()));
  if (settings) s.setItem(SK.settings, JSON.stringify(settings));
}

/** Updates one field on the stored session in place. setSession() can't be
    used for this: it calls clearSession() first, which would also drop the
    cached settings and force a re-login. */
function patchSession(changes) {
  try {
    const s = store();
    const raw = s.getItem(SK.session);
    if (!raw) return;
    const cur = JSON.parse(raw);
    Object.keys(changes).forEach(function (k) { cur[k] = changes[k]; });
    s.setItem(SK.session, JSON.stringify(cur));
  } catch (e) { /* non-fatal: the avatar just refreshes on next load */ }
}

function clearSession() {
  [localStorage, sessionStorage].forEach(function (s) {
    s.removeItem(SK.session); s.removeItem(SK.seen); s.removeItem(SK.settings);
  });
}

function appSettings() {
  try { return JSON.parse(store().getItem(SK.settings) || '{}'); } catch (e) { return {}; }
}

function touchSession() {
  const s = store();
  if (s.getItem(SK.session)) s.setItem(SK.seen, String(Date.now()));
}

function signOut() {
  const s = getSession();
  if (s && s.token) {
    try {
      fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'logout', token: s.token }), keepalive: true });
    } catch (e) { /* leaving anyway */ }
  }
  clearSession();
  location.href = 'login.html';
}

function isAdmin() {
  const s = getSession();
  return !!s && ['admin', 'hr'].indexOf(String(s.role || '').toLowerCase()) > -1;
}

function isPC() {
  const s = getSession();
  return isAdmin() || (!!s && String(s.role || '').toLowerCase() === 'pc');
}

/* ===================== API ===================== */

function apiConfigured() { return API_URL && API_URL.indexOf('/exec') > -1 && API_URL.indexOf('PASTE') === -1; }

function handleAuthFailure(json) {
  if (json && json.code === 'NO_SESSION') {
    clearSession();
    location.href = 'login.html?expired=1';
    throw new Error(json.message);
  }
}

async function apiGet(action, params) {
  if (!apiConfigured()) throw new Error('The API URL is not set. Open assets/app.js and paste your deployed /exec link into API_URL.');
  const s = getSession() || {};
  const q = new URLSearchParams(Object.assign({ action: action, token: s.token || '' }, params || {}));
  const res = await fetch(API_URL + '?' + q.toString());
  const json = await res.json();
  handleAuthFailure(json);
  if (json.result === 'error') throw new Error(json.message || 'Request failed');
  touchSession();
  return json;
}

async function apiPost(action, body) {
  if (!apiConfigured()) throw new Error('The API URL is not set. Open assets/app.js and paste your deployed /exec link into API_URL.');
  const s = getSession() || {};
  /* No custom headers on purpose — that keeps this a "simple" request and
     avoids the CORS preflight Apps Script cannot answer. */
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(Object.assign({ action: action, token: s.token || '' }, body || {}))
  });
  const json = await res.json();
  handleAuthFailure(json);
  if (json.result === 'error') throw new Error(json.message || 'Request failed');
  touchSession();
  return json;
}

/* ===================== TOAST ===================== */

function toast(message, kind) {
  let box = el('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    box.className = 'toasts';
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  const ic = kind === 'ok' ? 'check-circle' : kind === 'bad' ? 'x-circle' : kind === 'warn' ? 'alert' : 'info';
  t.className = 'toast ' + (kind || '');
  t.innerHTML = icon(ic, 17) + '<span>' + esc(message) + '</span>';
  box.appendChild(t);
  setTimeout(function () {
    t.style.transition = 'opacity .25s, transform .25s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(14px)';
    setTimeout(function () { t.remove(); }, 260);
  }, kind === 'bad' ? 6000 : 3600);
}

/* ===================== DIALOG ===================== */

function openDialog(id) { el(id).classList.add('open'); }
function closeDialog(id) { el(id).classList.remove('open'); }

/** Promise-based confirm so destructive actions read cleanly. */
function confirmAction(opts) {
  return new Promise(function (resolve) {
    let box = el('confirmDialog');
    if (!box) {
      box = document.createElement('div');
      box.id = 'confirmDialog';
      box.className = 'overlay';
      box.innerHTML =
        '<div class="dialog narrow"><div class="dialog-head"><h3 id="cfTitle"></h3></div>' +
        '<div class="dialog-body" style="font-size:13.5px;color:var(--text-2)" id="cfBody"></div>' +
        '<div class="dialog-foot"><button class="btn" id="cfNo">Keep it</button>' +
        '<button class="btn btn-danger" id="cfYes">Confirm</button></div></div>';
      document.body.appendChild(box);
    }
    el('cfTitle').textContent = opts.title || 'Are you sure?';
    el('cfBody').textContent = opts.body || '';
    el('cfYes').textContent = opts.confirmLabel || 'Confirm';
    el('cfNo').textContent = opts.cancelLabel || 'Cancel';
    el('cfYes').className = 'btn ' + (opts.danger === false ? 'btn-primary' : 'btn-danger');
    box.classList.add('open');
    const done = function (v) { box.classList.remove('open'); resolve(v); };
    el('cfYes').onclick = function () { done(true); };
    el('cfNo').onclick = function () { done(false); };
    box.onclick = function (e) { if (e.target === box) done(false); };
  });
}

/* ===================== NAVIGATION MODEL ===================== */

/* ===================== CALENDAR COLORS ===================== */
/* Admin can override every one of these from Administration -> Holidays &
   policy -> Calendar colors. Values live in the Settings sheet; these are
   only the fallback used until an admin sets a preference (or after they
   reset one back to default). */
const STATUS_COLOR_KEYS = {
  'Present': 'COLOR_STATUS_PRESENT', 'Absent': 'COLOR_STATUS_ABSENT',
  'Half-Day': 'COLOR_STATUS_HALFDAY', 'Leave': 'COLOR_STATUS_LEAVE',
  'Holiday': 'COLOR_STATUS_HOLIDAY', 'Week-off': 'COLOR_STATUS_WEEKOFF',
  'Blank (nothing marked)': 'COLOR_STATUS_BLANK'
};
const DEFAULT_STATUS_COLORS = {
  'Present': '#2FDC46', 'Absent': '#FF3333', 'Half-Day': '#3B82F6',
  'Leave': '#F5A623', 'Holiday': '#8B5CF6', 'Week-off': '#9CA3AF',
  'Blank (nothing marked)': '#E9ECF3'
};
const HOLTYPE_COLOR_KEYS = {
  'Public Holiday': 'COLOR_HOLTYPE_PUBLIC', 'Restricted Holiday': 'COLOR_HOLTYPE_RESTRICTED',
  'Gazetted Holiday': 'COLOR_HOLTYPE_GAZETTED', 'Central Government Holiday': 'COLOR_HOLTYPE_CENTRALGOVT',
  'Observance': 'COLOR_HOLTYPE_OBSERVANCE', 'Season': 'COLOR_HOLTYPE_SEASON',
  'Store Closed': 'COLOR_HOLTYPE_STORECLOSED'
};
const DEFAULT_HOLTYPE_COLORS = {
  'Public Holiday': '#2FDC46', 'Restricted Holiday': '#F5A623', 'Gazetted Holiday': '#3B82F6',
  'Central Government Holiday': '#8B5CF6', 'Observance': '#9CA3AF', 'Season': '#9CA3AF',
  'Store Closed': '#FF3333'
};
function statusColor(settings, status) {
  const k = STATUS_COLOR_KEYS[status];
  return (k && settings && settings[k]) || DEFAULT_STATUS_COLORS[status] || '#9CA3AF';
}
function holTypeColor(settings, type) {
  const k = HOLTYPE_COLOR_KEYS[type];
  return (k && settings && settings[k]) || DEFAULT_HOLTYPE_COLORS[type] || '#9CA3AF';
}

const NAV = [
  {
    label: 'My workspace', items: [
      { id: 'dashboard', href: 'dashboard.html', icon: 'dashboard', text: 'Dashboard' },
      { id: 'attendance', href: 'attendance.html', icon: 'calendar-check', text: 'Mark attendance' },
      { id: 'history', href: 'history.html', icon: 'clock', text: 'Attendance log' },
      { id: 'leave', href: 'leave.html', icon: 'calendar-minus', text: 'Leave' },
      { id: 'holidays', href: 'holidays.html', icon: 'calendar', text: 'Holidays' },
      { id: 'payroll', href: 'payroll.html', icon: 'wallet', text: 'Salary & payslips' },
      { id: 'idcard', href: 'idcard.html', icon: 'card', text: 'ID Card' },
      { id: 'policy', href: 'policy.html', icon: 'book', text: 'Company Policy' },
      { id: 'profile', href: 'profile.html', icon: 'user', text: 'My profile' }
    ]
  },
  {
    label: 'Administration', admin: true, pcVisible: true, items: [
      { id: 'people', href: 'admin.html?tab=people', icon: 'users', text: 'Employees', adminOnlyItem: true },
      { id: 'records', href: 'admin.html?tab=records', icon: 'list', text: 'Attendance records' },
      { id: 'approvals', href: 'admin.html?tab=approvals', icon: 'inbox', text: 'Leave approvals', badge: 'pendingLeaves', adminOnlyItem: true },
      { id: 'corrections', href: 'admin.html?tab=corrections', icon: 'refresh', text: 'Corrections', badge: 'pendingCorrections' },
      { id: 'payrun', href: 'admin.html?tab=payrun', icon: 'briefcase', text: 'Run payroll', adminOnlyItem: true },
      { id: 'colors', href: 'admin.html?tab=colors', icon: 'palette', text: 'Calendar colors', adminOnlyItem: true },
      { id: 'company', href: 'admin.html?tab=company', icon: 'settings', text: 'Holidays & policy', adminOnlyItem: true }
    ]
  }
];

/**
 * Builds the sidebar + topbar and enforces auth.
 * Returns the session, or null after redirecting to login.
 */
function mountShell(opts) {
  const o = opts || {};
  const session = getSession();

  if (!session || !session.employeeId) { location.href = 'login.html'; return null; }
  if (o.adminOnly && !isAdmin() && !(o.allowPC && isPC())) {
    location.href = 'dashboard.html';
    return null;
  }

  const admin = isAdmin();
  const pc = isPC();
  const co = appSettings().COMPANY_NAME || 'OmNettwear';
  const mark = co.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'OM';

  const navHtml = NAV.filter(function (g) { return !g.admin || admin || (g.pcVisible && pc); }).map(function (g) {
    const items = (admin ? g.items : g.items.filter(function (i) { return !i.adminOnlyItem; }));
    return '<div class="nav-label">' + esc(g.label) + '</div>' + items.map(function (i) {
      return '<a href="' + i.href + '"' + (i.id === o.page ? ' class="active" aria-current="page"' : '') + '>' +
        icon(i.icon, 17) + '<span>' + esc(i.text) + '</span>' +
        (i.badge ? '<span class="count" data-badge="' + i.badge + '" hidden></span>' : '') + '</a>';
    }).join('');
  }).join('');

  const shell = document.createElement('div');
  shell.className = 'app';
  shell.innerHTML =
    '<aside class="sidebar" id="sidebar">' +
      '<div class="brand"><div class="brand-mark">' + esc(mark) + '</div><div>' +
        '<div class="brand-name">' + esc(co) + '</div>' +
        '<div class="brand-sub">HRMS Portal</div></div></div>' +
      '<nav class="nav">' + navHtml + '</nav>' +
      '<div class="sidebar-foot"><span>v2.0</span><span>' + esc(session.employeeId) + '</span></div>' +
    '</aside>' +
    '<div class="scrim" id="scrim"></div>' +
    '<div class="main">' +
      '<header class="topbar">' +
        '<button class="hamburger" id="hamburger" aria-label="Open menu">' + icon('menu', 21) + '</button>' +
        '<div class="page-head"><div class="page-title">' + esc(o.title || '') + '</div>' +
          '<div class="page-sub">' + esc(o.sub || '') + '</div></div>' +
        '<div class="topbar-right">' +
          '<div class="clock" id="shellClock"></div>' +
          '<button class="user-chip" id="userChip" aria-haspopup="true">' +
            avatarHtml(session, 'avatar') +
            '<span class="who"><b>' + esc(session.name) + '</b><span>' + esc(session.role || 'Employee') + '</span></span>' +
            icon('down', 15, 'muted') +
          '</button>' +
        '</div>' +
        '<div class="menu" id="userMenu">' +
          '<div class="menu-head"><b>' + esc(session.name) + '</b><span>' + esc(session.employeeId) + '</span></div>' +
          '<a href="profile.html">' + icon('user', 16) + 'My profile</a>' +
          '<a href="profile.html#security">' + icon('lock', 16) + 'Change password</a>' +
          '<button class="danger" id="signOutBtn">' + icon('logout', 16) + 'Sign out</button>' +
        '</div>' +
      '</header>' +
      '<main class="content" id="content"></main>' +
    '</div>';

  document.body.insertBefore(shell, document.body.firstChild);

  /* Move any markup the page already wrote into the content area. */
  const holder = el('pageContent');
  if (holder) el('content').appendChild(holder);

  el('hamburger').onclick = function () {
    el('sidebar').classList.toggle('open');
    el('scrim').classList.toggle('open');
  };
  el('scrim').onclick = function () {
    el('sidebar').classList.remove('open');
    el('scrim').classList.remove('open');
  };
  el('userChip').onclick = function (e) { e.stopPropagation(); el('userMenu').classList.toggle('open'); };
  document.addEventListener('click', function () { el('userMenu').classList.remove('open'); });
  el('signOutBtn').onclick = signOut;

  const tick = function () {
    const d = new Date();
    el('shellClock').textContent = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) +
      '  ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  tick();
  setInterval(tick, 20000);

  ['click', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, touchSession, { passive: true });
  });
  setInterval(function () { if (!getSession()) location.href = 'login.html?expired=1'; }, 60000);

  return session;
}

function avatarHtml(p, cls) {
  const c = cls || 'avatar';
  return p && p.photoUrl
    ? '<img class="' + c + '" src="' + esc(p.photoUrl) + '" alt="">'
    : '<span class="' + c + '">' + esc(initials(p && p.name)) + '</span>';
}

/** Fills the pending-approval badge in the sidebar. */
function setNavBadge(name, value) {
  document.querySelectorAll('[data-badge="' + name + '"]').forEach(function (n) {
    if (Number(value) > 0) { n.textContent = value; n.hidden = false; }
    else n.hidden = true;
  });
}

function stateBlock(kind, title, body, iconName) {
  return '<div class="state ' + (kind === 'error' ? 'error' : '') + '"><div class="state-icon">' +
    icon(iconName || (kind === 'error' ? 'alert' : 'inbox'), 22) + '</div><h4>' + esc(title) + '</h4>' +
    '<p>' + esc(body || '') + '</p></div>';
}

function pill(status) {
  const s = String(status || '').trim();
  return '<span class="pill pill-' + esc(s.replace(/[^A-Za-z-]/g, '')) + '">' + esc(s || '\u2014') + '</span>';
}
