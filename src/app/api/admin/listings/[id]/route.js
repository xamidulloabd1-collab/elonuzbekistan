// app/api/admin/listings/[id]/route.js - Adminning istalgan e'lonni butunlay
// o'chirishi (egasidan qat'iy nazar)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "E'lon o'chirildi" });
  } catch (err) {
    console.error("Admin: e'lonni o'chirishda xatolik:", err);
    return NextResponse.json({ message: "E'lonni o'chirib bo'lmadi" }, { status: 500 });
  }
}
