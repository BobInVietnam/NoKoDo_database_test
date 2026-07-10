/*
  Warnings:

  - You are about to alter the column `totalTime` on the `student` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "student" ALTER COLUMN "totalTime" SET DATA TYPE INTEGER;
