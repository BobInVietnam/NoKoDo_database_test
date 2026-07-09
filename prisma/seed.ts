import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean out existing records to avoid unique key/relational constraint errors
  await prisma.studentAnswer.deleteMany();
  await prisma.studentTestStatus.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classLesson.deleteMany();
  await prisma.classTest.deleteMany();
  await prisma.class.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.teacher.deleteMany();

  // 2. Create a Mock Teacher
  const teacher = await prisma.teacher.create({
    data: {
      uid: 'teacher_mock_123',
      firstname: 'Alex',
      lastname: 'Smith',
    },
  });
  console.log(`Created teacher: ${teacher.firstname}`);

  // 3. Create a Class linked to that Teacher
  const classes = [
    {id: 1, className: 'Lop 1', teacherid: teacher.uid},
    {id: 2, className: 'Lop 2', teacherid: teacher.uid},
  ]
  for (const cl of classes) {
    await prisma.class.create({
      data: cl
    });
  }
  console.log(`Created class`);

  // 4. Create a Student inside that Class

  const students = [
    {
      "uid": "ZgDTxfh7uWgYldxcX0zEK2acvuD2",
      "firstname": "Hung",
      "lastname": "CaoXuan",
      "classid": 1
    },
    {
      "uid": "RFIST5LFObX3pl7v55fzABuWqNC3",
      "firstname": "Bob",
      "lastname": "Vietnam",
      "classid": 1
    },
    {
      "uid": "MrBq1EAfvoYAswZZfJrbGSM2jIj1",
      "firstname": "John",
      "lastname": "Doe",
      "classid": 2
    }
  ]
  for (const s of students) {
    await prisma.student.create({
      data: s
    })
  }
  console.log(`Created students`);

  // 5. Create a Mock Lesson with JSONB Data
  const lesson = await prisma.lesson.create({
    data: {
      name: 'Giới thiệu về vần a, ă, â',
      difficulty: 1,
      type: 0,
      description: 'Bài tập đọc nho nhỏ dành cho các em',
      dateCreated: Math.floor(Date.now() / 1000),
      content: {
        text: "Ba bà cháu gây dựng trang trại mật ong. Mọi người ăn mật ong thật ngon lành."
      }
    },
  });
  console.log(`Created lesson: ${lesson.name}`);

    const testList = [
    {
      "id": 123,
      "name": "Test 1",
      "dateCreated": 100000,
      "timeLimit": 180,
      "allowedAttempts": 3,
      "difficulty": 0
    },
    {
      "id": 456,
      "name": "Test 2",
      "dateCreated": 101000,
      "timeLimit": 300,
      "allowedAttempts": 3,
      "difficulty": 1
    },
    {
      "id": 789,
      "name": "Bài kiểm tra thử",
      "dateCreated": 1000000,
      "timeLimit": 300,
      "allowedAttempts": 3,
      "difficulty": 2
    }
  ]

  for (const t of testList) {
    await prisma.test.create({
      data: t
    })
  }

  const classTestList = [
    {"classid": 1, "testid": 123},
    {"classid": 1, "testid": 456},
    {"classid": 1, "testid": 789},
    {"classid": 2, "testid": 456},
    {"classid": 2, "testid": 789}
  ]

  for (const ct of classTestList) {
    await prisma.classTest.create({
      data: ct
    })
  }

  const questions = [
    {
      "id": 1231,
      "question": "Con vet la con gi?",
      "answer": "Con chim",
      "isMultipleChoice": 1,
      "choices": ["Con trung", "Con chim", "Nam", "C"],
      "testid": 123
    },
    {
      "id": 1232,
      "question": "Tren troi co con gi?",
      "answer": "Con chim",
      "isMultipleChoice": 1,
      "choices": ["Con chim", "Con bo", "Con ho", "Ca"],
      "testid": 123
    },
    {
      "id": 1233,
      "question": "Tren troi co con gi?",
      "answer": "Con chim",
      "isMultipleChoice": 1,
      "choices": ["Con chim", "Con cho", "Con meo", "Con"],
      "testid": 123
    },
    {
      "id": 1234,
      "question": "Mot con vit xoe ra hai cai canh, no",
      "answer": "quac quac quac quac quac quac",
      "isMultipleChoice": 0,
      "choices": "",
      "testid": 123
    },
    {
      "id": 4561,
      "question": "Mot con vit xoe ra hai cai canh, no",
      "answer": "quac quac quac quac quac quac",
      "isMultipleChoice": 0,
      "choices": "",
      "testid": 456
    },
    {
      "id": 4562,
      "question": "Placeholder",
      "answer": "3",
      "isMultipleChoice": 1,
      "choices": ["1", "2", "3", "4"],
      "testid": 456
    },
    {
      "id": 7891,
      "question": "Đây là câu hỏi 1 (đáp án là \"Đáp án",
      "answer": "đáp án đúng",
      "isMultipleChoice": 0,
      "choices": "",
      "testid": 789
    },
    {
      "id": 7892,
      "question": "Đây là câu hỏi 2",
      "answer": "đáp án đúng",
      "isMultipleChoice": 1,
      "choices": ["Đáp án 1", "Đáp án 2", "Đáp án đúng", "A"],
      "testid": 789
    },
    {
      "id": 7893,
      "question": "Đây là câu hỏi 3",
      "answer": "đáp án đúng",
      "isMultipleChoice": 1,
      "choices": ["Đáp án 1", "Đáp án 2", "Đáp án đúng", "A"],
      "testid": 789
    },
    {
      "id": 7894,
      "question": "Đây là câu hỏi 4",
      "answer": "đáp án đúng",
      "isMultipleChoice": 0,
      "choices": "",
      "testid": 789
    },
    {
      "id": 7895,
      "question": "Đây là câu hỏi 5",
      "answer": "đáp án đúng",
      "isMultipleChoice": 1,
      "choices": ["Đáp án 1", "Đáp án 2", "Đáp án đúng", "A"],
      "testid": 789
    },
    {
      "id": 7896,
      "question": "Đây là câu hỏi 6",
      "answer": "đáp án đúng",
      "isMultipleChoice": 1,
      "choices": ["Đáp án 1", "Đáp án 2", "Đáp án đúng", "A"],
      "testid": 789
    },
    {
      "id": 7897,
      "question": "Đây là câu hỏi 7",
      "answer": "đáp án đúng",
      "isMultipleChoice": 0,
      "choices": "",
      "testid": 789
    },
    {
      "id": 7898,
      "question": "Đây là câu hỏi 8",
      "answer": "đáp án đúng",
      "isMultipleChoice": 1,
      "choices": ["Đáp án 1", "Đáp án 2", "Đáp án đúng", "as"],
      "testid": 789
    }
  ]

  for (const q of questions) {
    await prisma.question.create({
      data: q
    })
  }

  console.log(`Created tests for classes`);

  const vocabulary = [
    { word: 'Cây bàng', description: 'Tropical Almond tree.', imageName: 'cây_bàng.jpg' },
    { word: 'Cây bưởi', description: 'Pomelo tree.', imageName: 'cây_bưởi.jpg' },
    { word: 'Cây dứa', description: 'Pineapple plant.', imageName: 'cây_dứa.jpg' },
    { word: 'Con chim', description: 'Generic word for a bird.', imageName: 'con_chim.jpg' },
    { word: 'Con cún', description: 'Affectionate term for a puppy.', imageName: 'con_cún.jpg' },
    { word: 'Con trâu', description: 'Water buffalo.', imageName: 'con_trâu.jpg' }
  ];

  for (const item of vocabulary) {
    await prisma.dictionaryEntry.create({ data: item });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });