-- CreateEnum
CREATE TYPE "Category" AS ENUM ('KOCHMAS_MULK', 'TRANSPORT', 'ELEKTRONIKA', 'ISH_ORINLARI', 'XIZMATLAR', 'UY_JIHOZLARI', 'KIYIM_ODA', 'BOSHQA');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TOSHKENT_SHAHAR', 'ANDIJON', 'BUXORO', 'FARGONA', 'JIZZAX', 'XORAZM', 'NAMANGAN', 'NAVOIY', 'QASHQADARYO', 'QORAQALPOGISTON', 'SAMARQAND', 'SIRDARYO', 'SURXONDARYO', 'TOSHKENT_VILOYATI');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UZS', 'USD');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TADBIRKOR', 'BIZNES');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "subscriptionPlan" "SubscriptionPlan",
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "region" "Region" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'UZS',
    "contactPhone" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "listings_category_idx" ON "listings"("category");

-- CreateIndex
CREATE INDEX "listings_region_idx" ON "listings"("region");

-- CreateIndex
CREATE INDEX "listings_price_idx" ON "listings"("price");

-- CreateIndex
CREATE INDEX "listings_createdAt_idx" ON "listings"("createdAt");

-- CreateIndex
CREATE INDEX "listings_isVip_idx" ON "listings"("isVip");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
