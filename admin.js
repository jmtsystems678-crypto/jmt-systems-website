const db = window.supabase.createClient(JMT_CONFIG.supabaseUrl, JMT_CONFIG.supabasePublishableKey);
const email = document.querySelector('#email'); email.value = JMT_CONFIG.adminEmail;
const login = document.querySelector('#login'), dashboard = document.querySelector('#dashboard'), message = document.querySelector('#login-message');
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
const localInputDate = value => value ? new Date(value).toISOString().slice(0, 16) : '';
const formatDate = value => value ? new Date(value).toLocaleString() : 'Not set';
let eventRows = [];

function show(target, rows, render) { document.querySelector(target).innerHTML = rows?.length ? rows.map(render).join('') : '<p class="empty">Nothing here yet.</p>'; }
function fillEventForm(program) {
  const row = eventRows.find(event => event.program === program);
  document.querySelector('#event-status-input').value = row?.status || 'planning';
  document.querySelector('#event-date').value = localInputDate(row?.event_date);
  document.querySelector('#event-venue').value = row?.venue || '';
  document.querySelector('#event-price').value = row ? row.price_pesewas / 100 : '';
  document.querySelector('#event-capacity').value = row?.capacity || '';
  document.querySelector('#event-deadline').value = localInputDate(row?.registration_deadline);
  document.querySelector('#event-details').value = row?.event_details || '';
  document.querySelector('#event-public').checked = row?.is_public !== false;
}
async function loadDashboard() {
  const { data: userData } = await db.auth.getUser();
  if (userData.user?.email !== JMT_CONFIG.adminEmail) return;
  login.hidden = true; dashboard.hidden = false;
  const [events, priority, requests, registrations] = await Promise.all([
    db.from('program_events').select('*').order('program'),
    db.from('program_priority_list').select('*').order('created_at', { ascending: false }),
    db.from('service_requests').select('*').order('created_at', { ascending: false }),
    db.from('program_registrations').select('*').order('created_at', { ascending: false })
  ]);
  eventRows = events.data || [];
  fillEventForm(document.querySelector('#event-program').value);
  show('#priority-list', priority.data, row => `<article class="item"><b>${escapeHtml(row.full_name)} — ${escapeHtml(row.program)}</b><p>${escapeHtml(row.goals || 'No goal supplied.')}</p><p class="meta">${escapeHtml(row.email)} · ${escapeHtml(row.phone)} · ${escapeHtml(row.country || 'Country not supplied')} · ${new Date(row.created_at).toLocaleString()}</p></article>`);
  show('#request-list', requests.data, row => `<article class="item"><b>${escapeHtml(row.full_name)} — ${escapeHtml(row.service)}</b><p>${escapeHtml(row.project_details || 'No project description supplied.')}</p><p class="meta">${escapeHtml(row.email)} · ${new Date(row.created_at).toLocaleString()} · ${escapeHtml(row.status)}</p></article>`);
  show('#registration-list', registrations.data, row => `<article class="item"><b>${escapeHtml(row.full_name)} — ${escapeHtml(row.program)}</b><p class="meta">${escapeHtml(row.email)} · ${escapeHtml(row.phone)} · ${escapeHtml(row.payment_status)}</p></article>`);
}
document.querySelector('#login-form').addEventListener('submit', async event => { event.preventDefault(); message.textContent = 'Sending secure sign-in link…'; const redirectUrl = `${JMT_CONFIG.siteUrl}/admin.html`; const { error } = await db.auth.signInWithOtp({ email: JMT_CONFIG.adminEmail, options: { emailRedirectTo: redirectUrl } }); message.textContent = error ? `Unable to send the sign-in link: ${error.message}` : 'Sign-in link sent. Open it in this browser to enter the dashboard.'; });
document.querySelector('#signout').addEventListener('click', async () => { await db.auth.signOut(); location.reload(); });
document.querySelector('#event-program').addEventListener('change', event => fillEventForm(event.target.value));
document.querySelector('#event-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button'); const notice = document.querySelector('#event-message');
  const program = document.querySelector('#event-program').value;
  const price = Math.round(Number(document.querySelector('#event-price').value) * 100);
  if (!Number.isInteger(price) || price < 0) { notice.textContent = 'Enter a valid price in Ghana cedis.'; return; }
  button.disabled = true; button.textContent = 'Saving…'; notice.textContent = '';
  const payload = { program, title: program, status: document.querySelector('#event-status-input').value, event_date: document.querySelector('#event-date').value || null, venue: document.querySelector('#event-venue').value.trim() || null, price_pesewas: price, capacity: Number(document.querySelector('#event-capacity').value) || null, registration_deadline: document.querySelector('#event-deadline').value || null, event_details: document.querySelector('#event-details').value.trim() || null, is_public: document.querySelector('#event-public').checked, updated_at: new Date().toISOString() };
  const { error } = await db.from('program_events').upsert(payload, { onConflict: 'program' });
  if (error) notice.textContent = `Unable to save: ${error.message}`; else { notice.textContent = 'Programme settings saved. Refresh the public programme page to see the live update.'; await loadDashboard(); }
  button.disabled = false; button.textContent = 'Save programme settings';
});
document.querySelectorAll('.tabs button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.tabs button').forEach(tab => tab.classList.remove('active')); button.classList.add('active'); document.querySelectorAll('.panel').forEach(panel => panel.hidden = panel.id !== button.dataset.panel); }));
db.auth.onAuthStateChange(() => loadDashboard()); loadDashboard();
