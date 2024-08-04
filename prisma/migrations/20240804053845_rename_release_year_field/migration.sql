/*
  Warnings:

  - You are about to drop the column `releaseYear` on the `Film` table. All the data in the column will be lost.
  - Added the required column `release_year` to the `Film` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Film" DROP COLUMN "releaseYear",
ADD COLUMN     "release_year" INTEGER NOT NULL;
