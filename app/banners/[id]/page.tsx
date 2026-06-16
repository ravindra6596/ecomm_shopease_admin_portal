'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Trash2, Image as ImageIcon, Tag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { shortDateTime } from '@/utils/format';
import { getBannerById, deleteBanner } from '@/services/banners';
import type { Banner } from '@/types';

export default function BannerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bannerId = params.id as string;

  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (bannerId) loadBanner();
  }, [bannerId]);

  async function loadBanner() {
    setLoading(true);
    setError('');
    try {
      const result = await getBannerById(bannerId);
      setBanner(result);
    } catch (err) {
      console.error('Failed to load banner', err);
      const message = err instanceof Error ? err.message : 'Unable to load banner';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!banner) return;
    setDeleting(true);
    try {
      await deleteBanner(banner.id);
      toast.success('Banner deleted successfully!');
      router.push('/banners');
    } catch (err) {
      console.error('Failed to delete banner', err);
      const message = err instanceof Error ? err.message : 'Failed to delete banner';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <Skeleton className="aspect-square rounded-lg mb-4" />
              </Card>
              <Card className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </Card>
            </div>
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  if (error || !banner) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
            <Card className="p-12 text-center">
              <div className="text-red-400 mb-4">
                <XCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Banner Not Found</h3>
              <p className="text-slate-400 mb-6">{error || 'The banner you are looking for does not exist.'}</p>
              <Button onClick={() => router.push('/banners')}>Back to Banners</Button>
            </Card>
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Banners
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{banner.title}</h1>
                <p className="text-sm text-slate-400">View banner details and update settings.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => router.push(`/banners/${banner.id}/edit`)}>
                <Edit3 className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Banner Preview</h3>
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider text-slate-400 mb-1">Banner</p>
                  <h2 className="text-2xl font-bold text-white">Details</h2>
                </div>
                <Badge variant={banner.is_active ? 'success' : 'default'}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {banner.description ? (
                <div className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: banner.description }} />
              ) : (
                <p className="text-slate-300">No description provided.</p>
              )}

              <div className="grid gap-3 rounded-2xl bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> Category</span>
                  <span>{banner.category_name || 'Uncategorized'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image URL</span>
                  <a href={banner.image_url} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">View image</a>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Created</span>
                  <span>{shortDateTime(banner.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Updated</span>
                  <span>{shortDateTime(banner.updated_at)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
