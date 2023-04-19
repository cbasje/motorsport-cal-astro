-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "wikipediaPageId" INTEGER,
    "lon" REAL,
    "lat" REAL
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "link" TEXT,
    "circuitId" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "roundId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Session_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_title_key" ON "Circuit"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Round_title_series_season_key" ON "Round"("title", "series", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Session_type_number_roundId_key" ON "Session"("type", "number", "roundId");
