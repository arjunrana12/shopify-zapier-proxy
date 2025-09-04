export default async function handler(req, res) {
  // ✅ Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    // Must return headers for preflight too!
    return res.status(200).end();
  }

  // ✅ Only allow POST requests
  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com') // repeat here
      .json({ error: 'Method Not Allowed' });
  }

  const { email, product } = req.body;

  if (!email || !product) {
    return res
      .status(400)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com') // repeat here
      .json({ error: 'Missing required fields' });
  }

  try {                       
    const zapierWebhookURL = 'https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/';

    const zapierRes = await fetch(zapierWebhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, product })
    });

    if (!zapierRes.ok) {
      const errorText = await zapierRes.text();
      console.error('❌ Zapier error:', errorText);
      return res
        .status(500)
        .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com') // repeat here
        .json({ error: 'Failed to forward to Zapier' });
    }

    return res
      .status(200)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com') // repeat here
      .json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res
      .status(500)
      .setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com') // repeat here
      .json({ error: 'Internal Server Error' });
  }
}
