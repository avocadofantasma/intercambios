// Servidor local (`npm run dev` / `npm start`). En Vercel se usa api/index.js.
// Usa la misma base de Neon que producción (variables en .env.local).
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';

const port = process.env.PORT || 3000;
const publicPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');

app.use(express.static(publicPath));
app.get('/{*splat}', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));

app.listen(port, () => console.log(`Intercambio en http://localhost:${port}`));
