// lib/blocks.js - Foydalanuvchilar orasidagi bloklash holati
import { prisma } from './prisma';

/** { blockedByMe, blockedMe } - ikki foydalanuvchi orasidagi bloklash holati */
export async function getBlockState(meId, otherId) {
  const rows = await prisma.userBlock.findMany({
    where: {
      OR: [
        { blockerId: meId, blockedId: otherId },
        { blockerId: otherId, blockedId: meId },
      ],
    },
    select: { blockerId: true },
  });
  return {
    blockedByMe: rows.some((r) => r.blockerId === meId),
    blockedMe: rows.some((r) => r.blockerId === otherId),
  };
}

export async function isBlockedEitherWay(aId, bId) {
  const s = await getBlockState(aId, bId);
  return s.blockedByMe || s.blockedMe;
}
