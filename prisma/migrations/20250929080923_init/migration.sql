-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('draft', 'running', 'finished');

-- CreateEnum
CREATE TYPE "public"."PlayerStatus" AS ENUM ('invited', 'joined');

-- CreateEnum
CREATE TYPE "public"."TermSource" AS ENUM ('default', 'custom', 'replaced');

-- CreateTable
CREATE TABLE "public"."games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" "public"."GameStatus" NOT NULL DEFAULT 'draft',
    "ownerEmail" TEXT NOT NULL,
    "gridSize" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."players" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."PlayerStatus" NOT NULL DEFAULT 'invited',
    "inviteTokenHash" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "isWinner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."terms" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "source" "public"."TermSource" NOT NULL DEFAULT 'default',

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cards" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."card_cells" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "termId" TEXT NOT NULL,
    "markedByPlayerId" TEXT,
    "markedAt" TIMESTAMP(3),

    CONSTRAINT "card_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_logs" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cards_gameId_playerId_key" ON "public"."cards"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "card_cells_cardId_row_col_key" ON "public"."card_cells"("cardId", "row", "col");

-- AddForeignKey
ALTER TABLE "public"."players" ADD CONSTRAINT "players_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."terms" ADD CONSTRAINT "terms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_cells" ADD CONSTRAINT "card_cells_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_cells" ADD CONSTRAINT "card_cells_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_cells" ADD CONSTRAINT "card_cells_markedByPlayerId_fkey" FOREIGN KEY ("markedByPlayerId") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_logs" ADD CONSTRAINT "event_logs_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
