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

    // ✅ Create a nice HTML design for product details
    const productHTML = `
      <h2 style="color:#333;">🛍️ Product Details</h2>
      <table border="1" cellspacing="0" cellpadding="8" 
             style="border-collapse:collapse; width:100%; max-width:500px;">
        <tr>
          <th align="left">Name</th>
          <td>${product.title || "N/A"}</td>
        </tr>
        <tr>
          <th align="left">Price</th>
          <td>$${product.price || "0.00"}</td>
        </tr>
        <tr>
          <th align="left">Quantity</th>
          <td>${product.quantity || 1}</td>
        </tr>
        ${
          product.image
            ? `<tr>
                <th align="left">Image</th>
                <td>
                  <img src="${product.image}" alt="${product.title}" width="120" />
                </td>
              </tr>`
            : ""
        }
      </table>
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
        body_html: `
          <div style="font-family:Arial,sans-serif; line-height:1.5;">
            <h1 style="color:#444;">New Product Interest</h1>
            <p><strong>Email:</strong> ${email}</p>
            ${productHTML}
          </div>
        `,
        // fallback plain text
        body_text: `New interest from ${email}\nProduct: ${product.title}\nPrice: $${product.price}\nQuantity: ${product.quantity}`
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
