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
    // ── BEP20 : RPC BSC direct (sans clé API) ──
    // USDT BEP20 = 18 décimales
    const rawExpectedBep = BigInt(Math.round(amtExpected * 1e18)).toString();
    const bepErrors = [];

    // Transfer event signature
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    // Adresse wallet paddée sur 32 bytes pour le filtre topic
    const walletPadded = '0x000000000000000000000000' + WALLET_BEP20.slice(2).toLowerCase();

    const BSC_RPCS = [
      'https://bsc-dataseed1.binance.org/',
      'https://bsc-dataseed2.binance.org/',
      'https://rpc.ankr.com/bsc',
    ];

    // Récupérer le bloc actuel
    let currentBlock = null;
    for (const rpc of BSC_RPCS) {
      try {
        const r = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc:'2.0', method:'eth_blockNumber', params:[], id:1 }),
          signal: AbortSignal.timeout(5000)
        });
        const d = await r.json();
        if (d.result) { currentBlock = parseInt(d.result, 16); break; }
      } catch(_) {}
    }

    if (currentBlock) {
      // Chercher dans les 1200 derniers blocs (~1 heure sur BSC)
      const fromBlock = '0x' + Math.max(0, currentBlock - 1200).toString(16);
      for (const rpc of BSC_RPCS) {
        try {
          const r = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'eth_getLogs', id: 2,
              params: [{ fromBlock, toBlock: 'latest', address: USDT_BEP20, topics: [TRANSFER_TOPIC, null, walletPadded] }]
            }),
            signal: AbortSignal.timeout(8000)
          });
          const d = await r.json();
          if (Array.isArray(d.result) && d.result.length > 0) {
            transfers.push(...d.result);
            break;
          }
        } catch(e) { bepErrors.push('RPC:' + e.message); }
      }
    } else {
      bepErrors.push('RPC:impossible de récupérer le bloc');
    }

    function matchBep20(tx) {
      // tx.data contient le montant en hex (eth_getLogs)
      const hexVal = tx.data || '0x0';
      try {
        const val = BigInt(hexVal);
        if (val.toString() === rawExpectedBep) return true;
        const diff = Math.abs(Number(val) / 1e18 - amtExpected);
        return diff < 0.01;
      } catch(_) { return false; }
    }

    const found = transfers.find(tx => matchBep20(tx));

    if (!found) {
      const sample = transfers.slice(0, 3).map(tx => ({ data: tx.data, topics: tx.topics }));
      return res.json({ found: false, debug: { rawExpectedBep, amtExpected, total: transfers.length, sample, errors: bepErrors, currentBlock } });
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

    // Toutes les sources en PARALLÈLE pour aller vite
    const [r1, r2] = await Promise.allSettled([

      // Source 1 : TronGrid avec clé API
      (async () => {
        const tgKey = process.env.TRONGRID_API_KEY || '64b93951-8b4c-439c-9758-677468c639c1';
        const tgRes = await fetch(
          `https://api.trongrid.io/v1/accounts/${WALLET_TRC20}/transactions/trc20?limit=200&only_to=true&contract_address=${USDT_TRC20}`,
          { headers: { 'Accept': 'application/json', 'TRON-PRO-API-KEY': tgKey }, signal: AbortSignal.timeout(8000) }
        );
        if (!tgRes.ok) throw new Error('HTTP ' + tgRes.status);
        const d = await tgRes.json();
        return d.data || [];
      })(),

      // Source 2 : TronScan avec headers navigateur
      (async () => {
        const tsRes = await fetch(
          `https://apilist.tronscan.org/api/token_trc20/transfers?toAddress=${WALLET_TRC20}&limit=200&start=0`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://tronscan.org/',
              'Origin': 'https://tronscan.org'
            },
            signal: AbortSignal.timeout(8000)
          }
        );
        if (!tsRes.ok) throw new Error('HTTP ' + tsRes.status);
        const d = await tsRes.json();
        return d.token_transfers || d.data || d.transferList || [];
      })(),
    ]);

    if (r1.status === 'fulfilled') transfers.push(...r1.value);
    else errors.push('TronGrid:' + r1.reason.message);

    if (r2.status === 'fulfilled') transfers.push(...r2.value);
    else errors.push('TronScan:' + r2.reason.message);

    const found = transfers.find(tx => matchAmount(tx) && isUSDT(tx));

    if (!found) {
      const sample = transfers.slice(0, 3).map(tx => ({
        quant: tx.quant, value: tx.value, amount: tx.amount,
        tokenAbbr: (tx.tokenInfo || tx.token_info || {}).tokenAbbr || (tx.token_info || {}).symbol,
      }));
      return res.json({ found: false, debug: { rawExpected, amtExpected, total: transfers.length, sample, errors } });
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
