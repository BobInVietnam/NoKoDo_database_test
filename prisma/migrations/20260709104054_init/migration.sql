/*
  Warnings:

  - Added the required column `description` to the `lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lesson" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "type" INTEGER NOT NULL;
