export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, product } = req.body;

  if (!email || !product) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 📦 Log the payload
  console.log('📩 Incoming email share request:', { email, product });

  // Example: Forward to a Zapier webhook (optional)
  const zapierWebhookURL = 'https://hooks.zapier.com/hooks/catch/24465525/uh7f1wi/'; // Replace with your Zapier URL

  try {
    const zapierRes = await fetch(zapierWebhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, product })
    });

    if (!zapierRes.ok) {
      const errorText = await zapierRes.text();
      console.error('❌ Zapier error:', errorText);
      return res.status(500).json({ error: 'Failed to forward to Zapier' });
    }

    console.log('✅ Data successfully sent to Zapier');

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
