/**
 * Profile Page - View and edit user profile
 */

import React, { useMemo, useState } from 'react';
import { Mail, MessageCircle, Save, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { interestOptions } from '../data/interests';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    college: user?.college || '',
    phone_number: user?.phone_number || '',
    profile_image: user?.profile_image || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
  });

  const emailLink = useMemo(() => {
    if (!user?.email) return '#';
    const subject = encodeURIComponent('Hello from Skillzee');
    const body = encodeURIComponent(
      `Hi ${user.full_name},\n\nI am contacting you through Skillzee.\n\nThanks`
    );
    return `mailto:${user.email}?subject=${subject}&body=${body}`;
  }, [user]);

  const whatsappLink = useMemo(() => {
    if (!user?.phone_number) return '';
    const phone = user.phone_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${user.full_name}, I am reaching out through Skillzee.`);
    return `https://wa.me/${phone}?text=${message}`;
  }, [user]);

  const toggleInterest = (interest: string) => {
    setFormData((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(formData);
    setEditing(false);
    setStatusMessage('Profile updated successfully.');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 dark:bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-[linear-gradient(135deg,_#1d4ed8_0%,_#0f172a_100%)] px-8 py-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.full_name}
                    className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white/20"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15">
                    <span className="text-3xl font-bold">{user.full_name.charAt(0)}</span>
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold">{user.full_name}</h1>
                  <p className="mt-1 text-sm text-blue-100">{user.email}</p>
                  <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStatusMessage('');
                  setEditing(!editing);
                }}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                {editing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 px-8 py-6 dark:border-slate-800 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Points</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.points}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Rs {user.total_earnings}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Rs {user.total_spent}</p>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      College / Organization
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.profile_image}
                      onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    placeholder="Tell learners and trainers a little about yourself."
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Interests
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Select multiple
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {interestOptions.map((interest) => {
                      const selected = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <UserIcon className="mt-0.5 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Education
                    </p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {user.college || 'No college or organization added yet.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <Sparkles className="mt-0.5 h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Interests
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(user.interests || []).length > 0 ? (
                        user.interests?.map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          No interests selected yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      About
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      {user.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Options</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Keep your phone and email updated so learners and providers can reach you easily.
              </p>

              <div className="mt-5 space-y-3">
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Add a phone number to enable WhatsApp chat.
                  </div>
                )}

                <a
                  href={emailLink}
                  className="flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone_number || 'Not added yet'}</p>
                <p>Role: {user.role}</p>
                <p>Ready for recommendations: {(user.interests || []).length > 0 ? 'Yes' : 'Add interests'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
