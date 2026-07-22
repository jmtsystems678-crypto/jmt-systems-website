const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPrograms = new Set(['I Am Multi-Talented', 'Zionization Conference']);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { program, full_name, email, phone, country, occupation, goals, email_consent } = req.body || {};
  if (!allowedPrograms.has(program) || !full_name?.trim() || !emailPattern.test(email || '') || !phone?.trim()) {
    return res.status(400).json({ error: 'Please complete your name, email, and phone number.' });
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.SUPABASE_URL || !key) return res.status(500).json({ error: 'Priority List storage is not configured.' });
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/program_priority_list?on_conflict=program,email`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      program,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country?.trim() || null,
      occupation: occupation?.trim() || null,
      goals: goals?.trim() || null,
      email_consent: Boolean(email_consent)
    })
  });
  if (!response.ok) {
    console.error('Priority list insert failed', { status: response.status, body: await response.text() });
    return res.status(500).json({ error: 'Unable to save your Priority List request.' });
  }
  return res.status(201).json({ ok: true });
};
