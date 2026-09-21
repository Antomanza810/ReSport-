import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';

import { app } from './Proyecto.ts';

const usuariosPath = new URL('./usuarios.JSON', import.meta.url);
const originalUsers = readFileSync(usuariosPath, 'utf-8');

test('POST /usuarios crea un usuario y lo guarda en usuarios.JSON', async (t) => {
  writeFileSync(usuariosPath, JSON.stringify([], null, 2), 'utf-8');

  t.after(() => {
    writeFileSync(usuariosPath, originalUsers, 'utf-8');
  });

  const server = app.listen(0);
  await once(server, 'listening');

  const port = (server.address() as AddressInfo).port;

  const response = await fetch(`http://127.0.0.1:${port}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'juan@mail.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      contraseña: '123456',
      comfirmarContraseña: '123456',
      DNI: 40123456,
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.message, 'Usuario creado correctamente.');

  const savedUsers = JSON.parse(readFileSync(usuariosPath, 'utf-8'));
  assert.equal(savedUsers.length, 1);
  assert.equal(savedUsers[0].email, 'juan@mail.com');

  server.close();
});

test('POST /usuarios rechaza contraseñas que no coinciden', async (t) => {
  writeFileSync(usuariosPath, JSON.stringify([], null, 2), 'utf-8');

  t.after(() => {
    writeFileSync(usuariosPath, originalUsers, 'utf-8');
  });

  const server = app.listen(0);
  await once(server, 'listening');

  const port = (server.address() as AddressInfo).port;

  const response = await fetch(`http://127.0.0.1:${port}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'maria@mail.com',
      nombre: 'Maria',
      apellido: 'Lopez',
      contraseña: '1111',
      comfirmarContraseña: '2222',
      DNI: 12345678,
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, 'Las contraseñas no coinciden.');

  server.close();
});

test('POST /login devuelve el usuario correcto y POST /usuarios/:email/respuestas guarda la edad', async (t) => {
  const usuariosIniciales = [
    {
      email: 'login@mail.com',
      contraseña: 'abc123',
      nombre: 'Login',
      apellido: 'User',
      DNI: 11111111,
      comfirmarContraseña: 'abc123',
      respuestas: {},
    },
  ];

  writeFileSync(usuariosPath, JSON.stringify(usuariosIniciales, null, 2), 'utf-8');

  t.after(() => {
    writeFileSync(usuariosPath, originalUsers, 'utf-8');
  });

  const server = app.listen(0);
  await once(server, 'listening');

  const port = (server.address() as AddressInfo).port;

  const loginResponse = await fetch(`http://127.0.0.1:${port}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'login@mail.com',
      contraseña: 'abc123',
    }),
  });

  const loginBody = await loginResponse.json();

  assert.equal(loginResponse.status, 200);
  assert.equal(loginBody.usuario.email, 'login@mail.com');

  const respuestaResponse = await fetch(`http://127.0.0.1:${port}/usuarios/login@mail.com/respuestas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      edad: '24-29',
    }),
  });

  const respuestaBody = await respuestaResponse.json();
  const usuariosGuardados = JSON.parse(readFileSync(usuariosPath, 'utf-8'));

  assert.equal(respuestaResponse.status, 200);
  assert.equal(respuestaBody.message, 'Respuestas guardadas correctamente.');
  assert.equal(usuariosGuardados[0].respuestas.edad, '24-29');

  server.close();
});
