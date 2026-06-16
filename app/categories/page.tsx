'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit3, X, Eye, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shortDate } from '@/utils/format';
import { getCategories, createCategory, updateCategory, deleteCategory, type CreateCategoryPayload, type UpdateCategoryPayload } from '@/services/categories';
import type { Category } from '@/types';

export default function CategoriesPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  function handleSort(field: typeof sortBy) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  useEffect(() => {
    loadCategories();
  }, [query, page, sortBy, sortOrder]);

   async function loadCategories() {
     setLoading(true);
     setError('');
     try {
       console.debug('Loading categories', { query, page });
       const result = await getCategories({
         query: query || undefined,
         page,
         limit: 10,
         sort_by: sortBy,
         order: sortOrder
       });
       
       // If the requested page is beyond available pages, adjust it
       if (result.total_pages === 0 && page !== 1) {
         setPage(1);
         return;
       }
 
       if (result.page > result.total_pages && result.total_pages > 0) {
         setPage(result.total_pages);
         return;
       }
 
       setCategories(result.categories);
       setTotalCategories(result.total);
       setTotalPages(result.total_pages);
       setHasNextPage(result.is_next);
       setHasPrevPage(result.is_previous);
     } catch (err) {
       console.error('Failed to load categories', err);
       const message = err instanceof Error ? err.message : 'Unable to load categories';
       setError(`Unable to load categories. ${message}`);
     } finally {
       setLoading(false);
     }
   }

  async function handleCreateCategory() {
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      await createCategory({ name: formData.name.trim(), images: image || undefined });
      toast.success('Category created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '' });
      setImage(null);
      await loadCategories();
    } catch (err) {
      console.error('Failed to create category', err);
      const message = err instanceof Error ? err.message : 'Failed to create category';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateCategory() {
    if (!editingCategory || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      await updateCategory(editingCategory.id, { name: formData.name.trim(), images: image || undefined });
      toast.success('Category updated successfully!');
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      setImage(null);
      setExistingImage(null);
      await loadCategories();
    } catch (err) {
      console.error('Failed to update category', err);
      const message = err instanceof Error ? err.message : 'Failed to update category';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal(category: Category) {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return;

    setSubmitting(true);
    try {
      await deleteCategory(deletingCategory.id);
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setExistingImage(category.images && category.images.length > 0 ? category.images[0].image_url : null);
    setImage(null);
    setShowEditModal(true);
  }

  function closeModals() {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingCategory(null);
    setDeletingCategory(null);
    setFormData({ name: '' });
    setImage(null);
    setExistingImage(null);
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => 
      category && category.name && category.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-200/10 dark:from-white/95 dark:to-slate-50/95 xl:grid xl:grid-cols-[0.75fr_0.25fr] xl:items-center xl:justify-between">
  
  {/* Left Content */}
  <div>
    <div className="flex items-center gap-3 mb-2">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>

      <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">
        Categories
      </p>
    </div>

    <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">
      Category management
    </h1>

    <p className="mt-2 text-sm text-slate-400">
      Create, update, and manage product categories with search and filters.
    </p>
  </div>

  {/* Inventory Card */}
  <Card className="p-6 w-full">
    <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">
      Inventory
    </p>

    <div className="mt-6 grid gap-4">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
        <p className="text-sm text-slate-400">Total categories</p>

        <p className="mt-2 text-3xl font-bold text-white">
          {totalCategories}
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
        <p className="text-sm text-slate-400">Products covered</p>

        <p className="mt-2 text-3xl font-bold text-white">
          {categories.reduce(
            (sum, item) => sum + (item.products_count || 0),
            0
          )}
        </p>
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
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search categories"
                    className="pl-11"
                  />
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add category
            </Button>
              </div>
            <div className="mt-6 overflow-auto">
              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
                  <p className="font-semibold">Unable to load categories</p>
                  <p className="mt-2 text-sm text-rose-100/80">{error}</p>
                </div>
              ) : (
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">#</th>
                      <th className="px-5 py-4 font-semibold">Image</th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('name')}><div className="flex items-center gap-2">Category<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold">Products</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
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
                        </tr>
                      ))
                    ) : filteredCategories.length === 0 ? (
                      <tr className="bg-slate-900/50">
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                          No categories found matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr key={category.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                          <td className="px-5 py-4">
                            {category.images && category.images.length > 0 ? (
                              <img
                                src={category.images[0].image_url}
                                alt={category.name}
                                className="h-12 w-12 rounded-lg object-cover border border-white/10"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-slate-500" />
                              </div>
                            )}
                          </td>
                           <td className="px-5 py-4">
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-white">{category.name || 'Unnamed Category'}</span>

                             </div>
                           </td>
                          <td className="px-5 py-4 text-slate-400">{category.products_count}</td>
                          <td className="px-5 py-4"><Badge variant="success">active</Badge></td>
                          <td className="px-5 py-4 space-x-2">
                            <button
                                 onClick={() => router.push(`/categories/${category.id}`)}
                                 className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                               >
                                 <Eye className="inline-block h-3.5 w-3.5" />
                               </button>
                            <button
                              onClick={() => openEditModal(category)}
                              className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                            >
                              <Edit3 className="inline-block h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(category)}
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
              <p>{filteredCategories.length} categories shown</p>
              <div className="inline-flex items-center gap-2">
                <Button variant="secondary" disabled={!hasPrevPage || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  Previous
                </Button>
                <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">Page {page} of {totalPages}</span>
                <Button variant="secondary" disabled={!hasNextPage || loading} onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white dark:text-slate-950">Create Category</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Enter category name"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category Image</label>
                  <div className="mt-2 flex flex-wrap gap-3 p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-emerald-400 transition-colors">
                    {image ? (
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 cursor-pointer hover:border-emerald-400 transition-colors">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="mt-1 text-xs text-slate-400">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && setImage(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreateCategory} disabled={submitting || !formData.name.trim()}>
                    {submitting ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="secondary" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white dark:text-slate-950">Edit Category</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Enter category name"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category Image</label>
                  <div className="mt-2 flex flex-wrap gap-3 p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-emerald-400 transition-colors">
                    {existingImage && !image ? (
                      <div className="relative group">
                        <img
                          src={existingImage}
                          alt="Current"
                          className="h-20 w-20 object-cover rounded-lg border border-white/10"
                        />
                      </div>
                    ) : null}
                    {image ? (
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 cursor-pointer hover:border-emerald-400 transition-colors">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="mt-1 text-xs text-slate-400">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && setImage(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleUpdateCategory} disabled={submitting || !formData.name.trim()}>
                    {submitting ? 'Updating...' : 'Update'}
                  </Button>
                  <Button variant="secondary" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Category Modal */}
        {showDeleteModal && deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white dark:text-slate-950">Delete Category</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                  <p className="text-sm text-rose-200">
                    Are you sure you want to delete <span className="font-semibold text-white">{deletingCategory.name || 'this category'}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={handleDeleteCategory} disabled={submitting}>
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
