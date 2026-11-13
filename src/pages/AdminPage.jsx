import { useEffect, useState } from 'react';
import { adminDraw, adminList } from '../api.js';

const KEY_STORAGE = 'intercambio-admin-key';

function readKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

function whatsappLink(name, url) {
  const text = `¡Hola ${name}! 🎁 Ya quedó el sorteo del intercambio.\n\nDescubre a quién le regalas aquí (es sólo para ti, no lo compartas):\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

const button = 'rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50';

export default function AdminPage() {
  const [key, setKey] = useState(readKey);
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState(null);
  const [names, setNames] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  async function load(k = key) {
    setBusy(true);
    setError(null);
    try {
      const data = await adminList(k);
      setList(data);
      setAuthed(true);
      setEditing(data.length === 0);
      try { localStorage.setItem(KEY_STORAGE, k); } catch {}
    } catch (err) {
      setAuthed(false);
      setError(err.status === 401 ? 'Clave incorrecta.' : 'No pudimos conectar.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (key) load();
    // Refresca quién ya vio al volver a la pestaña (p. ej. después de mandar WhatsApps).
    const onVisible = () => document.visibilityState === 'visible' && authed && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function draw() {
    const parsed = names.split(/[\n,]/).map((n) => n.trim()).filter(Boolean);
    if (list?.length && !window.confirm('Esto hace un sorteo nuevo y los links anteriores dejan de servir. ¿Continuar?')) return;
    setBusy(true);
    setError(null);
    try {
      setList(await adminDraw(key, parsed));
      setEditing(false);
    } catch (err) {
      setError(err.status === 400 ? err.message : 'No se pudo hacer el sorteo.');
    } finally {
      setBusy(false);
    }
  }

  async function copy(name, url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  if (!authed) {
    return (
      <main className="m-auto w-full max-w-sm">
        <h1 className="font-display text-3xl font-extrabold">Organizar 🎄</h1>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <label className="block text-sm font-medium" htmlFor="key">Clave de organizador</label>
          <input
            id="key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 focus:border-pine focus:outline-none"
            autoFocus
          />
          {error && <p role="alert" className="text-sm text-berry">{error}</p>}
          <button disabled={busy || !key} className={`${button} w-full bg-pine py-3 text-paper`}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  const seen = list.filter((p) => p.seen).length;

  return (
    <main>
      <p className="text-sm font-semibold tracking-wide text-berry uppercase">Panel de organizador</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold">Intercambio 🎄</h1>

      {editing ? (
        <section className="mt-8 rounded-3xl border border-line bg-card p-5">
          <label htmlFor="names" className="font-semibold">¿Quiénes participan?</label>
          <p className="text-sm text-muted">Un nombre por línea (tú también).</p>
          <textarea
            id="names"
            rows={6}
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder={'Carlos\nAna\nLuis'}
            className="mt-3 w-full rounded-2xl border border-line bg-paper px-4 py-3 focus:border-pine focus:outline-none"
          />
          {error && <p role="alert" className="mt-2 text-sm text-berry">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={draw} disabled={busy} className={`${button} flex-1 bg-berry py-3 text-white`}>
              {busy ? 'Sorteando…' : '🎲 Sortear'}
            </button>
            {list.length > 0 && (
              <button onClick={() => setEditing(false)} className={`${button} text-muted`}>Cancelar</button>
            )}
          </div>
        </section>
      ) : (
        <>
          <p className="mt-3 text-muted">
            Manda a cada quien su link. Ya vieron: <strong className="text-ink">{seen} de {list.length}</strong>
          </p>
          <ul className="mt-6 space-y-3">
            {list.map((p) => {
              const url = `${window.location.origin}/r/${p.token}`;
              return (
                <li key={p.token} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className={`text-sm ${p.seen ? 'text-pine' : 'text-muted'}`}>
                      {p.seen ? '✓ Ya lo vio' : 'Pendiente'}
                    </p>
                  </div>
                  <button onClick={() => copy(p.name, url)} className={`${button} border border-line`}>
                    {copied === p.name ? '¡Copiado!' : 'Copiar link'}
                  </button>
                  <a href={whatsappLink(p.name, url)} target="_blank" rel="noreferrer" className={`${button} bg-[#25D366] text-[#0b3d1f]`}>
                    WhatsApp
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">
            El botón de WhatsApp abre el mensaje listo; sólo eliges el chat de esa persona. Tú no ves a quién le tocó nadie.
          </p>
          <button
            onClick={() => {
              setNames(list.map((p) => p.name).join('\n'));
              setEditing(true);
            }}
            className={`${button} mt-8 border border-line text-muted`}
          >
            Hacer sorteo nuevo
          </button>
        </>
      )}
    </main>
  );
}
