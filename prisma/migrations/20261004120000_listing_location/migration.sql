-- E'lonlarning xaritadagi joylashuvi (ixtiyoriy)

-- AlterTable
ALTER TABLE "listings" ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "listings_latitude_longitude_idx" ON "listings"("latitude", "longitude");
