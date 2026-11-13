import { useEffect, useState } from 'react';
import { getMe, reveal } from '../api.js';
import RevealCard from '../components/RevealCard.jsx';

export default function RevealPage({ token }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    getMe(token)
      .then((me) => setState({ status: 'ready', name: me.name }))
      .catch((err) => setState({ status: err.status === 404 ? 'invalid' : 'error' }));
  }, [token]);

  if (state.status === 'loading') {
    return <div className="m-auto size-10 animate-spin rounded-full border-4 border-line border-t-pine" aria-label="Cargando" />;
  }

  if (state.status !== 'ready') {
    return (
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-6xl" aria-hidden>{state.status === 'invalid' ? '🔗' : '📡'}</p>
        <h1 className="mt-4 font-display text-3xl font-bold">
          {state.status === 'invalid' ? 'Este link ya no sirve' : 'No pudimos conectar'}
        </h1>
        <p className="mt-2 max-w-xs text-muted">
          {state.status === 'invalid'
            ? 'Puede que se haya hecho un sorteo nuevo. Pídele tu link a quien organiza.'
            : 'Revisa tu internet y vuelve a abrir el link.'}
        </p>
      </main>
    );
  }

  return <RevealCard name={state.name} onOpen={() => reveal(token).then((r) => r.match)} />;
}
