import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const e = process.env;
const num = (v: string | undefined, d: number) => (v && !isNaN(+v) ? +v : d);
const dataDir = path.resolve(e.DATA_DIR || path.join(process.cwd(), 'data'));
fs.mkdirSync(dataDir, { recursive: true });

export const config = {
  port: num(e.PORT, 4000),
  isProd: e.NODE_ENV === 'production',
  dataDir,
  corsOrigins: (e.CORS_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean),
  publicApiUrl: (e.PUBLIC_API_URL || `http://localhost:${num(e.PORT, 4000)}`).replace(/\/$/, ''),
  frontendUrl: (e.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  db: {
    type: e.DATABASE_URL ? 'postgres' : 'sqljs',
    url: e.DATABASE_URL || '',
    ssl: e.DB_SSL === 'true',
    file: path.resolve(e.SQLITE_FILE || path.join(dataDir, 'govdocs.sqlite')),
    sync: e.DB_SYNC !== 'false',
  },
  clerkSecret: e.CLERK_SECRET_KEY || '',
  storage: {
    dir: path.resolve(e.STORAGE_DIR || path.join(dataDir, 'storage')),
    bucket: e.AWS_S3_BUCKET || '',
    region: e.AWS_REGION || 'ap-south-1',
    endpoint: e.S3_ENDPOINT || '', // set for Cloudflare R2 / MinIO / any S3-compatible store
  },
  maxFileMB: num(e.MAX_FILE_MB, 100),
  tempTtlMin: num(e.TEMP_TTL_MINUTES, 60),
  gemini: { key: e.GEMINI_API_KEY || '', model: e.GEMINI_MODEL || 'gemini-flash-latest' },
  aiImages: e.AI_IMAGES === 'true',
  ocrLangs: e.OCR_LANGS || 'eng',
};

export function masterKeyMaterial(): string {
  if (e.ENCRYPTION_KEY) return e.ENCRYPTION_KEY;
  if (config.isProd) throw new Error('ENCRYPTION_KEY is required in production');
  const f = path.join(dataDir, '.devkey');
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(48).toString('base64'), { mode: 0o600 });
  return fs.readFileSync(f, 'utf8');
}

export function assertConfig() {
  if (!config.isProd) return;
  const missing: string[] = [];
  if (!config.clerkSecret) missing.push('CLERK_SECRET_KEY');
  if ((e.ENCRYPTION_KEY || '').length < 32) missing.push('ENCRYPTION_KEY (32+ characters)');
  if (!e.PUBLIC_API_URL) missing.push('PUBLIC_API_URL (the https URL of this API)');
  if (!e.FRONTEND_URL) missing.push('FRONTEND_URL (the https URL of your website)');
  if (!e.CORS_ORIGIN) missing.push('CORS_ORIGIN (same as FRONTEND_URL)');
  if (missing.length) throw new Error('Missing required production settings: ' + missing.join(', '));
  if (!config.storage.bucket) console.warn('[warn] No S3 bucket set: files go to local disk and are LOST on redeploy unless a persistent volume is mounted at STORAGE_DIR.');
  if (!config.db.url) console.warn('[warn] No DATABASE_URL: using the local file database. Use PostgreSQL on cloud hosts.');
}
