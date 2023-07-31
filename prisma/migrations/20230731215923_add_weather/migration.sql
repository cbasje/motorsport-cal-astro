/*
  Warnings:

  - You are about to drop the column `region` on the `Circuit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Circuit" DROP COLUMN "region",
ADD COLUMN     "utcOffset" INTEGER;

-- CreateTable
CREATE TABLE "Weather" (
    "id" TEXT NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "weatherId" INTEGER NOT NULL,
    "circuitId" TEXT,

    CONSTRAINT "Weather_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Weather" ADD CONSTRAINT "Weather_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
