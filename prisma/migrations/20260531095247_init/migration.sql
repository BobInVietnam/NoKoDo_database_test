/*
  Warnings:

  - The primary key for the `student_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sessionid` on the `student_answer` table. All the data in the column will be lost.
  - The primary key for the `student_test_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sessionid` on the `student_test_status` table. All the data in the column will be lost.
  - Added the required column `dateCreated` to the `student_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentid` to the `student_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testid` to the `student_answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_sessionid_fkey";

-- AlterTable
ALTER TABLE "student_answer" DROP CONSTRAINT "student_answer_pkey",
DROP COLUMN "sessionid",
ADD COLUMN     "dateCreated" INTEGER NOT NULL,
ADD COLUMN     "studentid" TEXT NOT NULL,
ADD COLUMN     "testid" INTEGER NOT NULL,
ADD CONSTRAINT "student_answer_pkey" PRIMARY KEY ("studentid", "testid", "dateCreated", "questionid");

-- AlterTable
ALTER TABLE "student_test_status" DROP CONSTRAINT "student_test_status_pkey",
DROP COLUMN "sessionid",
ADD CONSTRAINT "student_test_status_pkey" PRIMARY KEY ("studentid", "testid", "date_created");

-- AddForeignKey
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_studentid_testid_dateCreated_fkey" FOREIGN KEY ("studentid", "testid", "dateCreated") REFERENCES "student_test_status"("studentid", "testid", "date_created") ON DELETE RESTRICT ON UPDATE CASCADE;
