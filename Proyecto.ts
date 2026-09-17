import express from 'express';
import type { Express, Request, Response } from 'express';
import open from 'open';
import { readFileSync, writeFileSync } from "node:fs";
type Usuario = {
    email: string,
    contraseña: string,
    nombre: string,
    apellido:string,
    numeroDeTelefono?: string,
DNI: number,
comfirmarContraseña: string
}
