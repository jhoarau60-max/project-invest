import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Vérifier la signature IPN
  const sig = req.headers['x-nowpayments-sig'];
  const sorted = JSON.stringify(req.body, Object.keys(req.body).sort());
  const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
    .update(sorted).digest('hex');

  if (hmac !== sig) return res.status(401).json({ error: 'Signature invalide' });

  const { payment_status, payment_id, order_id } = req.body;

  if (payment_status === 'confirmed' || payment_status === 'finished') {
    const sbHeaders = {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    };

    // Mettre à jour le statut du paiement
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/crypto_payments?payment_id=eq.${payment_id}`, {
      method: 'PATCH',
      headers: sbHeaders,
      body: JSON.stringify({ status: 'confirmed' })
    });

    // Supprimer la participation du mois pour débloquer un nouveau tour
    const month_year = new Date().toISOString().slice(0, 7);
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/spin_participations?user_id=eq.${order_id}&month_year=eq.${month_year}`, {
      method: 'DELETE',
      headers: sbHeaders
    });
  }

  res.status(200).json({ ok: true });
}
