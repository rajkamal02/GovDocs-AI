export interface Doc { id: string; name: string; originalName: string; mimeType: string; ext: string; size: number; category: string; folderId: string | null; width: number | null; height: number | null; ocrStatus: string; createdAt: string; thumbUrl: string | null; matchSnippet: string | null }
export interface Folder { id: string; name: string; icon: string | null; count: number }
export interface Spec { format?: string; minKB?: number; maxKB?: number; width?: number; height?: number; dpi?: number; quality?: number; fit?: string; background?: string; optimizePdf?: boolean }
export interface Slot { key: string; label: string; kind: 'photo' | 'signature' | 'document'; docCategory: string; filename: string; spec: Spec }
export interface Preset { id: string; name: string; full: string; category: string; color: string; slots: Slot[]; custom?: boolean }
export interface Activity { id: string; kind: string; message: string; createdAt: string }
export interface Share { id: string; token: string; link: string; label: string; targetType: string; hasPassword: boolean; expiresAt: number | null; viewLimit: number | null; views: number; downloads: number; status: string; createdAt: string }
export interface Result { id: string; url: string; name: string; size: number; mime: string; width: number | null; height: number | null; meetsMax: boolean; meetsMin: boolean; warnings: string[]; steps?: string[]; sourceUrl?: string }
export interface ReqItem { kind: string; label: string; format?: string; minKB?: number; maxKB?: number; width?: number; height?: number; dpi?: number; background?: string; notes?: string }
