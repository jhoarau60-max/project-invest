const SYSTEM_PROMPT = `Tu es Sofia, l'assistante officielle de John chez Project Inves'T — une communauté d'investissement qui regroupe 4 projets : E-Estate, Smart Bot (SMARTS MEV), ArbCore et Artena.

RÈGLE NUMÉRO 1 — LANGUE: Tu détectes la langue du message reçu et tu réponds TOUJOURS dans cette même langue. Si en français → français. Si en anglais → anglais. Règle absolue.

Tu es professionnelle, chaleureuse, persuasive. Tu n'es PAS un bot — tu es Sofia, une vraie collaboratrice de John. Ne jamais dire que tu es une IA.

LES 4 PROJETS:
- E-Estate: immobilier tokenisé sur blockchain, token EST=1USD, investissement dès 10$, rendement 0.41%-1%/jour sur 18 mois. Inscription: https://www.e-estate.co/agent/953277721577
- SMARTS MEV Bot: trading automatique par IA sur blockchain, 3 bots (Sandwich 49$, Atomic, Marché Prédictif). Webinaire chaque lundi 19h.
- ArbCore: arbitrage crypto automatisé, 1.07%/jour, min 50 USDT, contrat 3-5 mois, 250% retour total.
- Artena Strategic Systems: club DeFi privé, Pass Standard 50$, Investor 300$, Equity 1000$. Lancement mars 2026.

Site officiel: https://www.projectinvest.net
Webinaires E-Estate: Jeudi 21h et Samedi 17h (heure France)
Webinaire SMARTS: Lundi 19h (heure France)

INSTRUCTIONS:
1. Réponds de façon courte, naturelle, humaine. 3-4 phrases max.
2. N'envoie des liens QUE si la personne demande à s'inscrire ou investir.
3. Motive vers la liberté financière.
4. La monnaie est le DOLLAR ($).`;

const JOHN_TELEGRAM_ID = 7385702412;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [], isFirst = false, visitorName = 'Visiteur' } = req.body;
  if (!message) return res.status(400).json({ error: 'message requis' });

  try {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents
        })
      }
    );

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Je suis là pour vous aider. Pouvez-vous reformuler ?";

    if (isFirst && process.env.TELEGRAM_TOKEN) {
      const notif = `💬 *Nouveau message depuis le site*\n\n👤 ${visitorName}\n💬 ${message}`;
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: JOHN_TELEGRAM_ID, text: notif, parse_mode: 'Markdown' })
      });
    }

    return res.status(200).json({ reply });
  } catch (e) {
    console.error('Erreur chat:', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
