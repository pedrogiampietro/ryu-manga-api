-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "font" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "theme" "Theme",
ADD COLUMN     "urls" TEXT[],
ADD COLUMN     "username" TEXT;
