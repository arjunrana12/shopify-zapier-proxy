// /api/send-to-zapier.js
export default async function handler(req, res) {
  // --- Always set CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "https://10rajk-w9.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  // --- Handle preflight (OPTIONS) ---
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Only POST allowed ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, product } = req.body || {};
    if (!email || !product) {
      return res.status(400).json({ error: "Missing required fields (email, product)" });
    }

    // Zapier Webhook URL
    const zapierWebhookURL =
      process.env.ZAPIER_WEBHOOK_URL ||
      "https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/";

    // Forward payload to Zapier
    const z = await fetch(zapierWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product }),
    });

    if (!z.ok) {
      const t = await z.text();
      console.error("❌ Zapier error:", t);
      return res.status(502).json({ error: "Zapier forwarding failed" });
    }

    return res.status(200).json({ message: "✅ Email sent successfully" });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
