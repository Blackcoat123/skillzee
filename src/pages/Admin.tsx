/**
 * Admin Page - Platform overview and stats
 */

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { adminService } from '../services/api';

export const Admin: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Users</span>
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {overview?.total_users || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {overview?.total_bookings || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Gross Revenue</span>
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{overview?.gross_revenue?.toFixed(0) || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Platform Revenue</span>
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{overview?.platform_revenue?.toFixed(0) || 0}
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Performing Skills
              </h2>

              {overview?.top_skills && overview.top_skills.length > 0 ? (
                <div className="space-y-4">
                  {overview.top_skills.map((skill: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {skill.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {skill.bookings} bookings
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{skill.revenue?.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
