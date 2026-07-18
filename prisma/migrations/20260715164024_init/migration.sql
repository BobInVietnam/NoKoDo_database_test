/*
  Warnings:

  - Added the required column `results` to the `student_lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_lesson" ADD COLUMN     "results" JSONB NOT NULL;
