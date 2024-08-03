/*
  Warnings:

  - The primary key for the `Film` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_filmId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- AlterTable
ALTER TABLE "Film" DROP CONSTRAINT "Film_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "videoUrl" DROP NOT NULL,
ADD CONSTRAINT "Film_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Film_id_seq";

-- AlterTable
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "filmId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Purchase_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
