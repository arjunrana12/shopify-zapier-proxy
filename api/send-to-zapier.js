export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://10rajk-w9.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { email, product } = req.body || {};
    if (!email || !product) {
      return res.status(400).json({ error: "Missing required fields (email, product)" });
    }

    const productHTML = `
      <h1>🛍️ New Product Interest</h1>
      <p>Email: ${email}</p>
      <p><strong>Title:</strong> ${product.title}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <p><strong>SKU:</strong> ${product.sku}</p>
      ${product.image ? `<img src="${product.image}" width="200" />` : ""}
    `;

    // ✅ Flat JSON payload for Zapier
    const payload = {
      email,
      subject: `Order Interest: ${product.title || "Unknown Product"}`,
      product_image: product.image || "",
      product_title: product.title || "N/A",
      product_price: product.price || "0.00",
      product_sku: product.sku || "N/A",
      body_html: productHTML,
      body_text: `New interest from ${email}
Product: ${product.title}
Price: $${product.price}
SKU: ${product.sku}`
    };

    const z = await fetch(
      process.env.ZAPIER_WEBHOOK_URL || "YOUR_REAL_ZAPIER_HOOK_URL",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!z.ok) {
      const t = await z.text();
      console.error("❌ Zapier error:", t);
      return res.status(502).json({ error: "Zapier forwarding failed" });
    }

    return res.status(200).json({ message: "✅ Sent to Zapier successfully" });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
