module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { program, full_name, email, phone, notes } = req.body || {};
  const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!program || !full_name || !email || !phone || !process.env.SUPABASE_URL || !supabaseAdminKey) return res.status(400).json({ error: 'Registration details are incomplete.' });
  const supabaseHeaders = { apikey: supabaseAdminKey, Authorization: `Bearer ${supabaseAdminKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const eventResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/program_events?program=eq.${encodeURIComponent(program)}&status=eq.open&is_public=eq.true&select=price_pesewas`, { headers: supabaseHeaders });
  const events = eventResponse.ok ? await eventResponse.json() : [];
  const amount = Number(events[0]?.price_pesewas);
  if (!Number.isInteger(amount) || amount < 10) return res.status(409).json({ error: 'Registration is not open for this programme yet. Please join the JMT Priority List.' });
  const reference = `JMT-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const recordResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/program_registrations`, { method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ program, full_name: full_name.trim(), email: email.trim(), phone: phone.trim(), notes: notes?.trim() || null, payment_status: 'awaiting_payment', payment_amount_pesewas: amount, paystack_reference: reference }) });
  if (!recordResponse.ok) {
    console.error('Supabase registration insert failed', { status: recordResponse.status, body: await recordResponse.text() });
    return res.status(500).json({ error: `Registration setup error (${recordResponse.status}). Please contact JMT support.` });
  }
  const [registration] = await recordResponse.json();
  const paymentResponse = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, amount, reference, callback_url: `${process.env.SITE_URL}/payment-complete.html?reference=${encodeURIComponent(reference)}`, metadata: { registration_id: registration.id, program } }) });
  const payment = await paymentResponse.json();
  if (!payment.status) return res.status(502).json({ error: 'Payment checkout could not be started.' });
  return res.status(200).json({ authorization_url: payment.data.authorization_url });
};
