/*
  Warnings:

  - You are about to drop the column `sport` on the `Round` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,series,season]` on the table `Round` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `series` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Made the column `number` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SeriesId" AS ENUM ('F1', 'FE', 'XE', 'INDY', 'W', 'WEC');

-- DropIndex
DROP INDEX "Round_title_sport_season_key";

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "sport",
ADD COLUMN     "series" "SeriesId" NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "number" SET NOT NULL,
ALTER COLUMN "number" SET DEFAULT 0;

-- DropEnum
DROP TYPE "Sport";

-- CreateIndex
CREATE UNIQUE INDEX "Round_title_series_season_key" ON "Round"("title", "series", "season");
