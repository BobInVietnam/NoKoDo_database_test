-- AlterTable
ALTER TABLE "student" ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalExamDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLessonDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTime" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "student_lesson" (
    "studentid" TEXT NOT NULL,
    "lessonid" INTEGER NOT NULL,

    CONSTRAINT "student_lesson_pkey" PRIMARY KEY ("studentid","lessonid")
);

-- AddForeignKey
ALTER TABLE "student_lesson" ADD CONSTRAINT "student_lesson_studentid_fkey" FOREIGN KEY ("studentid") REFERENCES "student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_lesson" ADD CONSTRAINT "student_lesson_lessonid_fkey" FOREIGN KEY ("lessonid") REFERENCES "lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
