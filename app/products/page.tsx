'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit3, X, Eye, ChevronUp, ChevronDown, Filter, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shortDateTime } from '@/utils/format';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById, deleteProductImage } from '@/services/products';
import { getCategories } from '@/services/categories';
import type { Product, Category } from '@/types';
import { TextEditor } from '@/components/ui/text-editor';

type SortField = 'id' | 'name' | 'price' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export default function ProductsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    return_policy: '',
    category_id: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [query, page, minPrice, maxPrice, sortBy, sortOrder, categoryFilter]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const result = await getProducts({
        query: query || undefined,
        page,
        limit: 10,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        sort_by: sortBy,
        order: sortOrder,
        category_id: categoryFilter ? Number(categoryFilter) : undefined
      });
      setProducts(result.products);
      setTotalProducts(result.total);
    } catch (err) {
      console.error('Failed to load products', err);
      const message = err instanceof Error ? err.message : 'Unable to load products';
      setError(`Unable to load products. ${message}`);
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
    setFormData({ name: '', description: '', price: '', discount: '', return_policy: '', category_id: '' });
    setImages([]);
    setExistingImages([]);
    setRemovedImages([]);
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discount: product.discount != null ? String(product.discount) : '',
      return_policy: product.return_policy || '',
      category_id: String(product.category_id)
    });
    setExistingImages(product.images?.map(img => img.image_url) || []);
    setRemovedImages([]);
    setShowEditModal(true);
  }

  function openDeleteModal(product: Product) {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  }

  function openViewModal(product: Product) {
    router.push(`/products/${product.id}`);
  }

  function closeModals() {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingProduct(null);
    setDeletingProduct(null);
    setDeletingImage(null);
    resetForm();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...newFiles]);
      // Reset the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  }

  function handleImagePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          setImages(prevImages => [...prevImages, file]);
          toast.success('Image pasted successfully!');
        }
      }
    }
  }

  function removeNewImage(index: number) {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  }

  async function handleDeleteImage(url: string) {
    // Find image ID from the editing product's images array
    const image = editingProduct?.images.find(img => img.image_url === url);
    if (!image) {
      toast.error('Image not found');
      return;
    }

    setDeletingImage(image.id.toString());
    try {
      await deleteProductImage(image.id.toString());
      toast.success('Image deleted successfully');
      setExistingImages(existingImages.filter(img => img !== url));
    } catch (err) {
      console.error('Failed to delete image', err);
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      toast.error(message);
    } finally {
      setDeletingImage(null);
    }
  }

  async function handleCreateProduct() {
    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('price', formData.price);
      formDataObj.append('category_id', formData.category_id);
      images.forEach(img => formDataObj.append('images', img));
      
      console.log('Creating product with', images.length, 'images');
      console.log('FormData images:', formDataObj.getAll('images'));

      await createProduct(formDataObj);
      toast.success('Product created successfully!');
      closeModals();
      await loadProducts();
    } catch (err) {
      console.error('Failed to create product', err);
      const message = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateProduct() {
    if (!editingProduct || !formData.name.trim() || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('price', formData.price);
      formDataObj.append('discount', formData.discount);
      formDataObj.append('return_policy', formData.return_policy);
      formDataObj.append('discount', formData.discount);
      formDataObj.append('return_policy', formData.return_policy);
      formDataObj.append('category_id', formData.category_id);
      images.forEach(img => formDataObj.append('images', img));
      removedImages.forEach(url => formDataObj.append('removed_images', url));
      
      console.log('Updating product with', images.length, 'new images');
      console.log('FormData images:', formDataObj.getAll('images'));

      await updateProduct(editingProduct.id, formDataObj);
      toast.success('Product updated successfully!');
      closeModals();
      await loadProducts();
    } catch (err) {
      console.error('Failed to update product', err);
      const message = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!deletingProduct) return;

    setSubmitting(true);
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully!');
      closeModals();
      await loadProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  function clearFilters() {
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCategoryFilter('');
    setPage(1);
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product && product.name && product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  const hasActiveFilters = query || minPrice || maxPrice || categoryFilter !== '';

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-200/10 dark:from-white/95 dark:to-slate-50/95 xl:grid xl:grid-cols-[0.75fr_0.25fr] xl:items-center xl:justify-between">
            {/* Left Content */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-400 font-semibold">Products</p>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">Product management</h1>
              <p className="mt-2 text-sm text-slate-400">Create, update, and manage products with advanced filtering and sorting.</p>
            </div>

            {/* Stats Card */}
            <Card className="p-6 w-full">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Inventory</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                  <p className="text-sm text-slate-400">Total products</p>
                  <p className="mt-2 text-3xl font-bold text-white">{totalProducts}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                  <p className="text-sm text-slate-400">Categories</p>
                  <p className="mt-2 text-3xl font-bold text-white">{categories.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="overflow-hidden p-6">
            {/* Search and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                  placeholder="Search products by name or description..."
                  className="pl-11"
                />
              </div>
              <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-32"
              />
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-32"
              />

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                className="h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none dark:bg-slate-200/80 dark:text-slate-950"
              >
                <option value="">All categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortField); setPage(1); }}
                  className="h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none dark:bg-slate-200/80 dark:text-slate-950"
                >
                  <option value="created_at">Sort by: Date</option>
                  <option value="name">Sort by: Name</option>
                  <option value="price">Sort by: Price</option>
                </select>

                <button
                  onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/50 dark:bg-slate-200/80 dark:text-slate-950"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" className="h-8 text-xs" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Products Table */}
            <div className="mt-6 overflow-auto">
              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
                  <p className="font-semibold">Unable to load products</p>
                  <p className="mt-2 text-sm text-rose-100/80">{error}</p>
                </div>
              ) : (
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">#</th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('id')}><div className="flex items-center gap-2">ID<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('name')}><div className="flex items-center gap-2">Product<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('price')}><div className="flex items-center gap-2">Price<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold">Images</th>
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
                          <td className="h-14 px-5 py-4 bg-slate-900/50" />
                        </tr>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <tr className="bg-slate-900/50">
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                          No products found matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <tr key={product.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                          <td className="px-5 py-4 text-slate-300">{product.id}</td> 
                          <td className="px-5 py-4 max-w-[300px]">
                            <div>
                              <p className="font-medium text-white line-clamp-2">{product.name || 'Unnamed Product'}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-300">
                            <Badge variant="default">{product.category_name || 'Uncategorized'}</Badge>
                          </td>
                          <td className="px-5 py-4 font-semibold text-emerald-400">₹{product.price.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">{product.images?.length || 0}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={product.is_deleted ? 'danger' : 'success'}>
                              {product.is_deleted ? 'Deleted' : 'Active'}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 space-x-2">
                            <button
                              onClick={() => openViewModal(product)}
                              className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                            >
                              <Eye className="inline-block h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                            >
                              <Edit3 className="inline-block h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
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

            {/* Pagination */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
              <p>{filteredProducts.length} products shown</p>
              <div className="inline-flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">
                  Page {page} of {Math.ceil(totalProducts / 10)}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= Math.ceil(totalProducts / 10) || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Create/Edit Product Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white dark:text-slate-950">
                  {showEditModal ? 'Edit Product' : 'Create Product'}
                </h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Product Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Price (₹) *</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Discount (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Return Policy</label>
                    <Input
                      value={formData.return_policy}
                      onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                      placeholder="Short return policy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                  <TextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Enter product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none dark:bg-slate-200/80 dark:text-slate-950"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Images {showEditModal && '(leave empty to keep existing)'}
                  </label>
                  <div 
                    className="mt-2 flex flex-wrap gap-3 p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-violet-400 transition-colors"
                    onPaste={handleImagePaste}
                  >
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(url)}
                          disabled={deletingImage === editingProduct?.images.find(img => img.image_url === url)?.id.toString()}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingImage === editingProduct?.images.find(img => img.image_url === url)?.id.toString() ? (
                            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ))}
                    {images.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 cursor-pointer hover:border-violet-400 transition-colors">
                      <Plus className="h-6 w-6 text-slate-400" />
                      <span className="mt-1 text-xs text-slate-400">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">💡 Tip: You can also paste images (Ctrl+V / Cmd+V) from your clipboard</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={showEditModal ? handleUpdateProduct : handleCreateProduct} disabled={submitting}>
                    {submitting ? (showEditModal ? 'Updating...' : 'Creating...') : (showEditModal ? 'Update' : 'Create')}
                  </Button>
                  <Button variant="secondary" onClick={closeModals}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white dark:text-slate-950">Delete Product</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                  <p className="text-sm text-rose-200">
                    Are you sure you want to delete <span className="font-semibold text-white">{deletingProduct.name || 'this product'}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={handleDeleteProduct} disabled={submitting}>
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
