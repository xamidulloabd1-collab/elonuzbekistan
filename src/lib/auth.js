// lib/auth.js - Parol xeshlash, JWT token va joriy foydalanuvchini aniqlash

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { checkAndExpireSubscription } from './subscription';

const JWT_SECRET = process.env.JWT_SECRET || 'elonuz_maxfiy_kalit_2026';
const COOKIE_NAME = 'elonuz_token';
const TOKEN_TTL = '30d';

// --- Parollar ---
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// --- JWT tokenlar ---
export function signToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // yaroqsiz yoki muddati tugagan token
  }
}

// --- Cookie orqali sessiyani boshqarish ---
// httpOnly cookie ishlatamiz - shunda token brauzerdagi JavaScript orqali
// o'qib bo'lmaydi (XSS xavfini kamaytiradi), lekin har bir so'rovda
// avtomatik serverga yuboriladi.
export function setAuthCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 kun (soniyalarda)
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

/**
 * Joriy so'rovdagi cookie asosida tizimga kirgan foydalanuvchini bazadan topadi.
 * Agar token bo'lmasa yoki yaroqsiz bo'lsa - null qaytaradi (xato tashlamaydi),
 * chunki ko'p joylarda "tizimga kirmagan bo'lsa ham sahifa ochilaversin" holati kerak bo'ladi.
 */
export async function getCurrentUser() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, name: true, phone: true, role: true, telegramUsername: true, createdAt: true,
        subscriptionPlan: true, subscriptionStatus: true, subscriptionExpiresAt: true, vipListingsUsed: true,
      },
    });

    if (!user) return null;

    // Muddati o'tgan "active" obunani "expired"ga avtomatik yangilaymiz
    return await checkAndExpireSubscription(user);
  } catch (err) {
    console.error('getCurrentUser xatosi:', err.message);
    return null;
  }
}

/**
 * API route handlerlar uchun: foydalanuvchi tizimga kirgan bo'lishini talab qiladi.
 * Agar kirmagan bo'lsa, chaqirgan joyga null qaytaradi - route handler o'zi 401 qaytarishi kerak.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  return user; // null bo'lishi mumkin - chaqiruvchi tekshirishi kerak
}

/**
 * Faqat administratorlar uchun. requireUser bilan birga ishlatiladi.
 */
export function isAdmin(user) {
  return !!user && user.role === 'ADMIN';
}
