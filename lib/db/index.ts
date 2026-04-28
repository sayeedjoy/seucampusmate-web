import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Optional WebSocket constructor for Neon in Node.js environments.
// Avoid hard dependency at module-load time so builds don't fail if `ws` is absent.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
} catch {
  // No-op: Neon can still operate for non-websocket use-cases.
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
