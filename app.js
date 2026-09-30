const KEY = 'plans.v1';
const $ = s => document.querySelector(s);
let plans = [];
try { plans = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(plans)); } catch {} };
const fmt = t => new Date(t).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}
function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400);
  const h = String(Math.floor(s % 86400 / 3600)).padStart(2, '0');
  const m = String(Math.floor(s % 3600 / 60)).padStart(2, '0'), x = String(s % 60).padStart(2, '0');
  return (d ? d + 'd ' : '') + `${h}:${m}:${x}`;
}

function render() {
  $('#clock').textContent = new Date().toLocaleString();
  $('#empty').hidden = plans.length > 0;
  plans.sort((a, b) => a.enrollAt - b.enrollAt);
  $('#list').innerHTML = plans.map(p => `
    <article class="card">
      <h3>${esc(p.name)}</h3>
      <p>Class: ${fmt(p.classAt)}</p>
      <p>Enrolls: ${fmt(p.enrollAt)}</p>
      <span class="badge ${p.status}">${p.status}</span>
      ${p.status === 'scheduled' ? `<span class="count"> opens in ${countdown(p.enrollAt - Date.now())}</span>` : ''}
      ${p.confirmation ? `<p>Confirmation: ${esc(p.confirmation)}</p>` : ''}
      ${p.error ? `<p>${esc(p.error)}</p>` : ''}
      <button class="ghost" data-del="${p.id}">Remove</button>
      ${p.status === 'failed' ? `<button data-retry="${p.id}">Retry</button>` : ''}
    </article>`).join('');
}

async function attempt(p) {
  p.status = 'enrolling'; save(); render();
  try {
    const r = await StudioConnector.enroll(p);
    Object.assign(p, { status: 'enrolled', confirmation: r.confirmation, error: '' });
    toast(`Enrolled: ${p.name}`);
  } catch (e) {
    Object.assign(p, { status: 'failed', error: e.message || 'Enrollment failed' });
    toast(`Failed: ${p.name}`);
  }
  save(); render();
}

function tick() {
  const now = Date.now();
  plans.filter(p => p.status === 'scheduled' && p.enrollAt <= now).forEach(attempt);
  render();
}

$('#add').onclick = () => $('#form-dlg').showModal();
$('#cancel').onclick = () => $('#form-dlg').close();
$('#form').onsubmit = e => {
  const f = new FormData(e.target);
  plans.push({ id: crypto.randomUUID(), name: f.get('name').trim(), classAt: +new Date(f.get('classAt')),
    enrollAt: +new Date(f.get('enrollAt')), status: 'scheduled' });
  save(); e.target.reset(); tick();
};
$('#list').onclick = e => {
  const d = e.target.dataset;
  if (d.del) { plans = plans.filter(p => p.id !== d.del); save(); render(); }
  if (d.retry) attempt(plans.find(p => p.id === d.retry));
};

setInterval(tick, 1000);
document.addEventListener('visibilitychange', tick);
tick();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
