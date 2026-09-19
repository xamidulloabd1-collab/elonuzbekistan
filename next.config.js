/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' } // e'lon rasmlari tashqi URL orqali saqlanadi
    ]
  },
  experimental: {
    // Next.js sahifalarni brauzerda ~30 soniyaga keshlab qo'yadi (client-side
    // router cache). Bizning ilovamizda har bir sahifa joriy foydalanuvchiga
    // bog'liq (login/logout, admin/oddiy foydalanuvchi), shuning uchun bu
    // kesh o'chirilgan - aks holda hisobni almashtirgandan keyin ba'zan
    // eski foydalanuvchining ma'lumoti bir muddat ko'rinib turishi mumkin.
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
};

module.exports = nextConfig;
