/*
  Warnings:

  - Added the required column `dt` to the `Weather` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `weatherId` on the `Weather` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Weather" ADD COLUMN     "dt" BIGINT NOT NULL,
DROP COLUMN "weatherId",
ADD COLUMN     "weatherId" TIMESTAMP(3) NOT NULL;
