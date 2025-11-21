import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    console.log('\n🔐  Creación de Super Usuario (Admin)  🔐\n');

    try {
        const nombre = await question('Nombre: ');
        const email = await question('Email: ');
        const password = await question('Contraseña: ');

        if (!nombre || !email || !password) {
            console.error('\n❌ Error: Todos los campos son obligatorios.');
            process.exit(1);
        }

        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.error('\n❌ Error: Ya existe un usuario con ese email.');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                tipo_usuario: 'admin', // Rol de Super Usuario
            },
        });

        console.log('\n✅  ¡Admin creado exitosamente!');
        console.log(`    ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Rol: ${user.tipo_usuario}\n`);

    } catch (error) {
        console.error('\n❌ Error al crear admin:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
