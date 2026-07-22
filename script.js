const jmt = window.supabase.createClient(JMT_CONFIG.supabaseUrl, JMT_CONFIG.supabasePublishableKey);
const projectForm = document.querySelector('.booking form');

projectForm.addEventListener('submit', async event => {
  event.preventDefault();
  const fields = projectForm.querySelectorAll('input, select, textarea');
  const button = projectForm.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending request...';
  try {
    const response = await fetch('/api/create-service-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fields[0].value.trim(),
        email: fields[1].value.trim(),
        service: fields[2].value,
        project_details: fields[3].value.trim()
      })
    });
    if (!response.ok) throw new Error('Request could not be sent');
    projectForm.reset();
    button.textContent = 'Request sent — JMT will contact you';
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Try again';
    alert('We could not send your request. Please use WhatsApp or email JMT directly.');
  }
});

document.querySelector('.menu').addEventListener('click', () => document.querySelector('.nav nav').classList.toggle('open'));
// Trigger JMT website deployment
