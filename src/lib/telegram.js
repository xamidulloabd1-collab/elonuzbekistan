// lib/telegram.js - Telegram Bot API orqali admin'ga xabar yuborish
// (tarif arizasi kelganda ishlatiladi - to'lov onlayn qabul qilinmaydi,
// operator qo'lda bog'lanadi va so'ng admin panelda tasdiqlaydi)

export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("⚠️  Telegram bot sozlanmagan (.env). Xabar yuborilmadi:", text);
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    if (!data.ok) console.error('Telegram API xatosi:', data);
    return data;
  } catch (err) {
    console.error('Telegramga yuborishda xatolik:', err.message);
    return { ok: false, reason: 'network_error' };
  }
}