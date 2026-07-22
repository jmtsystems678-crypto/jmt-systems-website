const crypto = require('crypto');
const { sendJmtNotification } = require('./emailjs');
const rawBody = req => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await rawBody(req);
  const signature = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');
  if (signature !== req.headers['x-paystack-signature']) return res.status(401).end();

  const event = JSON.parse(raw.toString());
  if (event.event !== 'charge.success') return res.status(200).end();
  const reference = event.data?.reference;
  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });
  const verification = await verifyResponse.json();
  if (!verification.status || verification.data.status !== 'success') return res.status(400).end();

  const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const updateResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/program_registrations?paystack_reference=eq.${encodeURIComponent(reference)}&payment_amount_pesewas=eq.${verification.data.amount}&payment_status=neq.paid`, {
    method: 'PATCH',
    headers: { apikey: supabaseAdminKey, Authorization: `Bearer ${supabaseAdminKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ payment_status: 'paid', payment_channel: verification.data.channel })
  });
  if (!updateResponse.ok) return res.status(400).end();
  const [registration] = await updateResponse.json();

  // Only the first verified Paystack webhook changes the record and sends an email.
  if (registration) {
    const amount = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(verification.data.amount / 100);
    try {
      await sendJmtNotification({
        notification_type: 'Program payment confirmed', full_name: registration.full_name, email: registration.email,
        phone: registration.phone, service: 'Program registration', project_details: registration.notes || 'No additional notes provided.',
        program: registration.program, amount, payment_channel: verification.data.channel || 'Online payment', payment_reference: reference
      });
    } catch (error) {
      // Payment confirmation must never fail because an email provider is temporarily unavailable.
      console.error('JMT payment notification failed', error.message);
    }
  }
  return res.status(200).end();
};

module.exports.config = { api: { bodyParser: false } };
