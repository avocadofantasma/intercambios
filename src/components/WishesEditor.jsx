import { useState } from 'react';
import { saveWishes } from '../api.js';

const MAX = 600;

export default function WishesEditor({ token, initial }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  const dirty = text.trim() !== saved;

  async function save(e) {
    e.preventDefault();
    setStatus('saving');
    try {
      const { wishes } = await saveWishes(token, text);
      setSaved(wishes);
      setText(wishes);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={save} className="w-full rounded-3xl border border-line bg-card p-5 text-left">
      <label htmlFor="wishes" className="font-display text-xl font-bold">
        Lo que te gusta 💭
      </label>
      <p className="mt-1 text-sm text-muted">
        Para que a quien le tocaste le atine: tallas, colores, hobbies, ideas… o lo que <em>no</em> te gusta.
      </p>
      <textarea
        id="wishes"
        rows={4}
        maxLength={MAX}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus('idle');
        }}
        placeholder="Ej. Talla M, me encanta el café y los libros de misterio. Nada de tazas 😅"
        className="mt-3 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 focus:border-pine focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted tabular-nums" aria-live="polite">
          {status === 'saved' && !dirty ? '✓ Guardado' : status === 'error' ? 'No se pudo guardar' : `${text.length}/${MAX}`}
        </span>
        <button
          disabled={!dirty || status === 'saving'}
          className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-40"
        >
          {status === 'saving' ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
