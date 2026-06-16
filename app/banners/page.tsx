'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit3, Eye, Filter, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TextEditor } from '@/components/ui/text-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBanners, createBanner, deleteBanner } from '@/services/banners';
import { getCategories } from '@/services/categories';
import type { Banner, Category } from '@/types';
import { shortDate } from '@/utils/format';

export default function BannersPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalBanners, setTotalBanners] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    is_active: 'true'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadBanners();
    loadCategories();
  }, [query, page]);

  async function loadBanners() {
    setLoading(true);
    setError('');

    try {
      const result = await getBanners({
        query: query || undefined,
        page,
        limit: 10
      });
      setBanners(result.banners);
      setTotalBanners(result.total || result.banners.length);
    } catch (err) {
      console.error('Failed to load banners', err);
      const message = err instanceof Error ? err.message : 'Unable to load banners';
      setError(message);
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

  function resetForm() {
    setFormData({ title: '', description: '', category_id: '', is_active: 'true' });
    setImageFile(null);
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  function closeModals() {
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setDeletingBanner(null);
    setImageFile(null);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
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

  async function handleCreateBanner() {
    if (!formData.title.trim() || !formData.category_id || !imageFile) {
      toast.error('Title, category and image are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category_id', formData.category_id);
      payload.append('is_active', formData.is_active);
      payload.append('image', imageFile);

      await createBanner(payload);
      toast.success('Banner created successfully!');
      closeModals();
      await loadBanners();
    } catch (err) {
      console.error('Failed to create banner', err);
      const message = err instanceof Error ? err.message : 'Failed to create banner';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBanner() {
    if (!deletingBanner) return;

    setSubmitting(true);
    try {
      await deleteBanner(deletingBanner.id);
      toast.success('Banner deleted successfully!');
      closeModals();
      await loadBanners();
    } catch (err) {
      console.error('Failed to delete banner', err);
      const message = err instanceof Error ? err.message : 'Failed to delete banner';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      banner.title.toLowerCase().includes(query.toLowerCase()) ||
      banner.description.toLowerCase().includes(query.toLowerCase()) ||
      banner.category_name.toLowerCase().includes(query.toLowerCase())
    );
  }, [banners, query]);

  const hasBanners = filteredBanners.length > 0;

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl xl:grid xl:grid-cols-[0.75fr_0.25fr] xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400 font-semibold">Banners</p>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-white">Banner management</h1>
              <p className="mt-2 text-sm text-slate-400">Create, update and manage homepage banners for categories and promotions.</p>
            </div>

            <Card className="p-6 w-full">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Catalog overview</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                  <p className="text-sm text-slate-400">Total banners</p>
                  <p className="mt-2 text-3xl font-bold text-white">{totalBanners}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                  <p className="text-sm text-slate-400">Categories</p>
                  <p className="mt-2 text-3xl font-bold text-white">{categories.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                  placeholder="Search banners by title, description or category..."
                  className="pl-11"
                />
              </div>

              <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add banner
              </Button>
            </div>

            <div className="mt-6 overflow-auto">
              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
                  <p className="font-semibold">Unable to load banners</p>
                  <p className="mt-2 text-sm text-rose-100/80">{error}</p>
                </div>
              ) : (
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">#</th>
                      <th className="px-5 py-4 font-semibold">ID</th>
                      <th className="px-5 py-4 font-semibold">Title</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Publish Date</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse bg-slate-900/50">
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                        </tr>
                      ))
                    ) : !hasBanners ? (
                      <tr className="bg-slate-900/50">
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                          No banners found.
                        </td>
                      </tr>
                    ) : (
                      filteredBanners.map((banner, index) => (
                        <tr key={banner.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                          <td className="px-5 py-4 text-slate-300">{banner.id}</td>
                          <td className="px-5 py-4 max-w-[300px] text-white font-medium line-clamp-2">{banner.title || 'Untitled'}</td>
                          <td className="px-5 py-4 text-slate-300"><Badge variant="default">{banner.category_name || 'Uncategorized'}</Badge></td>
                          <td className="px-5 py-4">
                            <Badge variant={banner.is_active ? 'success' : 'danger'}>
                              {banner.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            {banner.created_at ? shortDate(banner.created_at) : 'N/A'}
                          </td>
                           
                          <td className="px-5 py-4 space-x-2">
                            <button
                              onClick={() => router.push(`/banners/${banner.id}`)}
                              className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                            >
                              <Eye className="inline-block h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => router.push(`/banners/${banner.id}/edit`)}
                              className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                            >
                              <Edit3 className="inline-block h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => { setDeletingBanner(banner); setShowDeleteModal(true); }}
                              className="inline-flex items-center justify-center rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            >
                              <Trash2 className="inline-block h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
              <p>{filteredBanners.length} banners shown</p>
              <div className="inline-flex items-center gap-2">
                <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  Previous
                </Button>
                <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">
                  Page {page} of {Math.max(1, Math.ceil(totalBanners / 10))}
                </span>
                <Button variant="secondary" disabled={page >= Math.ceil(totalBanners / 10) || loading} onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create Banner</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                  <TextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Banner description..."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-sky-400 focus:outline-none"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
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
                  <label className="block text-sm font-medium text-slate-200 mb-2">Banner Image *</label>
                  <div
                    className="mt-2 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/80 p-4 text-slate-400 hover:border-sky-400 transition-colors"
                    onPaste={handleImagePaste}
                  >
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 p-6 text-center">
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Banner preview"
                          className="h-36 w-36 max-w-sm object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <p className="text-sm text-slate-300">Drag, paste or choose an image file for this banner.</p>
                          <p className="text-xs text-slate-500">Only one image is supported.</p>
                        </div>
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors">
                      Choose image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateBanner} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create banner'}
                  </Button>
                  <Button variant="secondary" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {showDeleteModal && deletingBanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Delete Banner</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                  <p className="text-sm text-rose-200">
                    Are you sure you want to delete <span className="font-semibold text-white">{deletingBanner.title}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={handleDeleteBanner} disabled={submitting}>
                    {submitting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button variant="secondary" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </PageShell>
    </AuthGuard>
  );
}
