import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Registro Académico</h1>
          </div>
          <Link href="/students" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md shadow hover:bg-blue-500 transition text-sm font-medium">
            Ir a Estudiantes →
          </Link>
        </header>
        <section className="grid md:grid-cols-3 gap-6">
          <Card title="Reglas" items={[
            '10 materias (3 créditos c/u)',
            '5 profesores (2 materias c/u)',
            'Cada estudiante elige 3 materias',
            'No repetir profesor',
            'Ver compañeros por materia'
          ]} />
          <Card title="Tecnologías" items={[
            'Next.js 15 (App Router)',
            'TypeScript',
            'Tailwind CSS',
            'Backend .NET externo'
          ]} />
          <Card title="Acciones" items={[
            'Crear estudiante',
            'Editar selección',
            'Eliminar registro',
            'Listar todos',
            'Ver compañeros'
          ]} />
        </section>
        <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-lg p-6 shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Flujo rápido</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <li>Ve a la sección Estudiantes.</li>
            <li>Llena nombre, email y selecciona 3 materias.</li>
            <li>Guarda y revisa la tabla.</li>
            <li>Edita para cambiar materias; elimina si es necesario.</li>
            <li>Observa los compañeros por cada materia.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5 border border-slate-200 dark:border-slate-700 flex flex-col">
      <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{title}</h3>
      <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
        {items.map(i => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}
