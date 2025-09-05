export default async function handler(req, res) {
  // ✅ Allow Shopify frontend
  res.setHeader('Access-Control-Allow-Origin', 'https://10rajk-w9.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method Not Allowed' });
  }

  const { email, product } = req.body;

  if (!email || !product) {
    return res
      .status(400)
      .json({ error: 'Missing required fields (email, product)' });
  }

  try {
    const zapierWebhookURL = 'https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/';

    // Forward email + product details to Zapier
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
        .json({ error: 'Failed to forward to Zapier' });
    }

    return res
      .status(200)
      .json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res
      .status(500)
      .json({ error: 'Internal Server Error' });
  }
}
