/**
 * Create Skill Page - Trainers can publish new skill listings
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Sparkles } from 'lucide-react';
import { categoryService, skillService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../services/api';

export const CreateSkill: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    tags: '',
    price: '',
    duration: '60',
    delivery_mode: 'online' as 'online' | 'offline' | 'both',
    session_format: 'google-meet' as 'google-meet' | 'zoom' | 'in-app' | 'offline',
    location: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.role !== 'trainer' && user.role !== 'both') {
      navigate('/dashboard');
      return;
    }

    loadCategories();
  }, [user, navigate]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === formData.category_id),
    [categories, formData.category_id]
  );

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (loadError) {
      console.error('Error loading categories:', loadError);
      setError('Could not load categories right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!formData.title.trim() || !formData.description.trim() || !formData.category_id || !formData.price.trim()) {
      setError('Please complete the title, description, category, and pricing fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      trainer_id: user.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id || null,
      tags: tags.length > 0 ? tags : null,
      price: Number(formData.price),
      duration: Number(formData.duration),
      delivery_mode: formData.delivery_mode,
      session_format:
        formData.delivery_mode === 'offline' ? 'offline' : formData.session_format,
      location:
        formData.delivery_mode === 'offline' || formData.delivery_mode === 'both'
          ? formData.location.trim() || null
          : null,
      availability: null,
    };

    try {
      const { data, error: createError } = await skillService.createSkill(payload);

      if (createError) {
        setError(createError.message || 'Could not publish your class.');
        return;
      }

      setSuccessMessage('Your class is live and will appear in your provider dashboard immediately.');

      if (data?.id) {
        setTimeout(() => navigate('/dashboard'), 700);
        return;
      }

      navigate('/dashboard');
    } catch (submitError: any) {
      setError(submitError.message || 'Could not publish your class.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
              Provider Studio
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Publish a New Class</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Add a title, clear description, price, and skill category so learners can discover
              your class quickly.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-slate-600 dark:text-slate-300">Loading form...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder="Example: React Fundamentals for Beginners"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder="Explain what learners will cover, who this class is for, and what outcome they should expect."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Category / Skill
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    placeholder="react, frontend, portfolio"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Pricing
                  </label>
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    placeholder="499"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Duration
                  </label>
                  <input
                    required
                    min="15"
                    step="15"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Delivery Mode
                  </label>
                  <select
                    value={formData.delivery_mode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delivery_mode: e.target.value as 'online' | 'offline' | 'both',
                        session_format:
                          e.target.value === 'offline' ? 'offline' : formData.session_format,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Session Format
                  </label>
                  <select
                    value={formData.delivery_mode === 'offline' ? 'offline' : formData.session_format}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        session_format: e.target.value as 'google-meet' | 'zoom' | 'in-app' | 'offline',
                      })
                    }
                    disabled={formData.delivery_mode === 'offline'}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  >
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="in-app">In App Chat</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              {(formData.delivery_mode === 'offline' || formData.delivery_mode === 'both') && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                    placeholder="Campus lab, studio, community space, or city area"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="mr-2 h-5 w-5" />
                {submitting ? 'Publishing...' : 'Publish Class'}
              </button>
            </form>
          )}
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl dark:border-slate-800">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
            <Sparkles className="mr-2 h-4 w-4" />
            Publishing Tips
          </div>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Category</p>
              <p className="mt-2">
                {selectedCategory
                  ? `${selectedCategory.name} helps learners discover this class faster.`
                  : 'Choose the category that best matches the outcome of your class.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Recommendation friendly</p>
              <p className="mt-2">
                Titles, descriptions, and tags now influence learner recommendations. Use clear
                wording for the exact skill you teach.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Dashboard visibility</p>
              <p className="mt-2">
                New classes are pulled into the provider dashboard as soon as they are created, so
                you can track performance and student interest right away.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
