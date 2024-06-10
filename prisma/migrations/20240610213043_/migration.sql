/*
  Warnings:

  - Added the required column `previousProgress` to the `LastWatched` table without a default value. This is not possible if the table is not empty.
  - Made the column `progress` on table `LastWatched` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LastWatched" ADD COLUMN     "previousProgress" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "progress" SET NOT NULL;
