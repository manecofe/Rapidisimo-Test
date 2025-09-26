import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStudent, updateStudent } from '../actions';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const student = await prisma.student.findUnique({
    where: { id },
    include: { enrollments: true }
  });
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(student);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = body.action;
  try {
    if (action === 'delete') {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
      await prisma.$transaction([
        prisma.enrollment.deleteMany({ where: { studentId: id } }),
        prisma.student.delete({ where: { id } })
      ]);
      revalidatePath('/students');
      return NextResponse.json({ ok: true, message: 'Eliminado' });
    }
    if (action === 'create') {
      const { name, email, subjectIds } = body;
      await createStudent({ name, email, subjectIds });
      return NextResponse.json({ ok: true, message: 'Creado' });
    }
    if (action === 'update') {
      const { id, name, email, subjectIds } = body;
      await updateStudent(Number(id), { name, email, subjectIds });
      return NextResponse.json({ ok: true, message: 'Actualizado' });
    }
    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (e: unknown) {
    let msg = 'Error inesperado';
    if (typeof e === 'object' && e && 'code' in e && (e as { code?: string }).code === 'P2002') {
      msg = 'Email ya registrado';
    } else if (e instanceof Error) {
      msg = e.message;
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}