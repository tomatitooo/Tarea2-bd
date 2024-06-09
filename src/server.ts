import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

app.post('/api/registrar', async ({body}) => {
  const { nombre, correo, clave, descripcion } = await body as {
    nombre: string;
    correo: string;
    clave: string;
    descripcion?: string;
  };

  if (!nombre || !correo || !clave) {
    return {
      status: 400,
      message: 'Los campos nombre, correo y clave son obligatorios.',
    };
  }

  try {
    const user = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        clave,
        descripcion,
      },
    });
    return {
      status: 201,
      message: 'Usuario registrado exitosamente',
      user,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error al registrar el usuario',
      error: (error as Error).message,
    };
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
