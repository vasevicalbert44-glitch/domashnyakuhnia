exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  let o;
  try { o = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Bad JSON" }; }

  const lines = (o.items || []).map(i => `• ${i.name} × ${i.qty} = ${i.qty * i.price} грн`).join("\n");
  const where = o.mode === "pickup" ? `Самовивіз: ${o.pickup}` : `Доставка: ${o.address}`;
  const text =
`🆕 НОВЕ ЗАМОВЛЕННЯ
👤 ${o.name}
📞 ${o.phone}
📍 ${where}

${lines}
${o.discount ? `\n🎁 Знижка 10%: −${o.discount} грн` : ""}
🚚 ${o.freeDelivery ? "Доставка безкоштовна" : "Доставка 25 грн/км"}
💰 Разом: ${o.total} грн
${o.comment ? `\n💬 ${o.comment}` : ""}`;

  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
  });

  return { statusCode: r.ok ? 200 : 502, body: r.ok ? "ok" : "telegram error" };
};
