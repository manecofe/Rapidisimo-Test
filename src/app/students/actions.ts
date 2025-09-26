"use server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type StudentInput = {
  name: string;
  email: string;
  subjectIds: number[];
};

function unique<T>(arr: T[]): T[] { return [...new Set(arr)]; }

export async function createStudent(data: StudentInput) {
  data.subjectIds = await validateSubjectSelection(data.subjectIds);

  const student = await prisma.student.create({
    data: {
      name: data.name,
      email: data.email,
      enrollments: {
        create: data.subjectIds.map(id => ({ subjectId: id }))
      }
    },
    include: { enrollments: { include: { subject: { include: { professor: true } } } } }
  });

  revalidatePath('/students');
  return student;
}

export async function listStudents() {
  return prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      enrollments: { include: { subject: { include: { professor: true, enrollments: { include: { student: true } } } } } }
    }
  });
}

export async function listSubjects() {
  return prisma.subject.findMany({ include: { professor: true } , orderBy: { name: 'asc' } });
}

export async function getStudent(id: number) {
  return prisma.student.findUnique({
    where: { id },
    include: { enrollments: { include: { subject: { include: { professor: true } } } } }
  });
}

export async function updateStudent(id: number, data: StudentInput) {
  data.subjectIds = await validateSubjectSelection(data.subjectIds);

  const studentExists = await prisma.student.findUnique({ where: { id } });
  if (!studentExists) throw new Error('Estudiante no encontrado');

  await prisma.$transaction([
    prisma.enrollment.deleteMany({ where: { studentId: id } }),
    ...data.subjectIds.map(subjectId => prisma.enrollment.create({ data: { studentId: id, subjectId } })),
    prisma.student.update({ where: { id }, data: { name: data.name, email: data.email } })
  ]);

  revalidatePath('/students');
}

export async function deleteStudent(id: number) {
  await prisma.$transaction([
    prisma.enrollment.deleteMany({ where: { studentId: id } }),
    prisma.student.delete({ where: { id } })
  ]);
  revalidatePath('/students');
}

async function validateSubjectSelection(subjectIds: number[]): Promise<number[]> {
  const cleaned = unique(subjectIds).slice(0,3);
  if (cleaned.length !== 3) throw new Error('Debe seleccionar exactamente 3 materias.');
  const subjects = await prisma.subject.findMany({
    where: { id: { in: cleaned } },
    include: { professor: true }
  });
  if (subjects.length !== 3) throw new Error('Materias inválidas.');
  const profIds = new Set(subjects.map(s => s.professorId));
  if (profIds.size !== 3) throw new Error('No puede repetir profesor.');
  return cleaned;
}
