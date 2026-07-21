import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import * as argon2 from "argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  await prisma.$transaction(async (tx) => {
    // 1. Clean out existing records to avoid unique key/relational constraint errors
    await tx.studentAnswer.deleteMany();
    await tx.studentTestStatus.deleteMany();
    await tx.studentLesson.deleteMany();
    await tx.classLesson.deleteMany();
    await tx.classTest.deleteMany();
    await tx.student.deleteMany();
    await tx.class.deleteMany();
    await tx.lesson.deleteMany();
    await tx.question.deleteMany();
    await tx.test.deleteMany();
    await tx.teacher.deleteMany();
    await tx.dictionaryEntry.deleteMany();
    await tx.systemConfig.deleteMany();

    // 2. Create a Mock Teacher
    const passwordHash = await argon2.hash("password123", { type: argon2.argon2id }); //TESTING PURPOSE ONLY!! MAKE THE HASH DURING REGISTRATION

    const teacher = await tx.teacher.create({
      data: {
        uid: 'teacher_mock_123',
        firstname: 'Alex',
        lastname: 'Smith',
        email: 'teacher@nokodo.edu.vn',
        passwordHash: passwordHash,
      },
    });
    console.log(`Created teacher: ${teacher.firstname}`);

    // 3. Create a Class linked to that Teacher
    const classes = [
      {"id": 1, "className": 'Lop 1', "teacherid": teacher.uid},
      {"id": 2, "className": 'Lop 2', "teacherid": teacher.uid},
    ]
    for (const cl of classes) {
      await tx.class.create({
        data: cl
      });
    }
    console.log(`Created class`);

    // 4. Create a Student inside that Class
    const students = [
      {
        "uid": "ZgDTxfh7uWgYIdxcX0zEK2acvuD2",
        "firstname": "Hung",
        "lastname": "CaoXuan",
        "classid": 1,
        "gender": "Nam",
        "dateOfBirth": 100000,
      },
      {
        "uid": "RFIST5LFObX3pl7v55fzABuWqNC3",
        "firstname": "Bob",
        "lastname": "Vietnam",
        "classid": 1,
        "gender": "Nữ",
        "dateOfBirth": 100000,
      },
      {
        "uid": "MrBq1EAfvoYAswZZfJrbGSM2jIj1",
        "firstname": "John",
        "lastname": "Doe",
        "classid": 2,
        "gender": "Nam",
        "dateOfBirth": 100000,
      }
    ]
    for (const s of students) {
      await tx.student.create({
        data: s
      })
    }
    console.log(`Created students`);

    // 5. Create a Mock Lesson with JSONB Data
    const lessons = [
      {
        "id": 1,
        "name": "Giới thiệu về vần a, ă, â",
        "difficulty": 1,
        "type": 0,
        "description": "Bài tập đọc nho nhỏ dành cho các em",
        "dateCreated": 1778412562,
        "content": {
          "text": "Ba bà cháu gây dựng trang trại mật ong. Mọi người ăn mật ong thật ngon lành."
        }
      },
      {
        "id": 2,
        "name": "Giới thiệu về vần b, d, p, q",
        "difficulty": 1,
        "type": 0,
        "description": "Bài tập đọc nho nhỏ dành cho các em thứ 2",
        "dateCreated": 1778412562,
        "content": {
          "text": "Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho. Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho. Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\n\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\n\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.\nPa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho.Pa pa pi po, bo ba bo bo, do di de do, bo ho bo ho."
        }
      },
      {
        "id": 3,
        "name": "Trò chơi tìm chữ a",
        "difficulty": 1,
        "type": 1,
        "description": "Trò chơi tìm chữ hi hi hi",
        "dateCreated": 1778412562,
        "content": {
          "cases": [
            {
              "height": 7,
              "width": 9,
              "target": "d",
              "noise": ["b", "p", "q"],
              "chance": 0.35,
              "spacing": 0.0,
              "size": 42.0
            },
            {
              "height": 7,
              "width": 9,
              "target": "t",
              "noise": ["f", "l", "i"],
              "chance": 0.40,
              "spacing": 6.0,
              "size": 28.0
            },
            {
              "height": 7,
              "width": 9,
              "target": "n",
              "noise": ["u", "m", "h"],
              "chance": 0.45,
              "spacing": 2.0,
              "size": 56.0
            },
            {
              "height": 5,
              "width": 7,
              "target": "ă",
              "noise": ["a", "ã", "â"],
              "chance": 0.80,
              "spacing": 1.0,
              "size": 40.0
            },
            {
              "height": 5,
              "width": 11,
              "target": "ê",
              "noise": ["ẽ", "è", "é"],
              "chance": 0.80,
              "spacing": 3.0,
              "size": 66.0
            }
          ]
        }
      }
    ]
    for (const l of lessons) {
      await tx.lesson.create({
        data: l
      });
    }
    console.log(`Created lessons`);

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
      await tx.test.create({
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
      await tx.classTest.create({
        data: ct
      })
    }

    const classLessonList = [
      {"classid": 1, "lessonid": 1},
      {"classid": 1, "lessonid": 2},
      {"classid": 2, "lessonid": 1},
      {"classid": 2, "lessonid": 2},
      {"classid": 2, "lessonid": 3},
    ]
    for (const ct of classLessonList) {
      await tx.classLesson.create({
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
      await tx.question.create({
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
      await tx.dictionaryEntry.create({ data: item });
    }

    const configs = [
      {key: 'dictVersion', value: 'v1'}
    ]

    for (const c of configs) {
      await tx.systemConfig.create({data: c});
    }
  });

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