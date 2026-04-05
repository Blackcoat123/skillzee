/**
 * Skill Detail Page - View skill details, reviews, and book
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Video, MessageCircle, Calendar, Mail } from 'lucide-react';
import { skillService, getReviewsForSkill } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Skill, Review } from '../services/api';

export const SkillDetail: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (skillId) {
      loadSkillDetails();
    }
  }, [skillId]);

  const loadSkillDetails = async () => {
    if (!skillId) return;
    setLoading(true);
    try {
      const [skillData, reviewsData] = await Promise.all([
        skillService.getSkillById(skillId),
        getReviewsForSkill(skillId),
      ]);
      setSkill(skillData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    navigate(`/booking?skillId=${skillId}`);
  };

  const handleContactTrainer = () => {
    if (!skill?.trainer) return;

    const phone = skill.trainer.phone_number?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${skill.trainer.full_name}, I am interested in your class "${skill.title}" on Skillzee.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const trainerEmailLink = skill?.trainer?.email
    ? `mailto:${skill.trainer.email}?subject=${encodeURIComponent(`Skillzee: ${skill.title}`)}&body=${encodeURIComponent(`Hi ${skill.trainer.full_name},\n\nI am interested in your class "${skill.title}".\n\nThanks`)}` 
    : '#';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {skill.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 mr-2" />
                  {skill.duration} minutes
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  {skill.delivery_mode === 'online' ? (
                    <Video className="w-5 h-5 mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  {skill.delivery_mode.charAt(0).toUpperCase() + skill.delivery_mode.slice(1)}
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold text-gray-900 dark:text-white mr-1">
                    {skill.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({skill.total_reviews} reviews)
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {skill.total_bookings} bookings
                </div>
              </div>

              {skill.tags && skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About this Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {skill.description}
              </p>
            </div>

            {/* Trainer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Meet Your Trainer
              </h2>
              <div className="flex items-start space-x-4">
                {skill.trainer?.profile_image ? (
                  <img
                    src={skill.trainer.profile_image}
                    alt={skill.trainer.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {skill.trainer?.full_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {skill.trainer?.full_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {skill.trainer?.college}
                  </p>
                  {skill.trainer?.bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {skill.trainer.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {skill.trainer?.phone_number && (
                  <button
                    onClick={handleContactTrainer}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                )}
                {skill.trainer?.email && (
                  <a
                    href={trainerEmailLink}
                    className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex items-start space-x-3">
                        {review.learner?.profile_image ? (
                          <img
                            src={review.learner.profile_image}
                            alt={review.learner.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {review.learner?.full_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {review.learner?.full_name}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ₹{skill.price}
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mb-3 flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </button>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Platform fee: ₹{((skill.price * 15) / 100).toFixed(2)} (15%)
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Session Format</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {skill.session_format || 'To be decided'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {skill.duration} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Mode</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {skill.delivery_mode}
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
