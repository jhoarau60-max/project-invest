export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, expected_amount } = req.body;
  if (!user_id || !expected_amount) return res.status(400).json({ error: 'Paramètres manquants' });

  const wallet = 'TWqqfUwkWE5W8ZPdQ67EHkZghZXYhEpPc4';
  const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  const sbHeaders = {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  // Vérifier si déjà confirmé (éviter double déblocage)
  const alreadyRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?user_id=eq.${encodeURIComponent(user_id)}&expected_amount=eq.${expected_amount}&status=eq.confirmed`,
    { headers: sbHeaders }
  );
  const already = await alreadyRes.json();
  if (already.length > 0) return res.json({ found: true, already: true, tours: already[0].tours });

  // Récupérer le paiement en attente
  const ppRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?user_id=eq.${encodeURIComponent(user_id)}&expected_amount=eq.${expected_amount}&status=eq.pending`,
    { headers: sbHeaders }
  );
  const ppData = await ppRes.json();
  if (!ppData.length) return res.status(404).json({ error: 'Paiement introuvable' });
  const tours = ppData[0].tours;

  const rawExpected = Math.round(parseFloat(expected_amount) * 1_000_000);
  const amtExpected = parseFloat(expected_amount);

  // ── Fonction de correspondance souple ──
  function matchAmount(tx) {
    const candidates = [
      parseInt(tx.quant),
      parseInt(tx.value),
      parseInt(tx.amount),
      Math.round(parseFloat(tx.amount || 0) * 1_000_000),
      Math.round(parseFloat(tx.tokenAmount || 0) * 1_000_000),
    ];
    const byRaw = candidates.some(v => !isNaN(v) && v === rawExpected);
    const byDec = Math.abs(parseFloat(tx.amount || tx.tokenAmount || 0) - amtExpected) < 0.01;
    return byRaw || byDec;
  }

  function isUSDT(tx) {
    if (!tx.tokenInfo && !tx.token_info) return true; // pas d'info → on accepte
    const info = tx.tokenInfo || tx.token_info || {};
    const abbr = (info.tokenAbbr || info.symbol || '').toUpperCase();
    const id   = info.tokenId || info.address || '';
    return abbr === 'USDT' || id === USDT_CONTRACT;
  }

  let transfers = [];

  // ── Source 1 : TronScan ──
  try {
    const tsRes = await fetch(
      `https://apilist.tronscan.org/api/token_trc20/transfers?toAddress=${wallet}&limit=200&start=0`,
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }
    );
    const tsData = await tsRes.json();
    const ts = tsData.token_transfers || tsData.data || [];
    transfers.push(...ts);
  } catch (_) { /* TronScan indisponible */ }

  // ── Source 2 : TronGrid (fallback / complément) ──
  try {
    const tgRes = await fetch(
      `https://api.trongrid.io/v1/accounts/${wallet}/transactions/trc20?limit=200&only_to=true&contract_address=${USDT_CONTRACT}`,
      { headers: { 'Accept': 'application/json', 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY || '' }, signal: AbortSignal.timeout(8000) }
    );
    const tgData = await tgRes.json();
    const tg = tgData.data || [];
    transfers.push(...tg);
  } catch (_) { /* TronGrid indisponible */ }

  const found = transfers.find(tx => matchAmount(tx) && isUSDT(tx));

  if (!found) {
    const sample = transfers.slice(0, 3).map(tx => ({
      quant: tx.quant, value: tx.value, amount: tx.amount,
      tokenAbbr: (tx.tokenInfo || tx.token_info || {}).tokenAbbr || (tx.token_info || {}).symbol,
    }));
    return res.json({ found: false, debug: { rawExpected, amtExpected, total: transfers.length, sample } });
  }

  // ── Confirmer dans Supabase ──
  await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?user_id=eq.${encodeURIComponent(user_id)}&expected_amount=eq.${expected_amount}&status=eq.pending`,
    { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ status: 'confirmed' }) }
  );

  // ── Ajouter les extra_spins ──
  const esRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/extra_spins?user_id=eq.${encodeURIComponent(user_id)}`,
    { headers: sbHeaders }
  );
  const esData = await esRes.json();

  if (esData.length > 0) {
    await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/extra_spins?user_id=eq.${encodeURIComponent(user_id)}`,
      { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ remaining: esData[0].remaining + tours, updated_at: new Date().toISOString() }) }
    );
  } else {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/extra_spins`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ user_id, remaining: tours, updated_at: new Date().toISOString() })
    });
  }

  res.json({ found: true, tours });
}
