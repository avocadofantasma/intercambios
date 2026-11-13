import { useState } from 'react';

async function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  const colors = ['#b42335', '#14532d', '#c99a2e', '#ffffff'];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors }), 250);
}

export default function RevealCard({ name, onOpen }) {
  const [match, setMatch] = useState(null);
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState(false);

  async function openGift() {
    setOpening(true);
    setFailed(false);
    try {
      setMatch(await onOpen());
      celebrate();
    } catch {
      setFailed(true);
    } finally {
      setOpening(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold tracking-wide text-berry uppercase">Hola, {name}</p>

      {!match ? (
        <>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Tu regalo te espera</h1>
          <p className="mt-2 text-muted">Asegúrate de que nadie vea tu pantalla. 🙈</p>
          <button
            onClick={openGift}
            disabled={opening}
            className="group mt-10 flex flex-col items-center gap-4 rounded-3xl p-4 disabled:opacity-70"
            aria-label="Abrir el regalo para ver a quién le regalas"
          >
            <span className="animate-wiggle text-[7.5rem] leading-none drop-shadow-xl transition group-hover:scale-110" aria-hidden>
              🎁
            </span>
            <span className="rounded-full bg-pine px-6 py-3 font-semibold text-paper shadow-md">
              {opening ? 'Abriendo…' : 'Toca para abrir'}
            </span>
          </button>
          {failed && <p role="alert" className="mt-4 text-sm text-berry">No pudimos abrirlo. Intenta otra vez.</p>}
        </>
      ) : (
        <div className="animate-pop-in mt-4 w-full max-w-sm" aria-live="assertive">
          <p className="text-muted">Le regalas a…</p>
          <div className="relative mt-4 overflow-hidden rounded-3xl border-2 border-gold/60 bg-card px-6 py-10 shadow-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-berry via-gold to-pine" aria-hidden />
            <p className="font-display text-5xl font-extrabold break-words text-pine sm:text-6xl">{match}</p>
          </div>
          <p className="mx-auto mt-6 max-w-xs text-sm text-muted">
            Es secreto. 🤫 Si se te olvida, vuelve a abrir este mismo link.
          </p>
        </div>
      )}
    </main>
  );
}
