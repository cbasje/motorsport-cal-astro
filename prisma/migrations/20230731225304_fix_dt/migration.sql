/*
  Warnings:

  - Changed the type of `dt` on the `Weather` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `weatherId` on the `Weather` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Weather" DROP COLUMN "dt",
ADD COLUMN     "dt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "weatherId",
ADD COLUMN     "weatherId" INTEGER NOT NULL;
