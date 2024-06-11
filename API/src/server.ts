import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

// Función para registrar logs
function log(message: string) {
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
  console.log(`[${timestamp}] ${message}`);
}

interface RegistrarBody {
  nombre: string;
  correo: string;
  clave: string;
  descripcion?: string;
}

interface BloquearBody {
  correo: string;
  clave: string;
  correo_bloquear: string;
}

interface MarcarCorreoBody {
  correo: string;
  clave: string;
  id_correo_favorito: number;
}

interface DesmarcarCorreoBody {
  correo: string;
  clave: string;
  id_correo_favorito: number;
}

interface LoginBody {
  correo: string;
  clave: string;
}

// Utilizamos método POST para mantener privados los datos del usuario y que no se vean en la URL
app.post('/api/login', async ({ body }) => {
  const { correo, clave } = await body as LoginBody;

  if (!correo || !clave) {
    log('Intento de inicio de sesión fallido: Campos obligatorios faltantes.');
    return {
      status: 400,
      message: 'Los campos correo y clave son obligatorios',
    };
  }

  try {
    const user = await prisma.usuario.findFirst({
      where: { correo, clave }
    });

    if (!user) {
      log(`Intento de inicio de sesión fallido: La clave o el usuario ${correo} no es correcto.`);
      return {
        status: 401,
        message: 'La clave o el usuario no es correcto'
      };
    }

    log(`Usuario ${correo} inició sesión correctamente.`);
    return {
      status: 200,
      message: 'Autenticación exitosa',
      user
    };
  } catch (error) {
    log(`Error en el servidor al iniciar sesión`);
    return {
      status: 500,
      message: 'Error en el servidor',
      error: (error as Error).message
    };
  }
});

app.post('/api/registrar', async ({ body }) => {
  const { nombre, correo, clave, descripcion } = await body as RegistrarBody;

  if (!nombre || !correo || !clave) {
    log('Intento de registro fallido: Campos obligatorios faltantes.');
    return {
      status: 400,
      message: 'Los campos nombre, correo y clave son obligatorios.',
    };
  }

  try {
    const existinguser = await prisma.usuario.findFirst({
      where: { correo }
    });

    if (existinguser) {
      log(`Intento de registro fallido: El correo ${correo} ya está registrado.`);
      return {
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

    log(`Se ha registrado el usuario: ${nombre} de forma correcta`);
    return {
      status: 201,
      message: 'Usuario registrado exitosamente',
      user,
    };
  } catch (error) {
    log(`Error al registrar el usuario`);
    return {
      status: 500,
      message: 'Error al registrar el usuario',
      error: (error as Error).message,
    };
  }
});

app.post('/api/bloquear', async ({ body }) => {
  const { correo, clave, correo_bloquear } = await body as BloquearBody;

  if (!correo || !correo_bloquear || !clave) {
    log('Intento de bloqueo fallido: Campos obligatorios faltantes.');
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
      log(`Intento de bloqueo fallido: Usuario ${correo} no encontrado o clave incorrecta.`);
      return {
        status: 400,
        message: 'Usuario no encontrado o clave incorrecta.',
      };
    }

    const usuarioABloquear = await prisma.usuario.findUnique({
      where: { correo: correo_bloquear }
    });

    if (!usuarioABloquear) {
      log(`Intento de bloqueo fallido: Correo a bloquear ${correo_bloquear} no encontrado.`);
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

    log(`Usuario ${correo_bloquear} bloqueado exitosamente por ${correo}`);
    return {
      status: 201,
      message: 'Usuario bloqueado exitosamente',
      bloqueado,
    };
  } catch (error) {
    log(`Error al bloquear el usuario`);
    return {
      status: 500,
      message: 'Error al bloquear el usuario',
      error: (error as Error).message,
    };
  }
});

app.post('/api/marcarcorreo', async ({ body }) => {
  const { correo, clave, id_correo_favorito } = await body as MarcarCorreoBody;

  if (!correo || !clave || !id_correo_favorito) {
    log('Intento de marcar correo como favorito fallido: Campos obligatorios faltantes.');
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
      log(`Intento de marcar correo como favorito fallido: Usuario ${correo} no encontrado o clave incorrecta.`);
      return {
        status: 401,
        message: 'Usuario no encontrado o clave incorrecta.',
      };
    }

    const correoExistente = await prisma.correos.findUnique({
      where: { id: id_correo_favorito }
    });

    if (!correoExistente) {
      log(`Intento de marcar correo como favorito fallido: Correo con ID ${id_correo_favorito} no encontrado.`);
      return {
        status: 404,
        message: 'Correo no encontrado.',
      };
    }

    if (correoExistente.idDestinatario !== usuario.id) {
      log(`Intento de marcar correo como favorito fallido: Usuario ${correo} no tiene permiso para marcar el correo con ID ${id_correo_favorito} como favorito.`);
      return {
        status: 403,
        message: 'No tienes permiso para marcar este correo como favorito.',
      };
    }

    const favorito = await prisma.correosFavoritos.create({
      data: {
        idUsuario: usuario.id,
        idCorreo: id_correo_favorito
      }
    });

    log(`Usuario ${correo} marcó como favorito el correo con ID ${id_correo_favorito}`);
    return {
      status: 201,
      message: 'Correo marcado como favorito correctamente',
      favorito,
    };
  } catch (error) {
    log(`Error al marcar correo como favorito`);
    return {
      status: 500,
      message: 'Error al marcar correo como favorito',
      error: (error as Error).message,
    };
  }
});

app.delete('/api/desmarcarcorreo', async ({ body }) => {
  const { correo, clave, id_correo_favorito } = await body as DesmarcarCorreoBody;

  if (!correo || !clave || !id_correo_favorito) {
    log('Intento de desmarcar correo como favorito fallido: Campos obligatorios faltantes.');
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
      log(`Intento de desmarcar correo como favorito fallido: Usuario ${correo} no encontrado o clave incorrecta.`);
      return {
        status: 401,
        message: 'Usuario no encontrado o clave incorrecta.',
      };
    }

    const correofavorito = await prisma.correosFavoritos.findUnique({
      where: {
        idUsuario_idCorreo: {
          idUsuario: usuario.id,
          idCorreo: id_correo_favorito
        }
      }
    });

    if (!correofavorito) {
      log(`Intento de desmarcar correo como favorito fallido: Correo favorito con ID ${id_correo_favorito} no encontrado.`);
      return {
        status: 404,
        message: 'Correo favorito no encontrado.',
      };
    }

    await prisma.correosFavoritos.delete({
      where: {
        idUsuario_idCorreo: {
          idUsuario: usuario.id,
          idCorreo: id_correo_favorito
        }
      }
    });

    log(`Usuario ${correo} desmarcó como favorito el correo con ID ${id_correo_favorito}`);
    return {
      status: 200,
      message: 'Correo desmarcado como favorito correctamente',
    };
  } catch (error) {
    log(`Error al desmarcar correo como favorito`);
    return {
      status: 500,
      message: 'Error al desmarcar correo como favorito',
      error: (error as Error).message,
    };
  }
});

app.get('/api/informacion/:correo', async ({ params }) => {
  const { correo } = params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: {
        nombre: true,
        correo: true,
        descripcion: true,
      },
    });

    if (!usuario) {
      log(`Intento de obtener información fallido: Usuario con correo ${correo} no encontrado.`);
      return {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }

    log(`Se obtuvo la información del usuario: ${correo}`);
    return {
      status: 200,
      usuario,
    };
  } catch (error) {
    log(`Error al obtener la información del usuario`);
    return {
      status: 500,
      message: 'Error al obtener la informacion del usuario',
      error: (error as Error).message,
    };
  }
});


app.get('/api/favoritos/:correo', async ({ params }) => {
  const { correo } = params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      log(`Intento de obtener correos favoritos fallido: Usuario con correo ${correo} no encontrado.`);
      return {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }

    const favoritos = await prisma.correosFavoritos.findMany({
      where: { idUsuario: usuario.id },
      include: {
        correo: true,
      },
    });

    log(`Se obtuvieron los correos favoritos del usuario: ${correo}`);
    return {
      status: 200,
      favoritos,
    };
  } catch (error) {
    log(`Error al obtener los correos favoritos`);
    return {
      status: 500,
      message: 'Error al obtener los correos favoritos',
      error: (error as Error).message,
    };
  }
});

app.get('/api/info/:id', async ({ params }) => {
  const { id } = params;

  try {
    // Buscar el usuario por ID
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: { correo: true },
    });

    if (!usuario) {
      log(`Intento de obtener correo del usuario fallido: Usuario con ID ${id} no encontrado.`);
      return {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }

    log(`Se obtuvo el correo del usuario con ID: ${id}`);
    return {
      status: 200,
      correo: usuario.correo,
    };
  } catch (error) {
    log(`Error al obtener el correo del usuario`);
    return {
      status: 500,
      message: 'Error al obtener el correo del usuario',
      error: (error as Error).message,
    };
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
