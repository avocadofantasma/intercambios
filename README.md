# Intercambio de regalos

App mínima para un intercambio (amigo secreto) entre amigos, en Vercel + Neon.

1. Entra a `/admin` con la clave (`ADMIN_TOKEN`, está en `.env.local`).
2. Escribe los nombres, uno por línea, y dale **Sortear**.
3. Con el botón **WhatsApp** de cada persona se abre el mensaje listo con su link personal (`/r/<token>`).
4. Cada quien abre su link, toca el regalo y ve a quién le regala. El panel muestra quién ya lo vio.

Nadie, ni el organizador, ve las asignaciones de los demás.

## Desarrollo

```bash
vercel env pull .env.local --yes   # DATABASE_URL y ADMIN_TOKEN
npm install
npm run dev     # API :3000 + Vite :5173 (usa la misma base que producción)
npm test        # pruebas del sorteo
```

Deploy: `vercel deploy --prod`. Para cerrar al terminar: borra el recurso de Neon y el proyecto en el dashboard de Vercel.
