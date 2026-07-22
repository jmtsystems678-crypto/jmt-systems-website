const { sendJmtNotification } = require('./emailjs');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { full_name, email, service, project_details } = req.body || {};
  if (!full_name?.trim() || !emailPattern.test(email || '') || !service?.trim()) {
    return res.status(400).json({ error: 'Please complete the required fields.' });
  }

  const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.SUPABASE_URL || !supabaseAdminKey) return res.status(500).json({ error: 'Request storage is not configured.' });
  const recordResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/service_requests`, {
    method: 'POST',
    headers: { apikey: supabaseAdminKey, Authorization: `Bearer ${supabaseAdminKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: full_name.trim(), email: email.trim(), service: service.trim(), project_details: project_details?.trim() || null })
  });
  if (!recordResponse.ok) {
    console.error('Service request insert failed', { status: recordResponse.status, body: await recordResponse.text() });
    return res.status(500).json({ error: 'Unable to save request.' });
  }

  try {
    await sendJmtNotification({
      notification_type: 'New project request', full_name: full_name.trim(), email: email.trim(), phone: 'Not provided',
      service: service.trim(), project_details: project_details?.trim() || 'No additional details provided.',
      program: 'Not applicable', amount: 'Not applicable', payment_channel: 'Not applicable', payment_reference: 'Not applicable'
    });
  } catch (error) {
    console.error('Project request email failed', error.message);
    // Keep the request in Supabase, but never tell the visitor it was emailed when it was not.
    return res.status(502).json({ error: 'Request saved, but notification email could not be sent.' });
  }
  return res.status(201).json({ ok: true });
};
