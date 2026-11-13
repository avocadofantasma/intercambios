import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawMatches } from './draw.js';

const NAMES = Array.from({ length: 20 }, (_, i) => `P${i}`);

test('cada quien da y recibe exactamente un regalo, nunca a sí mismo', () => {
  for (let run = 0; run < 500; run++) {
    const matches = drawMatches(NAMES);
    assert.equal(matches.length, NAMES.length);
    assert.deepEqual(matches.map((m) => m.name), NAMES);
    assert.deepEqual([...matches.map((m) => m.match)].sort(), [...NAMES].sort());
    for (const m of matches) assert.notEqual(m.name, m.match);
  }
});

test('forma un solo ciclo (sin grupitos cerrados)', () => {
  const matches = drawMatches(NAMES);
  const next = new Map(matches.map((m) => [m.name, m.match]));
  let current = NAMES[0];
  const visited = new Set();
  while (!visited.has(current)) {
    visited.add(current);
    current = next.get(current);
  }
  assert.equal(visited.size, NAMES.length);
});

test('funciona con 2 participantes y falla con menos o con repetidos', () => {
  assert.deepEqual(drawMatches(['A', 'B']).map((m) => m.match), ['B', 'A']);
  assert.throws(() => drawMatches(['A']));
  assert.throws(() => drawMatches(['A', 'A', 'B']));
});
