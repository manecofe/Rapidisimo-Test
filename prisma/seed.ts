import { PrismaClient, Professor, Subject } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureProfessors(names: string[]): Promise<Professor[]> {
  const acc: Professor[] = [];
  for (const name of names) {
    let prof = await prisma.professor.findFirst({ where: { name } });
    if (!prof) {
      prof = await prisma.professor.create({ data: { name } });
    }
    acc.push(prof);
  }
  return acc;
}

async function ensureSubjects(names: string[], professors: Professor[]): Promise<Subject[]> {
  const acc: Subject[] = [];
  for (const [idx, name] of names.entries()) {
    let subject = await prisma.subject.findFirst({ where: { name } });
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name,
          credits: 3,
          professorId: professors[Math.floor(idx / 2)].id
        }
      });
    }
    acc.push(subject);
  }
  return acc;
}

async function main() {
  const professorNames = ['Prof. Gomez', 'Prof. Lopez', 'Prof. Smith', 'Prof. Chen', 'Prof. Alvarez'];
  const professors = await ensureProfessors(professorNames);

  const subjectNames = [
    'Matemáticas I',
    'Programación I',
    'Física I',
    'Química I',
    'Historia Universal',
    'Inglés Técnico',
    'Bases de Datos',
    'Algoritmos',
    'Estadística',
    'Redes I'
  ];
  await ensureSubjects(subjectNames, professors);

  console.log('Seed data inserted / verified.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
