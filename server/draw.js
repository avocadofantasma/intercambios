import { randomInt } from 'node:crypto';

/**
 * Asigna a cada participante a quién le regala.
 *
 * Usa el algoritmo de Sattolo: produce una permutación de un solo ciclo, así que
 * nadie se regala a sí mismo, no hay parejas cerradas (A→B y B→A) en grupos de
 * más de dos, y termina siempre (la versión anterior podía recursar sin fin
 * cuando al último participante sólo le quedaba él mismo).
 */
export function drawMatches(names) {
  if (names.length < 2) throw new Error('Se necesitan al menos 2 participantes');
  if (new Set(names).size !== names.length) throw new Error('Hay nombres repetidos');

  const order = [...names];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(0, i); // j < i, la diferencia con Fisher–Yates
    [order[i], order[j]] = [order[j], order[i]];
  }

  const giverToReceiver = new Map();
  order.forEach((name, i) => giverToReceiver.set(name, order[(i + 1) % order.length]));

  return names.map((name) => ({ name, match: giverToReceiver.get(name), seen: false }));
}
