import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';

let _sql;
const db = () => (_sql ??= neon(process.env.DATABASE_URL));
const UNDEFINED_TABLE = '42P01';

export const MAX_WISHES = 600;

async function orEmpty(query) {
  try {
    return await query;
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) return []; // todavía no hay sorteo
    throw err;
  }
}

/** Para el panel: nombre, link, si ya lo vio y si ya escribió qué le gusta. Nunca las asignaciones. */
export const listForAdmin = () =>
  orEmpty(db()`
    SELECT name, token, seen, coalesce(wishes, '') <> '' AS "hasWishes"
    FROM matches ORDER BY position`);

/** Reemplaza el sorteo completo (tabla incluida) en una sola transacción. */
export async function saveDraw(matches) {
  const sql = db();
  const rows = JSON.stringify(
    matches.map((m, position) => ({ ...m, position, token: randomBytes(12).toString('base64url') })),
  );
  await sql.transaction([
    sql`DROP TABLE IF EXISTS matches`,
    sql`CREATE TABLE matches (
      name     text PRIMARY KEY,
      match    text NOT NULL,
      token    text NOT NULL UNIQUE,
      seen     boolean NOT NULL DEFAULT false,
      wishes   text,
      position int NOT NULL
    )`,
    sql`INSERT INTO matches (name, match, token, position)
        SELECT name, match, token, position
        FROM jsonb_to_recordset(${rows}::jsonb)
          AS r(name text, match text, token text, position int)`,
  ]);
}

/** Dueño del link y su propia lista (sin revelar nada del sorteo). */
export async function findByToken(token) {
  const [row] = await orEmpty(
    db()`SELECT name, coalesce(wishes, '') AS wishes FROM matches WHERE token = ${token}`,
  );
  return row ?? null;
}

/** Revela a quién le regala y lo que a esa persona le gusta; marca como visto. */
export async function reveal(token) {
  const [row] = await orEmpty(db()`
    UPDATE matches AS me SET seen = true
    FROM matches AS them
    WHERE me.token = ${token} AND them.name = me.match
    RETURNING me.name, me.match, coalesce(them.wishes, '') AS "matchWishes"`);
  return row ?? null;
}

export async function saveWishes(token, wishes) {
  const [row] = await orEmpty(
    db()`UPDATE matches SET wishes = ${wishes} WHERE token = ${token} RETURNING wishes`,
  );
  return row ?? null;
}
