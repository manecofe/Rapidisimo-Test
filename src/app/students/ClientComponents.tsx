"use client";
import React from 'react';
import { toast } from 'react-toastify';
type StatusHook = () => { pending: boolean };
let useFormStatusSafe: StatusHook = () => ({ pending: false });
const maybe = React as unknown as { useFormStatus?: StatusHook };
if (maybe.useFormStatus) {
  useFormStatusSafe = maybe.useFormStatus;
}

export function SubmitButton() {
  const { pending } = useFormStatusSafe();
  return (
    <button
      type="submit"
      className="relative bg-blue-600 hover:bg-blue-500 transition text-white px-4 py-2 rounded disabled:opacity-50 inline-flex items-center gap-2"
      disabled={pending}
    >
      {pending && <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
      <span>{pending ? 'Guardando...' : 'Guardar estudiante'}</span>
    </button>
  );
}

export function EditDeleteButtons({ studentId }: { studentId: number }) {
  const [loading, setLoading] = React.useState(false);

  async function onDelete() {
    if (!confirm('¿Eliminar estudiante?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/students/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId, action: 'delete' })
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        throw new Error(j.error || 'Error eliminando');
      }
  const row = document.querySelector(`tr[data-student-id='${studentId}']`);
  row?.classList.add('opacity-30');
  setTimeout(()=> row?.remove(), 150);
  toast.success('Estudiante eliminado');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error inesperado';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  async function onEdit() {
    try {
      const res = await fetch(`/students/api?id=${studentId}`);
      if (!res.ok) throw new Error('No se pudo cargar el estudiante');
      const data = await res.json();
      const form = document.querySelector('#student-form') as HTMLFormElement | null;
      if (!form) return;
      (form.querySelector('input[name="id"]') as HTMLInputElement).value = String(data.id);
      (form.querySelector('input[name="name"]') as HTMLInputElement).value = data.name;
      (form.querySelector('input[name="email"]') as HTMLInputElement).value = data.email;
      const selectedIds = (data.enrollments as { subjectId: number }[]).map(e => e.subjectId);
      form.querySelectorAll('input[name="subjects"]').forEach((el: Element) => {
        const cb = el as HTMLInputElement;
        cb.checked = selectedIds.includes(Number(cb.value));
      });
      form.dataset.editing = 'true';
      const cancelBtn = form.querySelector('#cancel-edit-btn');
      if (cancelBtn) cancelBtn.classList.remove('hidden');
      const submitLabel = form.querySelector('button[type="submit"] span:last-child');
      if (submitLabel) submitLabel.textContent = 'Actualizar estudiante';
      toast.info('Modo edición activo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error cargando';
      toast.error(msg);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={onEdit} className="text-blue-600 hover:underline" disabled={loading}>Editar</button>
      <button type="button" onClick={onDelete} className="text-red-600 hover:underline" disabled={loading}>{loading ? '...' : 'Eliminar'}</button>
    </div>
  );
}

export function EnhanceForm() {
  React.useEffect(() => {
    const form = document.getElementById('student-form');
    if (!form) return;
    let cancelBtn = form.querySelector('#cancel-edit-btn') as HTMLButtonElement | null;
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'cancel-edit-btn';
      cancelBtn.textContent = 'Cancelar edición';
      cancelBtn.className = 'hidden bg-slate-500/80 hover:bg-slate-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn?.parentElement?.insertBefore(cancelBtn, submitBtn.nextSibling);
      cancelBtn.addEventListener('click', () => {
        const idInput = form.querySelector('input[name="id"]') as HTMLInputElement;
        idInput.value = '';
        (form.querySelector('input[name="name"]') as HTMLInputElement).value = '';
        (form.querySelector('input[name="email"]') as HTMLInputElement).value = '';
        form.querySelectorAll('input[name="subjects"]').forEach(el => {
          const cb = el as HTMLInputElement; cb.checked = false; cb.disabled = false;
        });
        form.dataset.editing = 'false';
        cancelBtn?.classList.add('hidden');
        const submitLabel = form.querySelector('button[type="submit"] span:last-child');
        if (submitLabel) submitLabel.textContent = 'Guardar estudiante';
        toast.info('Modo edición cancelado');
      });
    }
    const handleSubmit = async (ev: Event) => {
      ev.preventDefault();
      const fd = new FormData(form as HTMLFormElement);
      const id = fd.get('id');
      const name = fd.get('name');
      const email = fd.get('email');
      const subjectIds = fd.getAll('subjects').map(v => Number(v));
      const action = id ? 'update' : 'create';
      try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;
        const res = await fetch('/students/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, id, name, email, subjectIds })
        });
        const json = await res.json().catch(()=>({}));
        if (!res.ok) {
          toast.error(json.error || 'Error');
          if (submitBtn) submitBtn.disabled = false;
          return;
        }
        if (action === 'create') {
          toast.success('Estudiante creado');
          setTimeout(()=> window.location.reload(), 400);
        } else {
          toast.success('Estudiante actualizado');
          const row = document.querySelector(`tr[data-student-id='${id}']`);
          if (row) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
              (cells[0] as HTMLElement).textContent = String(name);
              (cells[1] as HTMLElement).textContent = String(email);
            }
            row.classList.add('animate-pulse');
            setTimeout(()=> row.classList.remove('animate-pulse'), 800);
          }
          if (submitBtn) submitBtn.disabled = false;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error de red';
        toast.error(msg);
      }
    };
    form.addEventListener('submit', handleSubmit);
    const handler = () => {
      const checks = Array.from(form.querySelectorAll('input[name="subjects"]')) as HTMLInputElement[];
      const checked = checks.filter(c => c.checked);
      checks.forEach(c => {
        if (!c.checked) c.disabled = checked.length >= 3;
      });
    };
    form.addEventListener('change', handler);
    handler();
    return () => {
      form.removeEventListener('change', handler);
      form.removeEventListener('submit', handleSubmit);
    };
  }, []);
  return null;
}