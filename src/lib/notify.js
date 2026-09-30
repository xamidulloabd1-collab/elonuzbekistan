// lib/notify.js - Foydalanuvchiga Telegram bot orqali shaxsiy bildirishnoma
//
// Faqat Telegram'ini ulagan foydalanuvchilarga yuboriladi (telegramChatId bor).
// Foydalanuvchi botni bloklagan bo'lsa (403), ulanish avtomatik uziladi.
import { prisma } from './prisma';
import { botApi } from './telegramBot';

/**
 * @param {{id: string, telegramChatId?: string|null}} user
 * @returns {Promise<boolean>} yuborildimi
 */
export async function notifyUser(user, text, extra = {}) {
  if (!user?.telegramChatId || !process.env.TELEGRAM_BOT_TOKEN) return false;
  try {
    await botApi('sendMessage', {
      chat_id: user.telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    });
    return true;
  } catch (err) {
    const msg = String(err.message || '');
    if (/blocked|deactivated|chat not found|Forbidden/i.test(msg)) {
      await prisma.user
        .updateMany({ where: { id: user.id, telegramChatId: user.telegramChatId }, data: { telegramChatId: null } })
        .catch(() => {});
    }
    console.error('Bildirishnoma yuborilmadi:', msg);
    return false;
  }
}

/** Telegram chat'ini foydalanuvchiga bog'lash (bitta chat - bitta akkaunt) */
export async function linkTelegramChat(userId, chatId) {
  const id = String(chatId);
  await prisma.$transaction([
    prisma.user.updateMany({ where: { telegramChatId: id, NOT: { id: userId } }, data: { telegramChatId: null } }),
    prisma.user.update({ where: { id: userId }, data: { telegramChatId: id } }),
  ]);
}
