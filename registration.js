const db = window.supabase.createClient(JMT_CONFIG.supabaseUrl, JMT_CONFIG.supabasePublishableKey);
const programmeSelect = document.querySelector('#program');
const priorityForm = document.querySelector('#priority-form');
const registrationForm = document.querySelector('#registration-form');
const statusBox = document.querySelector('#event-status');
const confirmation = document.querySelector('#confirmation');
const title = document.querySelector('#programme-title');
const intro = document.querySelector('#programme-intro');
const queryProgram = new URLSearchParams(location.search).get('program');
if (queryProgram && [...programmeSelect.options].some(option => option.value === queryProgram)) programmeSelect.value = queryProgram;

const formatDate = value => value ? new Intl.DateTimeFormat('en-GH', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : null;
const showStatus = (kind, content) => { statusBox.className = `event-status ${kind}`; statusBox.innerHTML = content; };

async function loadProgramme() {
  confirmation.textContent = '';
  priorityForm.hidden = true;
  registrationForm.hidden = true;
  showStatus('loading', 'Checking programme status…');
  const program = programmeSelect.value;
  const { data, error } = await db.from('program_events').select('*').eq('program', program).eq('is_public', true).maybeSingle();
  if (error || !data) {
    title.textContent = program;
    intro.textContent = 'JMT is preparing future opportunities for this programme.';
    showStatus('planning', '<b>Next cohort being planned.</b><br>Join the Priority List to be considered for the next confirmed edition.');
    priorityForm.hidden = false;
    return;
  }
  title.textContent = data.title || program;
  if (data.status === 'open') {
    intro.textContent = 'Registration is open. Review the event information, then complete secure checkout.';
    const details = [formatDate(data.event_date), data.venue, data.registration_deadline ? `Registration closes ${formatDate(data.registration_deadline)}` : null, `GH₵${(data.price_pesewas / 100).toFixed(0)}`].filter(Boolean);
    showStatus('open', `<b>Registration is open.</b><br>${details.join('<br>')}${data.event_details ? `<br><br>${data.event_details}` : ''}`);
    registrationForm.hidden = false;
  } else if (data.status === 'closed') {
    intro.textContent = 'This edition is not currently accepting registrations.';
    showStatus('closed', '<b>Registration is currently closed.</b><br>Join the Priority List for news of a future edition.');
    priorityForm.hidden = false;
  } else {
    intro.textContent = 'JMT is preparing the next edition of this programme.';
    showStatus('planning', `<b>Next cohort being planned.</b><br>We are currently preparing the next edition. Join the Priority List and you will be ready when registration opens.${data.event_details ? `<br><br>${data.event_details}` : ''}`);
    priorityForm.hidden = false;
  }
}

programmeSelect.addEventListener('change', loadProgramme);
priorityForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = priorityForm.querySelector('button'); button.disabled = true; button.textContent = 'Saving your place…';
  try {
    const response = await fetch('/api/join-priority-list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      program: programmeSelect.value, full_name: document.querySelector('#priority-name').value, email: document.querySelector('#priority-email').value,
      phone: document.querySelector('#priority-phone').value, country: document.querySelector('#country').value, occupation: document.querySelector('#occupation').value,
      goals: document.querySelector('#goals').value, email_consent: document.querySelector('#email-consent').checked
    }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save your request.');
    priorityForm.reset();
    confirmation.textContent = 'You are on the JMT Priority List. We will share confirmed programme information when it is ready.';
  } catch (error) { confirmation.textContent = error.message; }
  button.disabled = false; button.textContent = 'Join Priority List';
});
registrationForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = registrationForm.querySelector('button'); button.disabled = true; button.textContent = 'Opening secure checkout…';
  try {
    const response = await fetch('/api/create-registration-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ program: programmeSelect.value, full_name: document.querySelector('#full-name').value, email: document.querySelector('#registration-email').value, phone: document.querySelector('#phone').value, notes: document.querySelector('#notes').value }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to start checkout.');
    window.location.assign(result.authorization_url);
  } catch (error) { confirmation.textContent = error.message; button.disabled = false; button.textContent = 'Continue to secure payment'; }
});
loadProgramme();
