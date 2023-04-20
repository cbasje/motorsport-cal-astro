-- CreateEnum
CREATE TYPE "SeriesId" AS ENUM ('F1', 'F2', 'FE', 'XE', 'INDY', 'W', 'WEC', 'F1A');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRACTICE', 'QUALIFYING', 'RACE', 'SHAKEDOWN', 'SPRINT');

-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "wikipediaPageId" INTEGER,
    "lon" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "link" TEXT,
    "circuitId" TEXT NOT NULL,
    "series" "SeriesId" NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "roundId" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_title_key" ON "Circuit"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Round_title_number_series_season_key" ON "Round"("title", "number", "series", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Session_type_number_roundId_key" ON "Session"("type", "number", "roundId");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
