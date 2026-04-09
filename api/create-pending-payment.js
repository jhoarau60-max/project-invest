export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, tours, base } = req.body;
  if (!user_id || !tours || !base) return res.status(400).json({ error: 'Paramètres manquants' });

  const sbHeaders = {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  // Si cet utilisateur a déjà un paiement en attente, le réutiliser
  const userPendingRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?user_id=eq.${user_id}&status=eq.pending&select=expected_amount,tours&order=created_at.desc`,
    { headers: sbHeaders }
  );
  const userPending = await userPendingRes.json();
  // Trouver un paiement en attente avec le même forfait (base correspondante)
  const match = Array.isArray(userPending) && userPending.find(p => {
    const amt = parseFloat(p.expected_amount);
    return amt >= base && amt < base + 1;
  });
  if (match) return res.json({ expected_amount: match.expected_amount });

  // Récupérer les montants en attente pour éviter les doublons
  const existingRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?status=eq.pending&select=expected_amount`,
    { headers: sbHeaders }
  );
  const existing = await existingRes.json();
  const usedAmounts = existing.map(p => parseFloat(p.expected_amount));

  // Trouver un suffixe unique (001 à 999)
  let expected_amount = null;
  for (let i = 1; i <= 999; i++) {
    const candidate = parseFloat((base + i / 1000).toFixed(3));
    if (!usedAmounts.includes(candidate)) {
      expected_amount = candidate;
      break;
    }
  }
  if (!expected_amount) return res.status(500).json({ error: 'Aucun montant disponible' });

  // Enregistrer dans Supabase
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/pending_payments`, {
    method: 'POST',
    headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ user_id, expected_amount, tours, status: 'pending' })
  });

  res.json({ expected_amount });
}
