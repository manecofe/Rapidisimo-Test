Aplicación de registro académico (prueba técnica) con Next.js 15, Prisma y MySQL.

## Funcionalidades

- CRUD completo de estudiantes (crear, listar, editar, eliminar)
- Selección obligatoria de exactamente 3 materias de un conjunto de 10
- Validación de que cada materia pertenece a un profesor distinto (no repetir profesor)
- Listado de estudiantes con materias y compañeros que comparten cada materia
- Notificaciones de éxito y error con react-toastify
- Interfaz con Tailwind y modo oscuro
- Actualización y eliminación con retroalimentación inmediata (optimistic DOM update básica)

## Reglas de negocio

1. 10 materias totales, cada una vale 3 créditos
2. 5 profesores, cada uno dicta exactamente 2 materias
3. Cada estudiante debe inscribir exactamente 3 materias
4. No se permite repetir profesor en la selección
5. Se muestran compañeros sólo por materia compartida

## Tecnologías

- Next.js 15 (App Router)
- TypeScript estricto
- Prisma ORM + MySQL
- Tailwind CSS
- React Toastify

## Estructura

- `prisma/schema.prisma`: Modelos de datos
- `prisma/seed.ts`: Seed idempotente (profesores y materias)
- `src/lib/prisma.ts`: Cliente Prisma singleton
- `src/app/students`: Página principal de gestión
- `src/app/students/api/route.ts`: Endpoint unificado para CRUD

## Puesta en marcha

1. Copiar `.env.example` a `.env` y configurar `DATABASE_URL`.
2. Crear la base de datos en MySQL (si no existe).
3. Instalar dependencias: `npm install`.
4. Ejecutar migración: `npx prisma migrate dev --name init`.
5. Sembrar datos: `npm run prisma:seed`.
6. Iniciar desarrollo: `npm run dev` y visitar `http://localhost:3000/students`.

### Variables de entorno

`DATABASE_URL` formato: `mysql://usuario:password@host:puerto/base`.

## Scripts útiles

- `npm run prisma:migrate`: Migraciones en desarrollo
- `npm run prisma:seed`: Seed de datos
- `npm run prisma:studio`: UI de Prisma
- `npm run prisma:generate`: Regenerar cliente
- `npm run dev`: Entorno de desarrollo

## Consideraciones

- Validaciones críticas (exactamente 3 materias y profesores distintos) se realizan en el servidor.
- Eliminación limpia con transacción (borra inscripciones antes del estudiante).
- No se añadió autenticación (fuera del alcance actual).

## Mejoras posibles

- Refresco optimista completo para compañeros tras edición
- Tests automatizados
- Autenticación y roles
- Internacionalización

---
Proyecto entregado como solución integral de la prueba técnica.
