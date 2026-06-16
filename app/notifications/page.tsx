'use client';

import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle2, X, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { sendNotification } from '@/services/notifications';
import { getUsers } from '@/services/users';
import type { UserProfile } from '@/types';

const NOTIFICATION_TYPES = [
  { value: 'ORDER', label: 'Order', description: 'Order-related notifications' },
  { value: 'PRODUCT', label: 'Product', description: 'New product announcements' },
  { value: 'WISHLIST', label: 'Wishlist', description: 'Wishlist updates' },
  { value: 'OFFER', label: 'Offer', description: 'Promotional offers' },
] as const;

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // User selection states
  const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const isFormValid = title.trim() && body.trim() && notificationType && (recipientType === 'all' || selectedUserIds.length > 0);

  const selectedType = NOTIFICATION_TYPES.find(t => t.value === notificationType);

  // Load available users when modal opens
  useEffect(() => {
    if (showUserModal && availableUsers.length === 0) {
      loadAvailableUsers();
    }
  }, [showUserModal]);

  async function loadAvailableUsers() {
    setLoadingUsers(true);
    try {
      const users = await getUsers({ page: 1 });
      setAvailableUsers(users);
    } catch (err) {
      console.error('Failed to load users', err);
      const message = err instanceof Error ? err.message : 'Failed to load users';
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  }

  function handleUserToggle(userId: string) {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  function handleSelectAll() {
    if (selectedUserIds.length === availableUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(availableUsers.map(u => u.id));
    }
  }

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userIds = recipientType === 'selected' 
        ? selectedUserIds.map(id => Number(id))
        : undefined;

      const response = await sendNotification(
        title.trim(),
        body.trim(),
        notificationType,
        userIds
      );
      
      if (response.status) {
        const userCount = recipientType === 'selected' ? selectedUserIds.length : 'all';
        setSuccessMessage(`Notification sent successfully to ${userCount} user${recipientType === 'selected' && selectedUserIds.length !== 1 ? 's' : ''}!`);
        toast.success(response.message || 'Notification sent successfully');
        
        // Reset form
        setTitle('');
        setBody('');
        setNotificationType('');
        setSelectedUserIds([]);
        setRecipientType('all');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        toast.error(response.message || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Failed to send notification', err);
      const message = err instanceof Error ? err.message : 'Failed to send notification';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-100">Push Notifications</h1>
            <p className="text-slate-400">Send push notifications to your users with targeted or broadcast options</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/10 p-4 flex items-gap-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-400">{successMessage}</p>
              </div>
            </Card>
          )}

          {/* Main Form Card */}
          <Card className="border border-slate-700/50 bg-slate-900/30 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-slate-200">
                  Notification Title <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., New Product Added"
                  maxLength={100}
                  disabled={loading}
                />
                <p className="text-xs text-slate-400">{title.length}/100 characters</p>
              </div>

              {/* Body Field */}
              <div className="space-y-2">
                <label htmlFor="body" className="block text-sm font-semibold text-slate-200">
                  Notification Message <span className="text-rose-400">*</span>
                </label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g., Check out our latest gaming laptops with powerful specs and great discounts."
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-xs text-slate-400">{body.length}/500 characters</p>
              </div>

              {/* Notification Type Field */}
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-semibold text-slate-200">
                  Notification Type <span className="text-rose-400">*</span>
                </label>
                <select
                  id="type"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  disabled={loading}
                  className="w-full h-11 rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 outline-none transition-all duration-200 focus:border-sky-500/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-2 focus:ring-offset-slate-950 dark:border-slate-300/50 dark:bg-white/60 dark:text-slate-950 dark:focus:border-sky-500/50 dark:focus:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select notification type</option>
                  {NOTIFICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} — {type.description}
                    </option>
                  ))}
                </select>

                {/* Type Preview Badge */}
                {selectedType && (
                  <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-slate-950/50 border border-slate-700/30">
                    <Badge variant="outline">{selectedType.label}</Badge>
                    <span className="text-xs text-slate-400">{selectedType.description}</span>
                  </div>
                )}
              </div>

              {/* Recipient Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-200">
                  Send to <span className="text-rose-400">*</span>
                </label>
                
                {/* Radio Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-700/30 hover:border-slate-700/50 hover:bg-slate-950/50 transition cursor-pointer" onClick={() => setRecipientType('all')}>
                    <input 
                      type="radio" 
                      name="recipient" 
                      value="all" 
                      checked={recipientType === 'all'}
                      onChange={(e) => setRecipientType(e.target.value as 'all' | 'selected')}
                      className="w-4 h-4 cursor-pointer"
                      disabled={loading}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-100">All Users</p>
                      <p className="text-xs text-slate-400">Send to all users in the system</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-700/30 hover:border-slate-700/50 hover:bg-slate-950/50 transition cursor-pointer" onClick={() => setRecipientType('selected')}>
                    <input 
                      type="radio" 
                      name="recipient" 
                      value="selected" 
                      checked={recipientType === 'selected'}
                      onChange={(e) => setRecipientType(e.target.value as 'all' | 'selected')}
                      className="w-4 h-4 cursor-pointer"
                      disabled={loading}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-100">Selected Users</p>
                      <p className="text-xs text-slate-400">Choose specific users to send to</p>
                    </div>
                  </div>
                </div>

                {/* Selected Users Display */}
                {recipientType === 'selected' && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={() => setShowUserModal(true)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 h-11 bg-slate-800 hover:bg-slate-700"
                    >
                      <Users className="h-4 w-4" />
                      {selectedUserIds.length === 0 ? 'Select Users' : `${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} selected`}
                    </Button>

                    {selectedUserIds.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700/30">
                        <div className="flex flex-wrap gap-2">
                          {selectedUserIds.map(userId => {
                            const user = availableUsers.find(u => u.id === userId);
                            return (
                              <Badge key={userId} variant="outline" className="flex items-center gap-2">
                                <span className="text-xs">{user?.name || userId}</span>
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-rose-400"
                                  onClick={() => handleUserToggle(userId)}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <Card className="border border-slate-700/30 bg-slate-950/50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Before sending</p>
                  <p className="text-xs text-slate-400">Make sure the title and message are clear and relevant. {recipientType === 'all' ? 'This notification will be sent to all users in the system.' : 'This notification will only be sent to the selected users.'}</p>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full h-11 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Sending Notification...' : 'Send Notification'}
              </Button>
            </form>
          </Card>

          {/* Example Notifications */}
          <Card className="border border-slate-700/50 bg-slate-900/30 p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Example Notifications</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10">PRODUCT</Badge>
                  <span className="text-xs text-slate-400">Product Update</span>
                </div>
                <p className="font-medium text-slate-100 text-sm">New Product Added</p>
                <p className="text-xs text-slate-400">Check out our latest gaming laptops with powerful specs and great discounts.</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-500/10">OFFER</Badge>
                  <span className="text-xs text-slate-400">Special Offer</span>
                </div>
                <p className="font-medium text-slate-100 text-sm">Exclusive 50% Off Sale</p>
                <p className="text-xs text-slate-400">Limited time offer on selected items. Shop now before stock runs out!</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-500/10">ORDER</Badge>
                  <span className="text-xs text-slate-400">Order Status</span>
                </div>
                <p className="font-medium text-slate-100 text-sm">Your Order is On The Way</p>
                <p className="text-xs text-slate-400">Your package has been shipped. Track your delivery now.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* User Selection Modal */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border border-slate-700/50 max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Select Users</h2>
                  <p className="text-xs text-slate-400 mt-1">Choose one or more users to send notifications</p>
                </div>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Search */}
                <div className="sticky top-0 bg-slate-900/30 pb-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                </div>

                {/* Select All Option */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-700/30">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === availableUsers.length && availableUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">Select All</p>
                    <p className="text-xs text-slate-400">{availableUsers.length} total users</p>
                  </div>
                </div>

                {/* User List */}
                {loadingUsers ? (
                  <div className="text-center py-8 text-slate-400">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No users found</div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:border-slate-700/50 hover:bg-slate-950/80 transition cursor-pointer"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUserToggle(user.id);
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-700/30 bg-slate-900/50">
                <p className="text-sm text-slate-400">
                  {selectedUserIds.length} of {availableUsers.length} selected
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    Done
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