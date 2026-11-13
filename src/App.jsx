import RevealPage from './pages/RevealPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const path = window.location.pathname;
  const token = path.match(/^\/r\/([\w-]+)/)?.[1];

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:px-6">
      {token ? <RevealPage token={token} /> : path.startsWith('/admin') ? <AdminPage /> : <Home />}
    </div>
  );
}

function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-7xl" aria-hidden>🎁</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold">Intercambio de regalos</h1>
      <p className="mt-3 max-w-xs text-muted">
        Abre el link personal que te llegó por WhatsApp para descubrir a quién le regalas.
      </p>
    </main>
  );
}
