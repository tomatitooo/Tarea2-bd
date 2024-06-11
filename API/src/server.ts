import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

const prisma = new PrismaClient();
const app = new Elysia();

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

interface LoginBody{
  correo: string;
  clave: string;
}

//utilizamos metodo POST para mantener privados los datos del usuario y que no se vean en la URL
app.post('/api/login', async({body})=>{
  const {correo,clave} = await body as LoginBody;

  if(!correo || !clave){
    return{
      status: 400,
      message: 'Los campos correo y clave son obligatorios',
    };
  }

  try{
    const user = await prisma.usuario.findFirst({
      where: {correo, clave}
    });

    if(!user){
      return{
        status:401,
        message: 'La clave o el usuario no es correcto'
      };
    }

    return{
      status:200,
      message: 'autenticacion exitosa',
      user
    };
  } catch (error){
    return{
      status: 500,
      message: 'Error en el servidor',
      error: (error as Error).message
    };
  }
});


app.post('/api/registrar', async ({ body }) => {
  const { nombre, correo, clave, descripcion } = await body as RegistrarBody;

  if (!nombre || !correo || !clave) {
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

app.post('/api/bloquear', async ({ body }) => {
  const { correo, clave, correo_bloquear } = await body as BloquearBody;

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

app.post('/api/marcarcorreo', async ({ body }) => {
  const { correo, clave, id_correo_favorito } = await body as MarcarCorreoBody;

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

    if (correoExistente.idDestinatario !== usuario.id) {
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

app.delete('/api/desmarcarcorreo', async ({ body }) => {
  const { correo, clave, id_correo_favorito } = await body as DesmarcarCorreoBody;

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

    const correofavorito = await prisma.correosFavoritos.findUnique({
      where: {
        idUsuario_idCorreo: {
          idUsuario: usuario.id,
          idCorreo: id_correo_favorito
        }
      }
    });

    if (!correofavorito) {
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

    return {
      status: 200,
      message: 'Correo desmarcado como favorito correctamente',
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error al marcar correo como favorito',
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
      return {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }

    return {
      status: 200,
      usuario,
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Error al obtener la informacion del usuario',
      error: (error as Error).message,
    };
  }
});


app.get('/api/favoritos/:correo',async ({params})=>{
  const { correo } = params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
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

    return {
      status: 200,
      favoritos,
    };
  } catch (error) {
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
      return {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }

    return {
      status: 200,
      correo: usuario.correo,
    };
  } catch (error) {
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
