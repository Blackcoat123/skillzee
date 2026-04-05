/**
 * Booking Page - Book a skill session
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { skillService, bookingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';
import type { Skill } from '../services/api';

export const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const skillId = searchParams.get('skillId');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [learnerNotes, setLearnerNotes] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    if (skillId) {
      loadSkill();
    }
  }, [skillId, user]);

  const loadSkill = async () => {
    if (!skillId) return;
    setLoading(true);
    try {
      const data = await skillService.getSkillById(skillId);
      setSkill(data);
    } catch (error) {
      console.error('Error loading skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !user) return;

    setSubmitting(true);
    setError('');
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const { error } = await bookingService.createBooking({
        skill_id: skill.id,
        learner_id: user.id,
        trainer_id: skill.trainer_id,
        scheduled_date: scheduledDateTime,
        duration: skill.duration,
        price: skill.price,
        learner_notes: learnerNotes,
      });

      if (!error) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(error.message || 'Could not create booking.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Could not reach the booking service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Skill not found</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your session has been booked successfully. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  const platformCommission = (skill.price * env.platformCommission) / 100;
  const trainerPayout = skill.price - platformCommission;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Book Your Session
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Session Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes / Learning Goals (Optional)
                </label>
                <textarea
                  value={learnerNotes}
                  onChange={(e) => setLearnerNotes(e.target.value)}
                  rows={4}
                  placeholder="Tell the trainer what you want to learn or any specific topics you'd like to cover..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {skill.title}
              </h2>

              <div className="flex items-center space-x-3 mb-4">
                {skill.trainer?.profile_image ? (
                  <img
                    src={skill.trainer.profile_image}
                    alt={skill.trainer.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {skill.trainer?.full_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {skill.trainer?.full_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {skill.trainer?.college}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {skill.duration} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mode</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {skill.delivery_mode}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Session Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{skill.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Platform Commission ({env.platformCommission}%)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{platformCommission.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Trainer Payout</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{trainerPayout.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{skill.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
