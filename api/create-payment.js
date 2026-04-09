export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id requis' });

  const npRes = await fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_amount: 2,
      price_currency: 'usdttrc20',
      pay_currency: 'usdttrc20',
      order_id: user_id,
      order_description: "Tour supplementaire Project Invest"
    })
  });

  const data = await npRes.json();
  if (!npRes.ok) return res.status(500).json({ error: data });

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/crypto_payments`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      user_id,
      payment_id: String(data.payment_id),
      status: 'pending'
    })
  });

  res.json({
    payment_id: data.payment_id,
    pay_address: data.pay_address,
    pay_amount: data.pay_amount,
    pay_currency: data.pay_currency
  });
}
