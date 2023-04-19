/*
  Warnings:

  - A unique constraint covering the columns `[title,series,season]` on the table `Round` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Round_title_series_season_key" ON "Round"("title", "series", "season");
