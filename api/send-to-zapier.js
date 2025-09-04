export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com')
      .json({ error: 'Method Not Allowed' });
  }

  const { email, query } = req.body;

  if (!email || !query) {
    return res
      .status(400)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com')
      .json({ error: 'Missing required fields' });
  }

  try {
    const zapierWebhookURL = 'https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/';

    const zapierRes = await fetch(zapierWebhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, query })
    });

    if (!zapierRes.ok) {
      const errorText = await zapierRes.text();
      console.error('❌ Zapier error:', errorText);
      return res
        .status(500)
        .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com')
        .json({ error: 'Failed to forward to Zapier' });
    }

    return res
      .status(200)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com')
      .json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res
      .status(500)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com')
      .json({ error: 'Internal Server Error' });
  }
}
