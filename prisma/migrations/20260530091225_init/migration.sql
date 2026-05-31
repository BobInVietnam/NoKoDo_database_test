/*
  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classid_fkey";

-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_teacherid_fkey";

-- DropForeignKey
ALTER TABLE "student_test_status" DROP CONSTRAINT "student_test_status_studentid_fkey";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "Teacher";

-- CreateTable
CREATE TABLE "teacher" (
    "uid" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "student" (
    "uid" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT,
    "classid" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_pkey" PRIMARY KEY ("uid")
);

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_classid_fkey" FOREIGN KEY ("classid") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_teacherid_fkey" FOREIGN KEY ("teacherid") REFERENCES "teacher"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_status" ADD CONSTRAINT "student_test_status_studentid_fkey" FOREIGN KEY ("studentid") REFERENCES "student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
