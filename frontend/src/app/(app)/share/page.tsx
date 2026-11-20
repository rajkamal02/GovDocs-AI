'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/ui';
import { ShareDialog, useDocs } from '@/components/shared';
import { useApi, useQuery } from '@/lib/hooks';
import type { Share } from '@/lib/types';
import { date } from '@/lib/util';

const COLOR: Record<string, string> = { active: '#059669', expired: '#d97706', revoked: '#dc2626', limit: '#7c3aed' };

export default function SharePage() {
  const api = useApi(), docs = useDocs(), { data, loading, error, reload } = useQuery<Share[]>('/share');
  const [create, setCreate] = useState(false);
  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast.success(ok); reload(); } catch (e: any) { toast.error(e.message); } };
  return (
    <>
      <PageHeader title="Share Center" sub="Temporary links - expiring, password-protected, download-limited" actions={<Button onClick={() => setCreate(true)}>🔗 New link</Button>} />
      {error ? <ErrorBox text={error} retry={reload} /> : loading && !data ? <Loading /> : !data?.length ? <Card><Empty icon="🔗" title="No share links" text="Send a file to someone without giving them access to your vault. You can make the link expire." action={<Button onClick={() => setCreate(true)}>Create a link</Button>} /></Card> : (
        <Card className="divide-y divide-slate-100">
          {data.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="text-2xl">{l.targetType === 'package' ? '📦' : '🔗'}</span>
              <div className="min-w-[180px] flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{l.label}</span><Badge color={COLOR[l.status]}>{l.status}</Badge>{l.hasPassword && <Badge>🔒 password</Badge>}</div>
                <div className="mt-0.5 text-xs text-slate-500">{l.expiresAt ? `Expires ${date(l.expiresAt)}` : 'Never expires'} · {l.downloads}{l.viewLimit ? `/${l.viewLimit}` : ''} downloads · {l.views} views</div>
              </div>
              <div className="flex gap-2">
                {l.status === 'active' && <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(l.link); toast.success('Link copied'); }}>📋 Copy</Button>}
                {l.status === 'active' && <Button size="sm" variant="secondary" onClick={() => act(() => api.post(`/share/${l.id}/revoke`), 'Link revoked')}>Revoke</Button>}
                <Button size="sm" variant="danger" onClick={() => act(() => api.del(`/share/${l.id}`), 'Link deleted')}>🗑️</Button>
              </div>
            </div>
          ))}
        </Card>
      )}
      {create && <ShareDialog target={{ docs: docs.data || [] }} onClose={() => { setCreate(false); reload(); }} />}
    </>
  );
}
