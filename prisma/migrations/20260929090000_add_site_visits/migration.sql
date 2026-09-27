-- Sayt tashriflari statistikasi

-- CreateTable
CREATE TABLE "site_visits" (
    "day" DATE NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("day","visitorHash")
);

-- CreateIndex
CREATE INDEX "site_visits_day_idx" ON "site_visits"("day");
