export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const { user_id, expected_amount, network } = req.body;
  if (!user_id || !expected_amount) return res.status(400).json({ error: 'Paramètres manquants' });

  const isBep20 = network === 'bep20';

  const WALLET_TRC20  = 'TWqqfUwkWE5W8ZPdQ67EHkZghZXYhEpPc4';
  const WALLET_BEP20  = '0x362b7c69e0a202513355c6a870c99a17df43101a';
  const USDT_TRC20    = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  const USDT_BEP20    = '0x55d398326f99059fF775485246999027B3197955';

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

  const amtExpected = parseFloat(expected_amount);
  let transfers = [];

  if (isBep20) {
    // ── BEP20 : BSCScan ──
    // USDT sur BSC = 18 décimales
    const rawExpectedBep = BigInt(Math.round(amtExpected * 1e18)).toString();

    try {
      const bscKey = process.env.BSCSCAN_API_KEY || '';
      const bscRes = await fetch(
        `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${USDT_BEP20}&address=${WALLET_BEP20}&sort=desc&apikey=${bscKey}`,
        { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }
      );
      const bscData = await bscRes.json();
      const txs = bscData.result || [];
      // Filtrer les TX entrantes uniquement
      const incoming = txs.filter(tx => tx.to && tx.to.toLowerCase() === WALLET_BEP20.toLowerCase());
      transfers.push(...incoming);
    } catch (_) { /* BSCScan indisponible */ }

    function matchBep20(tx) {
      const val = tx.value || '0';
      if (val === rawExpectedBep) return true;
      // Tolérance ±0.01 USDT
      try {
        const diff = Math.abs(Number(BigInt(val)) / 1e18 - amtExpected);
        return diff < 0.01;
      } catch(_) { return false; }
    }

    const found = transfers.find(tx => matchBep20(tx));

    if (!found) {
      const sample = transfers.slice(0, 3).map(tx => ({ value: tx.value, to: tx.to, tokenSymbol: tx.tokenSymbol }));
      return res.json({ found: false, debug: { rawExpectedBep, amtExpected, total: transfers.length, sample } });
    }

    await confirmerEtDebloquer(user_id, expected_amount, tours, sbHeaders);
    return res.json({ found: true, tours });

  } else {
    // ── TRC20 : TronScan + TronGrid ──
    const rawExpected = Math.round(amtExpected * 1_000_000);

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
      if (!tx.tokenInfo && !tx.token_info) return true;
      const info = tx.tokenInfo || tx.token_info || {};
      const abbr = (info.tokenAbbr || info.symbol || '').toUpperCase();
      const id   = info.tokenId || info.address || '';
      return abbr === 'USDT' || id === USDT_TRC20;
    }

    const errors = [];

    const errors = [];
    let tsKeys = [];

    // Source 1 : TronGrid avec clé (principale)
    if (process.env.TRONGRID_API_KEY) {
      try {
        const tgRes = await fetch(
          `https://api.trongrid.io/v1/accounts/${WALLET_TRC20}/transactions/trc20?limit=200&only_to=true&contract_address=${USDT_TRC20}`,
          { headers: { 'Accept': 'application/json', 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY }, signal: AbortSignal.timeout(10000) }
        );
        if (!tgRes.ok) throw new Error('HTTP ' + tgRes.status);
        const tgData = await tgRes.json();
        const tg = tgData.data || [];
        transfers.push(...tg);
      } catch (e) { errors.push('TronGrid:' + e.message); }
    } else {
      errors.push('TronGrid:NO_KEY');
    }

    // Source 2 : TronScan avec headers navigateur
    try {
      const tsRes = await fetch(
        `https://apilist.tronscan.org/api/token_trc20/transfers?toAddress=${WALLET_TRC20}&limit=200&start=0`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'fr-FR,fr;q=0.9',
            'Referer': 'https://tronscan.org/',
            'Origin': 'https://tronscan.org'
          },
          signal: AbortSignal.timeout(10000)
        }
      );
      if (!tsRes.ok) throw new Error('HTTP ' + tsRes.status);
      const tsData = await tsRes.json();
      tsKeys = Object.keys(tsData);
      const ts = tsData.token_transfers || tsData.data || tsData.transferList || [];
      transfers.push(...ts);
    } catch (e) { errors.push('TronScan:' + e.message); }

    // Source 3 : TronScan public API (autre endpoint)
    try {
      const ts2Res = await fetch(
        `https://apilist.tronscan.org/api/transaction?address=${WALLET_TRC20}&direction=from&limit=200&start=0&tokenName=USDT`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://tronscan.org/'
          },
          signal: AbortSignal.timeout(10000)
        }
      );
      if (!ts2Res.ok) throw new Error('HTTP ' + ts2Res.status);
      const ts2Data = await ts2Res.json();
      const ts2 = ts2Data.data || ts2Data.token_transfers || [];
      transfers.push(...ts2);
    } catch (e) { errors.push('TronScanTx:' + e.message); }

    const found = transfers.find(tx => matchAmount(tx) && isUSDT(tx));

    if (!found) {
      const sample = transfers.slice(0, 3).map(tx => ({
        quant: tx.quant, value: tx.value, amount: tx.amount,
        tokenAbbr: (tx.tokenInfo || tx.token_info || {}).tokenAbbr || (tx.token_info || {}).symbol,
      }));
      return res.json({ found: false, debug: { rawExpected, amtExpected, total: transfers.length, sample, errors, tsKeys } });
    }

    await confirmerEtDebloquer(user_id, expected_amount, tours, sbHeaders);
    return res.json({ found: true, tours });
  }
}

async function confirmerEtDebloquer(user_id, expected_amount, tours, sbHeaders) {
  await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/pending_payments?user_id=eq.${encodeURIComponent(user_id)}&expected_amount=eq.${expected_amount}&status=eq.pending`,
    { method: 'PATCH', headers: sbHeaders, body: JSON.stringify({ status: 'confirmed' }) }
  );

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
}
