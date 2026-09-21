import express from 'express';
import type { Express, Request, Response } from 'express';
import open from 'open';
import { readFileSync, writeFileSync } from "node:fs";

export let app: Express = express();
app.use(express.json());
app.use(express.static('frontend'));

type Usuario = {
    email: string,
    contraseña: string,
    nombre: string,
    apellido:string,
    numeroDeTelefono?: string,
DNI: number,
comfirmarContraseña: string
}

