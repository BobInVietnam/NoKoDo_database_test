/*
  Warnings:

  - The primary key for the `student_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `student_test_status` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_studentid_testid_dateCreated_fkey";

-- AlterTable
ALTER TABLE "lesson" ALTER COLUMN "date_created" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_pkey",
ALTER COLUMN "dateCreated" SET DATA TYPE BIGINT,
ADD CONSTRAINT "student_answer_pkey" PRIMARY KEY ("studentid", "testid", "dateCreated", "questionid");

-- AlterTable
ALTER TABLE "student_test_status" DROP CONSTRAINT "student_test_status_pkey",
ALTER COLUMN "date_created" SET DATA TYPE BIGINT,
ALTER COLUMN "date_finished" SET DATA TYPE BIGINT,
ADD CONSTRAINT "student_test_status_pkey" PRIMARY KEY ("studentid", "testid", "date_created");

-- AlterTable
ALTER TABLE "test" ALTER COLUMN "date_created" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_studentid_testid_dateCreated_fkey" FOREIGN KEY ("studentid", "testid", "dateCreated") REFERENCES "student_test_status"("studentid", "testid", "date_created") ON DELETE RESTRICT ON UPDATE CASCADE;
