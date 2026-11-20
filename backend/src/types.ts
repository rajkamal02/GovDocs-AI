export type OutFormat = 'jpg' | 'png' | 'webp' | 'pdf' | 'original';
export interface FileSpec {
  format?: OutFormat;
  minKB?: number;
  maxKB?: number;
  width?: number;
  height?: number;
  dpi?: number;
  quality?: number;
  fit?: 'contain' | 'cover' | 'fill';
  background?: string;
  optimizePdf?: boolean;
}
export interface Slot {
  key: string;
  label: string;
  kind: 'photo' | 'signature' | 'document';
  docCategory: string;
  filename: string;
  spec: FileSpec;
}
export interface Preset {
  id: string;
  name: string;
  full: string;
  category: string;
  color: string;
  slots: Slot[];
  custom?: boolean;
}
export const CATEGORIES = ['PASSPORT_PHOTO', 'SIGNATURE', 'AADHAAR', 'PAN_CARD', 'RESUME', 'CERTIFICATE', 'MARKSHEET', 'GOVT_ID', 'OTHER'] as const;
