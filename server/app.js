import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import * as db from './db.js';
import { drawMatches } from './draw.js';

const app = express();
app.use(express.json());
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// --- Participante (con su link personal) ------------------------------------
app.get('/api/me/:token', async (req, res) => {
  const me = await db.findByToken(req.params.token);
  me ? res.json(me) : res.status(404).json({ error: 'not_found' });
});

app.post('/api/me/:token/reveal', async (req, res) => {
  const result = await db.reveal(req.params.token);
  result ? res.json(result) : res.status(404).json({ error: 'not_found' });
});

app.put('/api/me/:token/wishes', async (req, res) => {
  const wishes = req.body?.wishes;
  if (typeof wishes !== 'string' || wishes.length > db.MAX_WISHES) {
    return res.status(400).json({ error: 'bad_request' });
  }
  const result = await db.saveWishes(req.params.token, wishes.trim());
  result ? res.json(result) : res.status(404).json({ error: 'not_found' });
});

// --- Organizador ---------------------------------------------------------------
function requireAdmin(req, res, next) {
  const expected = Buffer.from(process.env.ADMIN_TOKEN ?? '');
  const given = Buffer.from(req.get('authorization')?.replace(/^Bearer /, '') ?? '');
  if (!expected.length || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/admin', requireAdmin, async (req, res) => {
  res.json(await db.listForAdmin());
});

app.post('/api/admin/draw', requireAdmin, async (req, res) => {
  const names = (req.body?.names ?? []).map((n) => String(n).trim()).filter(Boolean);
  try {
    await db.saveDraw(drawMatches(names));
  } catch (err) {
    if (err.message.startsWith('Se necesitan') || err.message.startsWith('Hay nombres')) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
  res.json(await db.listForAdmin());
});

app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

export default app;
