# Aplicativo de Gestión de Eventos

Este proyecto es una plataforma para la gestión, exploración y compra de entradas a eventos. Permite a organizadores crear eventos, asistentes reservar y comprar entradas, y personal staff acceder a reportes detallados.

## Características Principales

- CRUD eventos con imágenes alojadas en Cloudinary.
- Búsqueda, filtrado y exploración de eventos.
- Compra de entradas con distintos tipos y precios.
- Confirmación, pago y gestión de reservas.
- Notificaciones para asistentes sobre estado de reservas y eventos.
- Reportes para staff con exportación a Excel y PDF.
- Cancelación de eventos con reembolsos automáticos y notificaciones.

## Tecnologías

- Next.js 13 (App Router, Server Actions)
- Prisma ORM con PostgreSQL
- Cloudinary para almacenamiento de imágenes
- Tailwind CSS para estilos
- TypeScript para tipado estático

## Despliegue en Vercel

1. Clona el repositorio y cambia a la rama `develop` o `main`:
git clone <https://github.com/C-Ford17/eventos-app>
cd <eventos-app>
git checkout develop


2. Instala dependencias:
npm install

3. Configura las variables de entorno en `.env` (copiar `.env.example`):
- `DATABASE_URL` para tu base Postgres.
- Claves de Cloudinary (opcional).
- Otros ajustes que necesites.

4. Ejecuta migraciones:
npx prisma migrate deploy


5. Corre localmente:
npm run dev

6. En Vercel:
- Importa tu repositorio desde GitHub.
- Configura las mismas variables de entorno.
- La rama principal será desplegada automáticamente.

7. Abre la URL de Vercel para acceder tu app en producción.




