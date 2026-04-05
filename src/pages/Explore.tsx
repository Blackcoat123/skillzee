/**
 * Explore Page - Search and Browse Skills
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin, Video } from 'lucide-react';
import { skillService, categoryService } from '../services/api';
import type { Skill, Category } from '../services/api';

export const Explore: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  useEffect(() => {
    loadCategories();
    loadSkills();
  }, []);

  useEffect(() => {
    loadSkills();
  }, [searchQuery, selectedCategory, selectedMode]);

  const loadCategories = async () => {
    const data = await categoryService.getCategories();
    setCategories(data);
  };

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getSkills({
        search: searchQuery,
        category: selectedCategory,
        mode: selectedMode,
      });
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Skills
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing learning opportunities from talented student trainers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading skills...</div>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">No skills found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600 dark:text-gray-400">
              Found {skills.length} skill{skills.length !== 1 ? 's' : ''}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {skill.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {skill.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {skill.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        {skill.delivery_mode === 'online' ? (
                          <Video className="w-4 h-4 mr-2" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-2" />
                        )}
                        {skill.delivery_mode.charAt(0).toUpperCase() + skill.delivery_mode.slice(1)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {skill.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{skill.price}
                        </span>
                      </div>
                    </div>

                    {skill.tags && skill.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {skill.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
