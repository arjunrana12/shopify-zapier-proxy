// /api/send-to-zapier.js
// Node 18+ on Vercel has global fetch.

export default async function handler(req, res) {
  // --- CORS: allow only your Shopify storefront ---
  const origin = req.headers.origin;
  const ALLOWED = ["https://10rajk-w9.myshopify.com"];
  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, product } = req.body || {};
    if (!email || !product) {
      return res.status(400).json({ error: "Missing required fields (email, product)" });
    }

    // Your Zapier Catch Hook (or set as env var in Vercel)
    const zapierWebhookURL =
      process.env.ZAPIER_WEBHOOK_URL ||
      "https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/";

    // Forward payload to Zapier
    const z = await fetch(zapierWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product })
    });

    if (!z.ok) {
      const t = await z.text();
      console.error("Zapier error:", t);
      return res.status(502).json({ error: "Zapier forwarding failed" });
    }

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
