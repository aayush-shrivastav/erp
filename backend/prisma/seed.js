const {
  PrismaClient,
  ExamType,
  SubjectType,
  FundingType,
  BatchType,
  PaymentMode,
  PaymentSource,
  TransactionStatus
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seedUsers = [
  { email: 'admin@eduerp.com', password: 'admin123', role: 'SUPER_ADMIN' },
  { email: 'admin2@test.com', password: 'pass123', role: 'ADMIN' },
  { email: 'academic@test.com', password: 'pass123', role: 'ACADEMIC_ADMIN' },
  { email: 'accountant@test.com', password: 'pass123', role: 'ACCOUNTS_ADMIN' },
  { email: 'teacher@test.com', password: 'pass123', role: 'FACULTY' },
  { email: 'student@test.com', password: 'pass123', role: 'STUDENT' }
];

const ensureUser = async ({ email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role,
      isActive: true
    },
    create: {
      email,
      password: hashedPassword,
      role,
      isActive: true
    }
  });
};

const ensureCourse = async (departmentId) => {
  const existing = await prisma.course.findFirst({
    where: {
      name: 'B.Tech CSE',
      departmentId
    }
  });

  if (existing) {
    return prisma.course.update({
      where: { id: existing.id },
      data: {
        durationYears: 4,
        totalSemesters: 8
      }
    });
  }

  return prisma.course.create({
    data: {
      name: 'B.Tech CSE',
      departmentId,
      durationYears: 4,
      totalSemesters: 8
    }
  });
};

const ensureSemester = async (courseId, sessionId, level) => {
  const existing = await prisma.semester.findFirst({
    where: { courseId, level }
  });

  if (existing) {
    return prisma.semester.update({
      where: { id: existing.id },
      data: {
        name: `Semester ${level}`,
        sessionId
      }
    });
  }

  return prisma.semester.create({
    data: {
      name: `Semester ${level}`,
      level,
      courseId,
      sessionId
    }
  });
};

const ensureSection = async ({ courseId, departmentId, semesterId }) => {
  const existing = await prisma.section.findFirst({
    where: {
      courseId,
      semesterId,
      name: 'Section A'
    }
  });

  if (existing) {
    return prisma.section.update({
      where: { id: existing.id },
      data: {
        departmentId,
        capacity: 60,
        baseRollNumber: 7000001,
        currentRollIndex: Math.max(existing.currentRollIndex, 1)
      }
    });
  }

  return prisma.section.create({
    data: {
      name: 'Section A',
      departmentId,
      semesterId,
      courseId,
      capacity: 60,
      baseRollNumber: 7000001,
      currentRollIndex: 1
    }
  });
};

async function main() {
  console.log('Starting seed process...');

  const usersByEmail = {};
  for (const userInput of seedUsers) {
    const user = await ensureUser(userInput);
    usersByEmail[user.email] = user;
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  await prisma.academicSession.updateMany({ data: { isActive: false } });
  const activeSession = await prisma.academicSession.upsert({
    where: { id: 'seed-session-2025-2026' },
    update: { year: '2025-2026', isActive: true },
    create: { id: 'seed-session-2025-2026', year: '2025-2026', isActive: true }
  });

  const department = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {
      name: 'Computer Science and Engineering',
      description: 'Core department seeded for e2e integration flows',
      isActive: true
    },
    create: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Core department seeded for e2e integration flows',
      isActive: true
    }
  });

  const course = await ensureCourse(department.id);

  const semesters = [];
  for (let level = 1; level <= 8; level += 1) {
    const semester = await ensureSemester(course.id, activeSession.id, level);
    semesters.push(semester);
  }
  const semesterOne = semesters.find((s) => s.level === 1);

  const sectionA = await ensureSection({
    courseId: course.id,
    departmentId: department.id,
    semesterId: semesterOne.id
  });

  const facultyUser = usersByEmail['teacher@test.com'];
  const faculty = await prisma.faculty.upsert({
    where: { userId: facultyUser.id },
    update: {
      employeeId: 'SEED-FAC-001',
      name: 'Teacher One',
      phone: '+1234567890',
      designation: 'Assistant Professor',
      joiningDate: new Date('2024-01-15'),
      departmentId: department.id
    },
    create: {
      userId: facultyUser.id,
      employeeId: 'SEED-FAC-001',
      name: 'Teacher One',
      phone: '+1234567890',
      designation: 'Assistant Professor',
      joiningDate: new Date('2024-01-15'),
      departmentId: department.id
    }
  });

  const studentUser = usersByEmail['student@test.com'];
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      enrollmentNo: 'SEED-STU-001',
      universityRollNo: 'SEED-UNIV-001',
      name: 'Student One',
      phone: '+1234567891',
      admissionDate: new Date('2025-01-10'),
      departmentId: department.id,
      courseId: course.id,
      currentSemesterId: semesterOne.id,
      sectionId: sectionA.id,
      batch: BatchType.B1,
      fundingType: FundingType.SELF,
      isPassout: false
    },
    create: {
      userId: studentUser.id,
      enrollmentNo: 'SEED-STU-001',
      universityRollNo: 'SEED-UNIV-001',
      name: 'Student One',
      phone: '+1234567891',
      admissionDate: new Date('2025-01-10'),
      departmentId: department.id,
      courseId: course.id,
      currentSemesterId: semesterOne.id,
      sectionId: sectionA.id,
      batch: BatchType.B1,
      fundingType: FundingType.SELF
    }
  });

  const subject = await prisma.subject.upsert({
    where: { code: 'MATH101' },
    update: {
      name: 'Mathematics I',
      type: SubjectType.THEORY,
      departmentId: department.id,
      semesterId: semesterOne.id,
      credits: 4
    },
    create: {
      code: 'MATH101',
      name: 'Mathematics I',
      type: SubjectType.THEORY,
      departmentId: department.id,
      semesterId: semesterOne.id,
      credits: 4
    }
  });

  await prisma.facultySubject.createMany({
    data: [{ facultyId: faculty.id, subjectId: subject.id }],
    skipDuplicates: true
  });

  await prisma.subjectAssignment.createMany({
    data: [{ facultyId: faculty.id, subjectId: subject.id, sectionId: sectionA.id }],
    skipDuplicates: true
  });

  const timetableSlot = await prisma.timetable.findFirst({
    where: {
      sectionId: sectionA.id,
      subjectId: subject.id,
      facultyId: faculty.id,
      dayOfWeek: 'MONDAY',
      startTime: '10:00'
    }
  });
  if (!timetableSlot) {
    await prisma.timetable.create({
      data: {
        sectionId: sectionA.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        dayOfWeek: 'MONDAY',
        startTime: '10:00',
        endTime: '11:00',
        roomNo: 'A-101',
        batch: BatchType.ALL
      }
    });
  }

  const feeStructure = await prisma.feeStructure.upsert({
    where: {
      courseId_semesterId: {
        courseId: course.id,
        semesterId: semesterOne.id
      }
    },
    update: {
      tuitionFee: 50000,
      labFee: 5000,
      libraryFee: 3000,
      otherCharges: 2000,
      totalAmount: 60000,
      dueDate: new Date('2026-06-30'),
      finePerDay: 20,
      maxFineLimit: 2000,
      isActive: true
    },
    create: {
      courseId: course.id,
      semesterId: semesterOne.id,
      tuitionFee: 50000,
      labFee: 5000,
      libraryFee: 3000,
      otherCharges: 2000,
      totalAmount: 60000,
      dueDate: new Date('2026-06-30'),
      finePerDay: 20,
      maxFineLimit: 2000,
      isActive: true
    }
  });

  const studentFee = await prisma.studentFee.upsert({
    where: {
      studentId_feeStructureId: {
        studentId: student.id,
        feeStructureId: feeStructure.id
      }
    },
    update: {
      totalAmount: 60000,
      paidAmount: 5000,
      totalPayable: 60000,
      remainingBalance: 55000,
      status: 'PARTIAL'
    },
    create: {
      studentId: student.id,
      feeStructureId: feeStructure.id,
      totalAmount: 60000,
      paidAmount: 5000,
      totalPayable: 60000,
      remainingBalance: 55000,
      status: 'PARTIAL'
    }
  });

  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);
  let attendance = await prisma.attendance.findFirst({
    where: {
      sessionId: activeSession.id,
      date: attendanceDate,
      sectionId: sectionA.id,
      subjectId: subject.id
    }
  });

  if (!attendance) {
    attendance = await prisma.attendance.create({
      data: {
        sessionId: activeSession.id,
        date: attendanceDate,
        sectionId: sectionA.id,
        subjectId: subject.id,
        facultyId: faculty.id
      }
    });
  }

  await prisma.attendanceRecord.deleteMany({
    where: {
      attendanceId: attendance.id,
      studentId: student.id
    }
  });
  await prisma.attendanceRecord.create({
    data: {
      attendanceId: attendance.id,
      studentId: student.id,
      status: 'PRESENT'
    }
  });

  // Sample MST1
  let mst1 = await prisma.mark.findFirst({
    where: {
      examType: ExamType.SESSIONAL,
      mstNumber: 1,
      sessionId: activeSession.id,
      sectionId: sectionA.id,
      subjectId: subject.id
    }
  });

  if (!mst1) {
    mst1 = await prisma.mark.create({
      data: {
        examType: ExamType.SESSIONAL,
        mstNumber: 1,
        sessionId: activeSession.id,
        sectionId: sectionA.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        maxMarks: 24,
        isLocked: true
      }
    });
  } else {
    mst1 = await prisma.mark.update({
      where: { id: mst1.id },
      data: {
        facultyId: faculty.id,
        maxMarks: 24,
        isLocked: true
      }
    });
  }

  await prisma.markRecord.deleteMany({
    where: { markId: mst1.id, studentId: student.id }
  });
  await prisma.markRecord.create({
    data: {
      markId: mst1.id,
      studentId: student.id,
      marksObtained: 18
    }
  });

  // Sample MST2
  let mst2 = await prisma.mark.findFirst({
    where: {
      examType: ExamType.SESSIONAL,
      mstNumber: 2,
      sessionId: activeSession.id,
      sectionId: sectionA.id,
      subjectId: subject.id
    }
  });

  if (!mst2) {
    mst2 = await prisma.mark.create({
      data: {
        examType: ExamType.SESSIONAL,
        mstNumber: 2,
        sessionId: activeSession.id,
        sectionId: sectionA.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        maxMarks: 24,
        assignmentMarks: 8,
        attendanceMarks: 6,
        isLocked: true
      }
    });
  } else {
    mst2 = await prisma.mark.update({
      where: { id: mst2.id },
      data: {
        facultyId: faculty.id,
        maxMarks: 24,
        assignmentMarks: 8,
        attendanceMarks: 6,
        isLocked: true
      }
    });
  }

  await prisma.markRecord.deleteMany({
    where: { markId: mst2.id, studentId: student.id }
  });
  await prisma.markRecord.create({
    data: {
      markId: mst2.id,
      studentId: student.id,
      marksObtained: 20
    }
  });

  // Sample MST3
  let mst3 = await prisma.mark.findFirst({
    where: {
      examType: ExamType.SESSIONAL,
      mstNumber: 3,
      sessionId: activeSession.id,
      sectionId: sectionA.id,
      subjectId: subject.id
    }
  });

  if (!mst3) {
    mst3 = await prisma.mark.create({
      data: {
        examType: ExamType.SESSIONAL,
        mstNumber: 3,
        sessionId: activeSession.id,
        sectionId: sectionA.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        maxMarks: 24,
        finalMst: 19, // (20+18)/2
        finalMarks: 33, // 19 +8 +6
        isLocked: true,
        isFinalized: true
      }
    });
  } else {
    mst3 = await prisma.mark.update({
      where: { id: mst3.id },
      data: {
        facultyId: faculty.id,
        maxMarks: 24,
        finalMst: 19,
        finalMarks: 33,
        isLocked: true,
        isFinalized: true
      }
    });
  }

  await prisma.markRecord.deleteMany({
    where: { markId: mst3.id, studentId: student.id }
  });
  await prisma.markRecord.create({
    data: {
      markId: mst3.id,
      studentId: student.id,
      marksObtained: 15
    }
  });


  const accountantUser = usersByEmail['accountant@test.com'];
  let payment = await prisma.payment.findFirst({
    where: { transactionId: 'SEEDPAYMENT001' }
  });

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        receiptNo: 'RCPT-SEED-0001',
        studentId: student.id,
        studentFeeId: studentFee.id,
        amountPaid: 5000,
        paymentMode: PaymentMode.CASH,
        paymentSource: PaymentSource.SELF,
        transactionId: 'SEEDPAYMENT001',
        paymentDate: new Date('2026-01-10'),
        createdById: accountantUser.id,
        collectedById: accountantUser.id,
        status: TransactionStatus.SUCCESS,
        isReversed: false
      }
    });
  } else {
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        studentId: student.id,
        studentFeeId: studentFee.id,
        amountPaid: 5000,
        paymentMode: PaymentMode.CASH,
        paymentSource: PaymentSource.SELF,
        createdById: accountantUser.id,
        collectedById: accountantUser.id,
        status: TransactionStatus.SUCCESS,
        isReversed: false
      }
    });
  }

  await prisma.receipt.upsert({
    where: { receiptNumber: 'RCPT-SEED-0001' },
    update: {
      studentId: student.id,
      paymentId: payment.id,
      amountPaid: 5000,
      paymentMode: 'CASH',
      transactionId: 'SEEDPAYMENT001',
      paymentDate: new Date('2026-01-10'),
      baseFeePaid: 5000,
      finePaid: 0,
      remainingBalance: 55000,
      pdfUrl: null
    },
    create: {
      receiptNumber: 'RCPT-SEED-0001',
      studentId: student.id,
      paymentId: payment.id,
      amountPaid: 5000,
      paymentMode: 'CASH',
      transactionId: 'SEEDPAYMENT001',
      paymentDate: new Date('2026-01-10'),
      baseFeePaid: 5000,
      finePaid: 0,
      remainingBalance: 55000,
      pdfUrl: null
    }
  });

  console.log('Seed completed with relational test fixtures.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
