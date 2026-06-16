'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TextEditor } from '@/components/ui/text-editor';
import { Button } from '@/components/ui/button';
import { getBannerById, updateBanner } from '@/services/banners';
import { getCategories } from '@/services/categories';
import type { Banner, Category } from '@/types';

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const bannerId = params.id as string;

  const [banner, setBanner] = useState<Banner | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    is_active: 'true'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (bannerId) {
      loadBanner();
      loadCategories();
    }
  }, [bannerId]);

  async function loadBanner() {
    setLoading(true);
    setError('');
    try {
      const result = await getBannerById(bannerId);
      setBanner(result);
      setFormData({
        title: result.title,
        description: result.description,
        category_id: String(result.category_id),
        is_active: String(result.is_active)
      });
    } catch (err) {
      console.error('Failed to load banner', err);
      const message = err instanceof Error ? err.message : 'Unable to load banner';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const result = await getCategories({ page: 1, limit: 100 });
      setCategories(result.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImageFile(file);
    }
    event.target.value = '';
  }

  function handleImagePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          toast.success('Image pasted successfully!');
          break;
        }
      }
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();

    if (!banner) return;
    if (!formData.title.trim() || !formData.category_id) {
      toast.error('Please fill in title and category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category_id', formData.category_id);
      payload.append('is_active', formData.is_active);
      if (imageFile) payload.append('image', imageFile);

      await updateBanner(banner.id, payload);
      toast.success('Banner updated successfully!');
      router.push(`/banners/${banner.id}`);
    } catch (err) {
      console.error('Failed to update banner', err);
      const message = err instanceof Error ? err.message : 'Failed to update banner';
      toast.error(message);
    } finally {
      setSubmitting(false);
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
            <Card className="p-6 space-y-4">
              <div className="h-10 w-48 rounded-full bg-slate-800" />
              <div className="h-64 rounded-2xl bg-slate-800" />
              <div className="h-12 rounded-2xl bg-slate-800" />
            </Card>
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
              <p className="text-red-400 mb-4">Unable to load banner</p>
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
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Edit banner</h1>
                <p className="text-sm text-slate-400">Update banner metadata and image.</p>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Banner title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                    className="w-full h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-sky-400 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                <TextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Banner description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-sky-400 focus:outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Banner Image</label>
                <div
                  className="mt-2 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/80 p-4 text-slate-400 hover:border-sky-400 transition-colors"
                  onPaste={handleImagePaste}
                >
                  <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 p-6 text-center">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="Banner preview" className="h-36 w-36 max-w-sm object-cover rounded-lg" />
                    ) : banner.image_url ? (
                      <img src={banner.image_url} alt="Current banner" className="h-36 w-36 max-w-sm object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-slate-300">Paste or select a new image to replace the current banner.</p>
                      </div>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors">
                    Choose image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save changes'}
                </Button>
                <Button variant="secondary" onClick={() => router.push(`/banners/${banner.id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
