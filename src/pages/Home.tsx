/**
 * Home Page - Landing Page
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Award, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { skillService } from '../services/api';
import type { Skill, User } from '../services/api';

export const Home: React.FC = () => {
  const [trendingSkills, setTrendingSkills] = useState<Skill[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trending, leaders] = await Promise.all([
        skillService.getTrendingSkills(),
        skillService.getLeaderboard(),
      ]);
      setTrendingSkills(trending);
      setLeaderboard(leaders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Learn From <span className="text-blue-600 dark:text-blue-400">Student Experts</span>
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Connect with talented student trainers. Book affordable sessions. Build real skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
              >
                Explore Skills <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                Start Teaching
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">200+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Skills Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">4.8/5</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Skillzee?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Affordable Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from student peers at prices that fit your budget. No expensive courses required.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Earn While Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share your skills and earn money. Build your reputation and grow your income.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Trusted Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Reviews, ratings, and badges ensure you're learning from the best student trainers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Skills */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Trending Skills
            </h2>
            <Link
              to="/explore"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSkills.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                      {skill.title}
                    </h3>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-sm font-medium ml-2">
                      ₹{skill.price}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {skill.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {skill.trainer?.profile_image ? (
                        <img
                          src={skill.trainer.profile_image}
                          alt={skill.trainer.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {skill.trainer?.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {skill.trainer?.full_name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                        {skill.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Top Trainers
          </h2>
          <div className="space-y-4">
            {leaderboard.map((trainer, index) => (
              <div
                key={trainer.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                  {trainer.profile_image ? (
                    <img
                      src={trainer.profile_image}
                      alt={trainer.full_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {trainer.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {trainer.full_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trainer.college}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {trainer.points}
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students learning and earning on Skillzee
          </p>
          <Link
            to="/auth?mode=signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};
