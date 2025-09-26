"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type SubjectDto = { id: number; name: string; credits: number; professorId: number; professorName: string };
type StudentSubjectDto = { subjectId: number; subjectName: string; professorName: string };
type StudentRow = { id: number; name: string; email: string; subjects: StudentSubjectDto[]; classmatesPorMateria: Record<string, string[]> };

const API_BASE = 'http://localhost:5053/api/v1';

export default function StudentsPage() {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [subsRes, studsRes] = await Promise.all([
          fetch(`${API_BASE}/subjects`),
          fetch(`${API_BASE}/students`)
        ]);
        if (!subsRes.ok) throw new Error('Error cargando materias');
        if (!studsRes.ok) throw new Error('Error cargando estudiantes');
        const subs = await subsRes.json();
        const studs = await studsRes.json();
        setSubjects(subs);
        setStudents(studs);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Error inesperado');
      } finally { setLoading(false); }
    }
    load();
  }, []);

  function toggleCheckboxLimit(ev: React.ChangeEvent<HTMLInputElement>) {
    const container = ev.currentTarget.closest('form');
    if (!container) return;
    const checks = Array.from(container.querySelectorAll('input[name="subjects"]')) as HTMLInputElement[];
    const checked = checks.filter(c => c.checked);
    checks.forEach(c => { if (!c.checked) c.disabled = checked.length >= 3; });
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const subjectIds = fd.getAll('subjects').map(v => Number(v));
    if (subjectIds.length !== 3) { toast.error('Debe seleccionar exactamente 3 materias'); return; }
    setFormLoading(true);
    try {
      const payload = { name, email, subjectIds };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/students/${editingId}` : `${API_BASE}/students`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json().catch(()=>({}));
      if (!res.ok) { toast.error(json.error?.message || 'Error guardando'); return; }
      toast.success(editingId ? 'Estudiante actualizado' : 'Estudiante creado');
      // refrescar lista
      const studsRes = await fetch(`${API_BASE}/students`);
      if (studsRes.ok) setStudents(await studsRes.json());
      // reset
      ev.currentTarget.reset();
      setEditingId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error de red');
    } finally { setFormLoading(false); }
  }

  function startEdit(st: StudentRow) {
    const form = document.getElementById('student-form') as HTMLFormElement | null;
    if (!form) return;
    (form.querySelector('input[name="name"]') as HTMLInputElement).value = st.name;
    (form.querySelector('input[name="email"]') as HTMLInputElement).value = st.email;
    const chosen = st.subjects.map(s => s.subjectId);
    form.querySelectorAll('input[name="subjects"]').forEach(el => {
      const cb = el as HTMLInputElement; cb.checked = chosen.includes(Number(cb.value));
    });
    // Apply limit logic
    const checks = Array.from(form.querySelectorAll('input[name="subjects"]')) as HTMLInputElement[];
    const checked = checks.filter(c => c.checked);
    checks.forEach(c => { if (!c.checked) c.disabled = checked.length >= 3; });
    setEditingId(st.id);
    toast.info('Modo edición activo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar estudiante?')) return;
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('No se pudo eliminar'); return; }
      toast.success('Eliminado');
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error de red');
    }
  }

  function cancelEdit() {
    const form = document.getElementById('student-form') as HTMLFormElement | null;
    form?.reset();
    form?.querySelectorAll('input[name="subjects"]').forEach(el => { const cb = el as HTMLInputElement; cb.disabled = false; cb.checked = false; });
    setEditingId(null);
    toast.info('Edición cancelada');
  }

  if (loading) return <div className="p-8 text-center text-slate-600 dark:text-slate-300">Cargando...</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center tracking-tight text-slate-800 dark:text-slate-100">Registro de Estudiantes</h1>
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4 border border-slate-200 dark:border-slate-700 p-6 rounded-lg bg-white dark:bg-slate-800 shadow max-w-2xl mx-auto">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 dark:text-slate-200">Nombre</label>
            <input name="name" required disabled={formLoading} className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
            <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input name="email" type="email" required disabled={formLoading} className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-slate-700 dark:text-slate-200">Selecciona exactamente 3 materias (sin repetir profesor)</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {subjects.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm border border-slate-300 dark:border-slate-600 p-2 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <input type="checkbox" name="subjects" value={s.id} disabled={formLoading} onChange={toggleCheckboxLimit} className="accent-blue-600" /> {s.name} <span className="text-xs text-slate-500 dark:text-slate-400">({s.professorName})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
              {formLoading ? 'Guardando...' : editingId ? 'Actualizar estudiante' : 'Guardar estudiante'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-slate-500/80 hover:bg-slate-500 text-white px-4 py-2 rounded text-sm">Cancelar edición</button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Regla: 3 materias, 3 profesores distintos, 3 créditos cada una.</p>
        </form>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-100">Listado de Estudiantes</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow">
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
                {students.map(st => (
                  <tr key={st.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700/70 transition-colors">
                    <td className="p-2 border border-slate-200 dark:border-slate-700">{st.name}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700">{st.email}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 align-top">
                      <ul className="list-disc list-inside space-y-0.5">
                        {st.subjects.map(sub => (
                          <li key={sub.subjectId} className="marker:text-slate-400 dark:marker:text-slate-500">
                            <span className="font-medium text-slate-800 dark:text-slate-100">{sub.subjectName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400"> ({sub.professorName})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700">
                      {st.subjects.map(sub => {
                        const mates = st.classmatesPorMateria[String(sub.subjectId)] || [];
                        const label = mates.length ? mates.join(', ') : '—';
                        return (
                          <div key={sub.subjectId} className="mb-1 text-xs">
                            <strong className="text-slate-800 dark:text-slate-100">{sub.subjectName}:</strong> <span className="text-slate-600 dark:text-slate-300">{label}</span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 align-top">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => startEdit(st)} className="text-blue-600 hover:underline text-xs" type="button">Editar</button>
                        <button onClick={() => handleDelete(st.id)} className="text-red-600 hover:underline text-xs" type="button">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
