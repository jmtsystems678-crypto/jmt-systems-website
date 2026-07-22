module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { program, full_name, email, phone, notes } = req.body || {};
  const prices = {
    'I Am Multi-Talented': Number(process.env.I_AM_MULTI_TALENTED_PRICE_PESEWAS),
    'Zionization Conference': Number(process.env.ZIONIZATION_CONFERENCE_PRICE_PESEWAS)
  };
  const amount = prices[program];
  if (!program || !full_name || !email || !phone || !Number.isInteger(amount) || amount < 10) return res.status(400).json({ error: 'Registration details or program price are incomplete.' });
  const reference = `JMT-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseHeaders = { apikey: supabaseAdminKey, Authorization: `Bearer ${supabaseAdminKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
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
