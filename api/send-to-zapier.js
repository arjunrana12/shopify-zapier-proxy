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

    // 🛠️ Flatten product into structured fields
    const productDetails = {
      title: product.title || "N/A",
      price: product.price || "N/A",
      sku: product.sku || "N/A",
      image: product.image || "N/A",
      url: product.url || "N/A",
    };

    // 📝 Create a formatted text block (for Slack/Email body)
    const attachment = `
📦 Product Details
---------------------
📝 Title: ${productDetails.title}
💰 Price: ${productDetails.price}
🔖 SKU: ${productDetails.sku}
🖼️ Image: ${productDetails.image}
🔗 URL: ${productDetails.url}

👤 Sender: ${sender || "N/A"}
✉️ Recipient: ${email}
💬 Message: ${message || "No message provided"}
    `.trim();

    // 🚀 Final payload to Zapier
    const payload = {
      email,
      sender: sender || "",
      message: message || "",
      ...productDetails,   // keeps individual fields available
      attachment           // full block of text in one variable
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
