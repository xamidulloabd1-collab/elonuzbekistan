// scripts/set-telegram-webhook.js
// @elonuzz_bot webhook'ini saytga ulaydi (bir marta ishga tushiriladi).
// Ishlatish:  node scripts/set-telegram-webhook.js https://elonuz.com
//
// .env'da TELEGRAM_BOT_TOKEN va TELEGRAM_WEBHOOK_SECRET bo'lishi kerak
// (Netlify'dagi qiymatlar bilan AYNAN bir xil).

require('dotenv').config();

async function main() {
  const site = (process.argv[2] || '').replace(/\/+$/, '');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!site.startsWith('https://')) {
    console.error('❌ Sayt manzilini kiriting:  node scripts/set-telegram-webhook.js https://elonuz.com');
    process.exit(1);
  }
  if (!token || !secret) {
    console.error("❌ .env'da TELEGRAM_BOT_TOKEN va TELEGRAM_WEBHOOK_SECRET bo'lishi kerak");
    process.exit(1);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `${site}/api/telegram/webhook`,
      secret_token: secret,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('❌ Xatolik:', data.description);
    process.exit(1);
  }

  const info = await (await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)).json();
  console.log('✅ Webhook ulandi:', info.result.url);
  if (info.result.last_error_message) console.log('⚠️  Oxirgi xato:', info.result.last_error_message);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
