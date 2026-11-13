import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';

let _sql;
const sql = (...args) => (_sql ??= neon(process.env.DATABASE_URL))(...args);
const UNDEFINED_TABLE = '42P01';

async function orEmpty(query) {
  try {
    return await query;
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) return []; // todavía no hay sorteo
    throw err;
  }
}

/** Para el panel: nombre, link y si ya lo vio. Nunca las asignaciones. */
export const listForAdmin = () =>
  orEmpty(sql`SELECT name, token, seen FROM matches ORDER BY position`);

/** Reemplaza el sorteo completo (tabla incluida) en una sola transacción. */
export async function saveDraw(matches) {
  const rows = JSON.stringify(
    matches.map((m, position) => ({ ...m, position, token: randomBytes(12).toString('base64url') })),
  );
  _sql ??= neon(process.env.DATABASE_URL);
  await _sql.transaction([
    _sql`DROP TABLE IF EXISTS matches`,
    _sql`CREATE TABLE matches (
      name     text PRIMARY KEY,
      match    text NOT NULL,
      token    text NOT NULL UNIQUE,
      seen     boolean NOT NULL DEFAULT false,
      position int NOT NULL
    )`,
    _sql`INSERT INTO matches (name, match, token, position)
         SELECT name, match, token, position
         FROM jsonb_to_recordset(${rows}::jsonb)
           AS r(name text, match text, token text, position int)`,
  ]);
}

/** Quién es el dueño del link (sin revelar nada). */
export async function findByToken(token) {
  const [row] = await orEmpty(sql`SELECT name FROM matches WHERE token = ${token}`);
  return row ?? null;
}

/** Revela el resultado al dueño del link y lo marca como visto. */
export async function reveal(token) {
  const [row] = await orEmpty(
    sql`UPDATE matches SET seen = true WHERE token = ${token} RETURNING name, match`,
  );
  return row ?? null;
}
