import { listStudents, listSubjects } from './actions';
import { Subject, Professor, Student, Enrollment } from '@prisma/client';
import { SubmitButton, EditDeleteButtons, EnhanceForm } from './ClientComponents';

export const dynamic = 'force-dynamic';

type EnrollmentWithDetails = Enrollment & { subject: Subject & { professor: Professor, enrollments: (Enrollment & { student: Student })[] } };
type StudentWithDetails = Student & { enrollments: EnrollmentWithDetails[] };

async function StudentTable() {
  const students = await listStudents() as StudentWithDetails[];
  return (
    <table className="min-w-full text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
      <thead className="bg-slate-100 dark:bg-slate-800/70">
        <tr>
          <th className="p-2 border border-slate-200 dark:border-slate-700 text-left font-semibold">Nombre</th>
          <th className="p-2 border border-slate-200 dark:border-slate-700 text-left font-semibold">Email</th>
          <th className="p-2 border border-slate-200 dark:border-slate-700 text-left font-semibold">Materias (Profesor)</th>
          <th className="p-2 border border-slate-200 dark:border-slate-700 text-left font-semibold">Compañeros por materia</th>
          <th className="p-2 border border-slate-200 dark:border-slate-700 text-left font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {students.map((st: StudentWithDetails) => (
          <tr key={st.id} data-student-id={st.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700/70 transition-colors">
            <td className="p-2 border border-slate-200 dark:border-slate-700">{st.name}</td>
            <td className="p-2 border border-slate-200 dark:border-slate-700">{st.email}</td>
            <td className="p-2 border border-slate-200 dark:border-slate-700 align-top">
              <ul className="list-disc list-inside space-y-0.5">
                {st.enrollments.map((e: EnrollmentWithDetails) => (
                  <li key={e.id} className="marker:text-slate-400 dark:marker:text-slate-500">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{e.subject.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> ({e.subject.professor.name})</span>
                  </li>
                ))}
              </ul>
            </td>
            <td className="p-2 border border-slate-200 dark:border-slate-700">
              {st.enrollments.map((e: EnrollmentWithDetails) => {
                const classmates = e.subject.enrollments
                  .filter((en: Enrollment & { student: Student }) => en.studentId !== st.id)
                  .map((en: Enrollment & { student: Student }) => en.student.name)
                  .join(', ') || '—';
                return (
                  <div key={e.id} className="mb-1 text-xs">
                    <strong className="text-slate-800 dark:text-slate-100">{e.subject.name}:</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{classmates}</span>
                  </div>
                );
              })}
            </td>
            <td className="p-2 border border-slate-200 dark:border-slate-700 align-top">
              <EditDeleteButtons studentId={st.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


export default async function StudentsPage() {
  const subjects = await listSubjects() as (Subject & { professor: Professor })[];


  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center tracking-tight text-slate-800 dark:text-slate-100">Registro de Estudiantes</h1>
  <form id="student-form" className="space-y-4 border border-slate-200 dark:border-slate-700 p-6 rounded-lg bg-white dark:bg-slate-800 shadow max-w-2xl mx-auto">
        <input type="hidden" name="id" />
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-200">Nombre</label>
          <input required name="name" className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input required type="email" name="email" className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-slate-700 dark:text-slate-200">Selecciona exactamente 3 materias (sin repetir profesor)</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {subjects.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm border border-slate-300 dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <input className="accent-blue-600" type="checkbox" name="subjects" value={s.id} /> {s.name} <span className="text-xs text-slate-500 dark:text-slate-400">({s.professor.name})</span>
              </label>
            ))}
          </div>
        </div>
        <SubmitButton />
        <EnhanceForm />
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Regla: 3 materias, 3 profesores distintos, 3 créditos cada una.</p>
      </form>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-100">Listado de Estudiantes</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow">
            <StudentTable />
          </div>
        </div>
      </div>
    </div>
  );
}
