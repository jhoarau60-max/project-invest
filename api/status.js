const SUPABASE_URL = 'https://cvggxktybzbrtskcwlxp.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z2d4a3R5YnpicnRza2N3bHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODM2MjcsImV4cCI6MjA4OTg1OTYyN30.cfHsAvmgcXYvedCz1fZCHlxOApupKCxnt8t9e8KzNBs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.john_status&select=value`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Cache-Control': 'no-cache' }
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
