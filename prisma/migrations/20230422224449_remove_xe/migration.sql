/*
  Warnings:

  - The values [XE] on the enum `SeriesId` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SeriesId_new" AS ENUM ('F1', 'F2', 'F3', 'FE', 'INDY', 'W', 'WEC', 'F1A');
ALTER TABLE "Round" ALTER COLUMN "series" TYPE "SeriesId_new" USING ("series"::text::"SeriesId_new");
ALTER TYPE "SeriesId" RENAME TO "SeriesId_old";
ALTER TYPE "SeriesId_new" RENAME TO "SeriesId";
DROP TYPE "SeriesId_old";
COMMIT;
