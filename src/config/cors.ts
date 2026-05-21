/**
 * Origines autorisées pour CORS HTTP et Socket.IO.
 * En production Render : définir FRONTEND_CLIENT_URL et FRONTEND_ADMIN_URL.
 */
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'https://www.taomaninvestment.com',
  'https://taomaninvestment.com',
];

export function getAllowedOrigins(): string[] {
  const fromEnv = [
    process.env.FRONTEND_ADMIN_URL,
    process.env.FRONTEND_CLIENT_URL,
    ...(process.env.CORS_EXTRA_ORIGINS?.split(',').map((s) => s.trim()) ?? []),
  ].filter((url): url is string => Boolean(url));

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin === 'https://taomaninvestment.com' || origin.endsWith('.taomaninvestment.com')) {
    return true;
  }

  return false;
}

export function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  if (isOriginAllowed(origin)) {
    callback(null, true);
    return;
  }
  console.warn(`[CORS] Origin blocked: ${origin}`);
  callback(null, false);
}
