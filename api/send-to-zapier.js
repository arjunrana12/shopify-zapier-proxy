export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/24465525/uh7f1wi/';
    const payload = req.body;

    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await zapierResponse.text();

    if (zapierResponse.ok) {
      return res.status(200).json({ success: true, zapierResponse: responseText });
    } else {
      return res.status(500).json({ success: false, zapierResponse: responseText });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
