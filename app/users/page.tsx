'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Eye, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { shortDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import { getUsers } from '@/services/users';
import type { UserProfile } from '@/types';

const roleOptions = ['all', 'admin', 'manager', 'staff', 'customer', 'user'];

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'email' | 'role' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {

    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        console.debug('Loading users', { query, role, page, sortBy, sortOrder });
        const fetchedUsers = await getUsers({
          query,
          role: role === 'all' ? undefined : role,
          page,
          sort_by: sortBy,
          order: sortOrder
        });
        setUsers(fetchedUsers);
        setTotalPages(page);
      } catch (err) {
        console.error('Failed to load users', err);
        const message = err instanceof Error ? err.message : 'Unable to load users';
        setError(`Unable to load users. ${message}`);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [query, role, page, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase()) || user.role.toLowerCase().includes(query.toLowerCase());
      const matchesRole = role === 'all' || user.role === role;
      return matchesQuery && matchesRole;
    });
  }, [users, query, role]);

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-200/10 dark:from-white/95 dark:to-slate-50/95 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400 font-semibold">User management</p>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">Users listing</h1>
              <p className="mt-2 text-sm text-slate-400">Search, filter, and manage your store user base with one interface.</p>
            </div>
            <div className="grid gap-5  ">
              <Card className="p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Summary</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                    <p className="text-sm text-slate-400">Total users</p>
                    <p className="mt-2 text-3xl font-bold text-white">{filteredUsers.length}</p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-4">
                    <p className="text-sm text-slate-400">Active roles</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {new Set(filteredUsers.map((user) => user.role)).size}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>



          <Card className="overflow-hidden p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white dark:text-slate-950">Users table</h2>
                <p className="text-sm text-slate-400">Manage user profiles, update roles, and delete accounts securely.</p>
              </div>

            </div>
            <div className="mt-6 overflow-auto">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="pl-11" />
                </div>
                <div className="flex gap-3">
                  <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-300/50 dark:bg-white/60 dark:text-slate-950">
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>{option === 'all' ? 'All roles' : option}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
                  <p className="font-semibold">Unable to load users</p>
                  <p className="mt-2 text-sm text-rose-100/80">{error}</p>
                </div>
              ) : (

                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">#</th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('id')} ><div className="flex items-center gap-2">ID<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('name')}><div className="flex items-center gap-2">Name<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('email')}><div className="flex items-center gap-2">Email<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('role')}><div className="flex items-center gap-2">Role<ArrowUpDown className="h-4 w-4" /></div></th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('created_at')}><div className="flex items-center gap-2">Joined<ArrowUpDown className="h-4 w-4" /></div></th>
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
                    ) : filteredUsers.length === 0 ? (
                      <tr className="bg-slate-900/50">
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found matching the current filters.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                          <td className="px-5 py-4 text-slate-300">{user.id}</td>
                          <td className="px-5 py-4 font-medium text-white">{user.name}</td>
                          <td className="px-5 py-4 text-slate-400">{user.email}</td>
                          <td className="px-5 py-4"><Badge variant={user.role === 'admin' ? 'success' : user.role === 'manager' ? 'primary' : 'muted'}>{user.role}</Badge></td>
                          <td className="px-5 py-4 text-slate-400">{shortDate(user.createdAt)}</td>
                          <td className="px-5 py-4 space-x-2">
                            <Link href={`${ROUTES.users}/${user.id}`} className="inline-flex items-center rounded-full bg-slate-800/50 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700/50 border border-white/5 transition-colors"><Eye className="h-3.5 w-3.5" /></Link>
                            <button className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"><Edit3 className="inline-block h-3.5 w-3.5" /></button>
                            <button className="inline-flex items-center justify-center rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"><Trash2 className="inline-block h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
              <p>{filteredUsers.length} users shown</p>
              <div className="inline-flex items-center gap-2">
                <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">Page {page}</span>
                <Button variant="secondary" disabled={page >= totalPages ||loading} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
