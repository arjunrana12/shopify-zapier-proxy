export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://10rajk-w9.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { email, product, message, sender } = req.body || {};
    if (!email || !product) {
      return res.status(400).json({ error: "Missing required fields (email, product)" });
    }

    // Create a single field with all product details
    const attachment = `
📦 Product Details

📝 Title: ${product.title || "N/A"}
💰 Price: ${product.price || "N/A"}
🔖 SKU: ${product.sku || "N/A"}
🖼️ Image: ${product.image || "N/A"}
🔗 URL: ${product.url || "N/A"}

👤 Sender: ${sender || "N/A"}
✉️ Recipient: ${email}
💬 Message: ${message || "No message provided"}
    `.trim();

    // Send both individual fields + the combined one
    const payload = {
      email,
      sender: sender || "",
      message: message || "",
      product_title: product.title || "",
      product_price: product.price || "",
      product_sku: product.sku || "",
      product_image: product.image || "",
      product_url: product.url || "",
      attachment, // ✅ one big block
    };

    const zapierWebhookURL =
      process.env.ZAPIER_WEBHOOK_URL ||
      "https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/";

    const z = await fetch(zapierWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!z.ok) {
      const t = await z.text();
      console.error("❌ Zapier error:", t);
      return res.status(502).json({ error: "Zapier forwarding failed", details: t });
    }

    return res.status(200).json({ message: "✅ Email sent successfully", sent: payload });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
