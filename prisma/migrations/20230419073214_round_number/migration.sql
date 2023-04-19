-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "link" TEXT,
    "circuitId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Round" ("circuitId", "created_at", "id", "link", "season", "series", "title") SELECT "circuitId", "created_at", "id", "link", "season", "series", "title" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
CREATE UNIQUE INDEX "Round_title_number_series_season_key" ON "Round"("title", "number", "series", "season");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
