// scripts/make-admin.js
// Berilgan telefon raqamli foydalanuvchini administrator qilib belgilaydi.
// Ishlatish: node scripts/make-admin.js +998901234567
//
// Bu CommonJS skript - package.json'da "type": "module" o'rnatilmagani
// uchun oddiy require() bilan ishlaydi (Next.js'ning src/ ichidagi
// import/export sintaksisidan farqli).

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const phoneArg = process.argv[2];

  if (!phoneArg) {
    console.error('❌ Telefon raqamni kiriting. Masalan:');
    console.error('   node scripts/make-admin.js +998901234567');
    process.exit(1);
  }

  const phone = String(phoneArg).replace(/[^\d+]/g, '');

  try {
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      console.error(`❌ "${phone}" raqamli foydalanuvchi topilmadi. Avval shu raqam bilan ro'yxatdan o'tkazing.`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️  ${user.name} (${phone}) allaqachon admin.`);
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ ${updated.name} (${phone}) endi administrator!`);
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
