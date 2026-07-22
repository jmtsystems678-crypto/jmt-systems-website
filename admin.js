const db = window.supabase.createClient(JMT_CONFIG.supabaseUrl, JMT_CONFIG.supabasePublishableKey);
const email = document.querySelector('#email'); email.value = JMT_CONFIG.adminEmail;
const login = document.querySelector('#login'), dashboard = document.querySelector('#dashboard'), message = document.querySelector('#login-message');
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
async function loadDashboard() {
  const { data: userData } = await db.auth.getUser();
  if (userData.user?.email !== JMT_CONFIG.adminEmail) return;
  login.hidden = true; dashboard.hidden = false;
  const [requests, registrations] = await Promise.all([
    db.from('service_requests').select('*').order('created_at', {ascending:false}),
    db.from('program_registrations').select('*').order('created_at', {ascending:false})
  ]);
  const show = (target, rows, render) => document.querySelector(target).innerHTML = rows?.length ? rows.map(render).join('') : '<p class="empty">Nothing here yet.</p>';
  show('#request-list', requests.data, row => `<article class="item"><b>${escapeHtml(row.full_name)} — ${escapeHtml(row.service)}</b><p>${escapeHtml(row.project_details || 'No project description supplied.')}</p><p class="meta">${escapeHtml(row.email)} · ${new Date(row.created_at).toLocaleString()} · ${escapeHtml(row.status)}</p></article>`);
  show('#registration-list', registrations.data, row => `<article class="item"><b>${escapeHtml(row.full_name)} — ${escapeHtml(row.program)}</b><p class="meta">${escapeHtml(row.email)} · ${escapeHtml(row.phone)} · ${escapeHtml(row.payment_status)}</p></article>`);
}
document.querySelector('#login-form').addEventListener('submit', async event => { event.preventDefault(); message.textContent = 'Sending secure sign-in link…'; const { error } = await db.auth.signInWithOtp({ email: JMT_CONFIG.adminEmail, options: { emailRedirectTo: window.location.href } }); message.textContent = error ? 'Unable to send the sign-in link. Please check the Supabase setup.' : 'Sign-in link sent. Open it in this browser to enter the dashboard.'; });
document.querySelector('#signout').addEventListener('click', async () => { await db.auth.signOut(); location.reload(); });
document.querySelectorAll('.tabs button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.tabs button').forEach(tab => tab.classList.remove('active')); button.classList.add('active'); document.querySelectorAll('.panel').forEach(panel => panel.hidden = panel.id !== button.dataset.panel); }));
db.auth.onAuthStateChange(() => loadDashboard()); loadDashboard();
