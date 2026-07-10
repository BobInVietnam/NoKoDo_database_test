/*
  Warnings:

  - You are about to drop the column `class name` on the `class` table. All the data in the column will be lost.
  - You are about to drop the column `averageScore` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `totalExamDone` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `totalLessonDone` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `totalTime` on the `student` table. All the data in the column will be lost.
  - The primary key for the `student_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateCreated` on the `student_answer` table. All the data in the column will be lost.
  - Added the required column `class_name` to the `class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_created` to the `student_answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_studentid_testid_dateCreated_fkey";

-- AlterTable
ALTER TABLE "class" DROP COLUMN "class name",
ADD COLUMN     "class_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student" DROP COLUMN "averageScore",
DROP COLUMN "totalExamDone",
DROP COLUMN "totalLessonDone",
DROP COLUMN "totalTime",
ADD COLUMN     "average_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_exam_done" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_lesson_done" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_pkey",
DROP COLUMN "dateCreated",
ADD COLUMN     "date_created" BIGINT NOT NULL,
ADD CONSTRAINT "student_answer_pkey" PRIMARY KEY ("studentid", "testid", "date_created", "questionid");

-- AddForeignKey
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_studentid_testid_date_created_fkey" FOREIGN KEY ("studentid", "testid", "date_created") REFERENCES "student_test_status"("studentid", "testid", "date_created") ON DELETE RESTRICT ON UPDATE CASCADE;
