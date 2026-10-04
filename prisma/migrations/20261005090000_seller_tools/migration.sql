-- Sotuvchi vositalari: tuman, belgilar, raqam statistikasi, do'kon sahifasi, AI limiti

-- AlterTable
ALTER TABLE "listings" ADD COLUMN "district" TEXT,
ADD COLUMN "exchangeable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "installment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "phoneReveals" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "shopAddress" TEXT,
ADD COLUMN "shopDescription" TEXT,
ADD COLUMN "shopHours" TEXT,
ADD COLUMN "shopLogo" TEXT,
ADD COLUMN "shopName" TEXT;

-- CreateTable
CREATE TABLE "listing_daily_stats" (
    "listingId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "phoneReveals" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_daily_stats_pkey" PRIMARY KEY ("listingId","day")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("userId","day")
);

-- CreateIndex
CREATE INDEX "listings_region_district_idx" ON "listings"("region", "district");

-- AddForeignKey
ALTER TABLE "listing_daily_stats" ADD CONSTRAINT "listing_daily_stats_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
