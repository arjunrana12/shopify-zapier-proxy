export default async function handler(req, res) {
  // ✅ Allow CORS for your Shopify store
  res.setHeader("Access-Control-Allow-Origin", "https://10rajk-w9.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, product } = req.body || {};
    if (!email || !product) {
      return res.status(400).json({ error: "Missing required fields (email, product)" });
    }

    // ✅ Styled HTML for email body
    const productHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #2c3e50; text-align: center;">🛍️ New Product Interest</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">
          A customer has shown interest in the following product:
        </p>
        
        <div style="text-align: center; margin: 20px 0;">
          ${
            product.image
              ? `<img src="${product.image}" alt="${product.title}" style="max-width: 200px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" />`
              : ""
          }
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Title</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${product.title || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Price</td>
            <td style="padding: 10px; border: 1px solid #ddd;">$${product.price || "0.00"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">SKU</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${product.sku || "Not Available"}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; font-size: 14px; color: #777; text-align: center;">
          Customer Email: <strong>${email}</strong>
        </p>
      </div>
    `;

    // ✅ Zapier Webhook
    const zapierWebhookURL =
      process.env.ZAPIER_WEBHOOK_URL ||
      "https://hooks.zapier.com/hooks/catch/24465525/ud3um2n/";

    const z = await fetch(zapierWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        subject: `Order Interest: ${product.title || "Unknown Product"}`,
        body_html: productHTML,
        body_text: `New interest from ${email}
Product: ${product.title}
Price: $${product.price}
SKU: ${product.sku}`,
        // 👇 Attachments (Zapier will try to download these files)
        attachments: product.image ? [product.image] : []
      })
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
