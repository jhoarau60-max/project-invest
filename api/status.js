const SUPABASE_URL = 'https://cvggxktybzbrtskcwlxp.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY = process.env.SUPABASE_ANON_KEY;

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.john_status&select=value`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
      });
      const data = await r.json();
      return res.status(200).json({ online: (data[0]?.value || 'online') === 'online' });
    } catch {
      return res.status(200).json({ online: true });
    }
  }

  if (req.method === 'POST') {
    const { status, token } = req.body;
    if (!['online', 'offline'].includes(status)) return res.status(400).json({ error: 'Invalid' });

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: KEY, Authorization: `Bearer ${token}` }
    });
    if (!userRes.ok) return res.status(401).json({ error: 'Non autorisé' });

    await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.john_status`, {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ value: status })
    });

    return res.status(200).json({ ok: true, status });
  }

  return res.status(405).end();
}
