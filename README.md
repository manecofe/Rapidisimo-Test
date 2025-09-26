Aplicación de registro académico (prueba técnica) - Frontend en Next.js 15 consumiendo un backend externo (.NET API).

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
- Tailwind CSS
- React Toastify
- Backend externo .NET (API REST en puerto 5053)

## Estructura

- `src/app/students`: Página principal de gestión y lógica de consumo de la API .NET
- `src/app/page.tsx`: Página inicial / resumen
- `src/app/ToastProvider.tsx`: Integración de notificaciones

## Puesta en marcha (Frontend)

1. Asegurar que el backend .NET (puerto 5053) esté en ejecución y con CORS habilitado para este origen.
2. Instalar dependencias: `npm install`.
3. Ejecutar: `npm run dev` y visitar `http://localhost:3000/students`.

### Variables de entorno

Este frontend ya no requiere `DATABASE_URL`; toda la persistencia vive en el backend.

## Scripts útiles

- `npm run dev`: Entorno de desarrollo
- `npm run build`: Build de producción

## Consideraciones

- Validaciones críticas (3 materias, profesores distintos, email único) se realizan ahora en el backend .NET.
- El frontend aplica validación básica (limita selección a 3) antes de enviar.
- Sin autenticación (fuera de alcance actual).

## Mejoras posibles

- Refresco optimista completo para compañeros tras edición
- Tests automatizados
- Autenticación y roles
- Internacionalización

---
Proyecto entregado como solución integral de la prueba técnica.
