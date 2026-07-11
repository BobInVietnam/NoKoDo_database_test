/*
  Warnings:

  - You are about to drop the column `average_score` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `total_exam_done` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `total_lesson_done` on the `student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student" DROP COLUMN "average_score",
DROP COLUMN "total_exam_done",
DROP COLUMN "total_lesson_done";
