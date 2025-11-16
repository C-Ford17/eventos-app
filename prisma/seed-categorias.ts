// prisma/seed-categorias.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categorias = [
  { nombre: 'Tecnología', descripcion: 'Eventos relacionados con tecnología e innovación' },
  { nombre: 'Música', descripcion: 'Conciertos, festivales y eventos musicales' },
  { nombre: 'Arte', descripcion: 'Exposiciones, galerías y eventos artísticos' },
  { nombre: 'Deportes', descripcion: 'Eventos deportivos y competencias' },
  { nombre: 'Educación', descripcion: 'Talleres, seminarios y conferencias educativas' },
  { nombre: 'Negocios', descripcion: 'Eventos corporativos y de networking' },
  { nombre: 'General', descripcion: 'Categoría general para eventos diversos' },
];

async function seedCategorias() {
  console.log('Sembrando categorías...');

  for (const categoria of categorias) {
    await prisma.categoriaEvento.upsert({
      where: { nombre: categoria.nombre },
      update: {},
      create: categoria,
    });
  }

  console.log('Categorías sembradas exitosamente');
}

seedCategorias()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
