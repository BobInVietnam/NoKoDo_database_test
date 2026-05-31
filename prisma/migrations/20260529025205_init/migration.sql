-- CreateTable
CREATE TABLE "Teacher" (
    "uid" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Student" (
    "uid" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT,
    "classid" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "class" (
    "id" SERIAL NOT NULL,
    "class name" TEXT NOT NULL,
    "teacherid" TEXT NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "difficulty" INTEGER NOT NULL,
    "date_created" INTEGER NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_created" INTEGER NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "allowed_attempts" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "is_multiple_choice" INTEGER NOT NULL,
    "choices" TEXT NOT NULL,
    "testid" INTEGER NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_test_status" (
    "sessionid" SERIAL NOT NULL,
    "studentid" TEXT NOT NULL,
    "testid" INTEGER NOT NULL,
    "date_created" INTEGER NOT NULL,
    "date_finished" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "student_test_status_pkey" PRIMARY KEY ("sessionid")
);

-- CreateTable
CREATE TABLE "student_answer" (
    "sessionid" INTEGER NOT NULL,
    "questionid" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "student_answer_pkey" PRIMARY KEY ("sessionid","questionid")
);

-- CreateTable
CREATE TABLE "class_lesson" (
    "classid" INTEGER NOT NULL,
    "lessonid" INTEGER NOT NULL,

    CONSTRAINT "class_lesson_pkey" PRIMARY KEY ("classid","lessonid")
);

-- CreateTable
CREATE TABLE "class_test" (
    "classid" INTEGER NOT NULL,
    "testid" INTEGER NOT NULL,

    CONSTRAINT "class_test_pkey" PRIMARY KEY ("testid","classid")
);

-- CreateTable
CREATE TABLE "dictionary_entry" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_name" TEXT NOT NULL,

    CONSTRAINT "dictionary_entry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classid_fkey" FOREIGN KEY ("classid") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_teacherid_fkey" FOREIGN KEY ("teacherid") REFERENCES "Teacher"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_testid_fkey" FOREIGN KEY ("testid") REFERENCES "test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_status" ADD CONSTRAINT "student_test_status_studentid_fkey" FOREIGN KEY ("studentid") REFERENCES "Student"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_test_status" ADD CONSTRAINT "student_test_status_testid_fkey" FOREIGN KEY ("testid") REFERENCES "test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer" ADD CONSTRAINT "student_answer_sessionid_fkey" FOREIGN KEY ("sessionid") REFERENCES "student_test_status"("sessionid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_lesson" ADD CONSTRAINT "class_lesson_classid_fkey" FOREIGN KEY ("classid") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_lesson" ADD CONSTRAINT "class_lesson_lessonid_fkey" FOREIGN KEY ("lessonid") REFERENCES "lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_test" ADD CONSTRAINT "class_test_classid_fkey" FOREIGN KEY ("classid") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_test" ADD CONSTRAINT "class_test_testid_fkey" FOREIGN KEY ("testid") REFERENCES "test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
