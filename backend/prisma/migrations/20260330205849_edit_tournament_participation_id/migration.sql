/*
  Warnings:

  - The primary key for the `TournamentParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TournamentParticipant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TournamentParticipant_tournamentId_playerId_key";

-- AlterTable
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("tournamentId", "playerId");
