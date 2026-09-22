import express from 'express';
import type { Express, Request, Response } from 'express';
import open from 'open';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type Usuario = {
email: string;
contraseña: string;
nombre: string;
apellido: string;
numeroDeTelefono?: string;
DNI: number;
comfirmarContraseña: string;
respuestas?: {
  [key: string]: string | undefined;
  edad?: string;
  genero?: string;
  objetivo?: string;
  experiencia?: string;
  cantidaDiasEntrenamiento?: string;
  duracionEntrenamiento?: string;
  intensidadEntrenamiento?: string;
  };
};

const usuariosPath = new URL('./usuarios.JSON', import.meta.url);
const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

const leerUsuarios = (): Usuario[] => {
  if (!existsSync(usuariosPath)) {
    return [];
  }

  const contenido = readFileSync(usuariosPath, 'utf-8').trim();
  if (!contenido) {
    return [];
  }

  const parsed = JSON.parse(contenido);
  return Array.isArray(parsed) ? parsed : [];
};

const guardarUsuarios = (usuarios: Usuario[]) => {
  writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), 'utf-8');
};

const obtenerUsuarioPorEmail = (email: string): Usuario | undefined => {
  const usuarios = leerUsuarios();
  return usuarios.find((usuario) => usuario.email.toLowerCase() === email.toLowerCase());
};

app.use(express.json());
app.use(express.static('.'));

app.get('/', (_req: Request, res: Response) => {
  const filePath = fileURLToPath(new URL('./crearcuenta.html', import.meta.url));
  res.sendFile(filePath);
});

app.get('/usuarios', (_req: Request, res: Response) => {
  res.json(leerUsuarios());
});

app.post('/login', (req: Request, res: Response) => {
  const { email, contraseña } = req.body as { email?: string; contraseña?: string };

  if (!email || !contraseña) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  const usuario = obtenerUsuarioPorEmail(email);

  if (!usuario || usuario.contraseña !== contraseña) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
  }

  const { contraseña: _contraseña, comfirmarContraseña: _comfirmarContraseña, ...usuarioSeguro } = usuario;

  return res.status(200).json({
    message: 'Login correcto.',
    usuario: usuarioSeguro,
  });
});

app.post('/usuarios/:email/respuestas', (req: Request, res: Response) => {
  const email = decodeURIComponent(req.params.email);
  const respuestas = req.body as { [key: string]: string | undefined };

  if (!respuestas.edad) {
    return res.status(400).json({ message: 'La respuesta de edad es obligatoria.' });
  }

  const usuarios = leerUsuarios();
  const index = usuarios.findIndex((usuario) => usuario.email.toLowerCase() === email.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const usuarioActualizado: Usuario = {
    ...usuarios[index],
    respuestas: {
      ...(usuarios[index].respuestas ?? {}),
      ...respuestas, // Merge all provided answers
    },
  };

  usuarios[index] = usuarioActualizado;
  guardarUsuarios(usuarios);

  return res.status(200).json({
    message: 'Respuestas guardadas correctamente.',
    usuario: usuarioActualizado,
  });
});

app.post('/usuarios', (req: Request, res: Response) => {
  const usuario = req.body as Partial<Usuario>;

  if (!usuario?.email || !usuario?.contraseña || !usuario?.nombre || !usuario?.apellido || !usuario?.DNI || !usuario?.comfirmarContraseña) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  if (usuario.contraseña !== usuario.comfirmarContraseña) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }

  const DNI = Number(usuario.DNI);

  if (Number.isNaN(DNI)) {
    return res.status(400).json({ message: 'El DNI debe ser un número válido.' });
  }

  const nuevoUsuario: Usuario = {
    email: String(usuario.email),
    contraseña: String(usuario.contraseña),
    nombre: String(usuario.nombre),
    apellido: String(usuario.apellido),
    numeroDeTelefono: usuario.numeroDeTelefono ? String(usuario.numeroDeTelefono) : undefined,
    DNI,
    comfirmarContraseña: String(usuario.comfirmarContraseña),
    respuestas: {},
  };

  const usuarios = leerUsuarios();
  const yaExiste = usuarios.some((u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase());

  if (yaExiste) {
    return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
  }

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return res.status(201).json({
    message: 'Usuario creado correctamente.',
    usuario: nuevoUsuario,
  });
});

if (process.argv[1] && process.argv[1].endsWith('Proyecto.ts')) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
  });
}

export { app, leerUsuarios, guardarUsuarios };

