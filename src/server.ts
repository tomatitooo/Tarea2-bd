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

    const existinguser = await prisma.usuario.findFirst({
      where: {correo}
    })

    if(existinguser){
      return{
        status: 409,
        message: 'El correo ya está registrado'
      };
    }

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


app.post('/api/bloquear', async ({body})=>{
  const { correo, clave, correo_bloquear } = await body as {
    correo: string;
    clave: string;
    correo_bloquear: string;
  };

  if (!correo || !correo_bloquear || !clave) {
    return {
      status: 400,
      message: 'Los campos correo, correo a bloquear y clave son obligatorios.',
    }; 
  }

  try {
    const usuario = await prisma.usuario.findFirst({
        where: { correo, clave }
    });

    if (!usuario) {
        return {
            status: 400,
            message: 'Usuario no encontrado o clave incorrecta.',
        };
    }

    const usuarioABloquear = await prisma.usuario.findUnique({
        where: { correo: correo_bloquear }
    });

    if (!usuarioABloquear) {
        return {
            status: 400,
            message: 'Correo a bloquear no encontrado.',
        };
    }

    const bloqueado = await prisma.direccionBloqueada.create({
        data: {
            direccion: correo_bloquear,
            usuarioId: usuario.id
        }
    });

    return {
        status: 201,
        message: 'Usuario bloqueado exitosamente',
        bloqueado,
    };

  } catch (error) {
      return {
          status: 500,
          message: 'Error al bloquear el usuario',
          error: (error as Error).message,
      };
  }
});


app.post('/api/marcarcorreo', async({body})=>{
  const { correo, clave, id_correo_favorito } = await body as {
    correo: string;
    clave: string;
    id_correo_favorito: number;
  };

  if (!correo || !clave || !id_correo_favorito) {
    return {
        status: 400,
        message: 'Los campos correo, clave y id_correo_favorito son obligatorios.',
    };
  }

  try {
    const usuario = await prisma.usuario.findFirst({
        where: { correo, clave }
    });

    if (!usuario) {
        return {
            status: 401,
            message: 'Usuario no encontrado o clave incorrecta.',
        };
    }

    const correoExistente = await prisma.correos.findUnique({
        where: { id: id_correo_favorito }
    });

    if (!correoExistente) {
        return {
            status: 404,
            message: 'Correo no encontrado.',
        };
    }

    const favorito = await prisma.correosFavoritos.create({
        data: {
            idUsuario: usuario.id,
            idCorreo: id_correo_favorito
        }
    });

    return {
        status: 201,
        message: 'Correo marcado como favorito correctamente',
        favorito,
    };
  } catch (error) {
      return {
          status: 500,
          message: 'Error al marcar correo como favorito',
          error: (error as Error).message,
      };
  }
});



app.get




app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
