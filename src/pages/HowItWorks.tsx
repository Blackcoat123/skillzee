/**
 * How It Works Page - Platform documentation and guide
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Calendar, Video, Star, DollarSign, Award, MessageSquare } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How Skillzee Works
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Learn how to make the most of our peer-to-peer learning marketplace
          </p>
        </div>
      </section>

      {/* Learner Journey */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            For Learners
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                1. Sign Up
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create your account and tell us what you want to learn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2. Browse Skills
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explore sessions from talented student trainers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                3. Book Session
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose your preferred date and time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                4. Learn & Grow
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Attend the session and gain new skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trainer Journey */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            For Trainers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                1. Create Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Set up your trainer profile and credentials
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2. List Your Skill
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create skill listings with pricing and details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                3. Get Bookings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Receive and confirm booking requests
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                4. Earn Money
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Conduct sessions and track your earnings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Platform Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All payments are processed securely. Platform takes 15% commission, ensuring fair earnings for trainers.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                In-App Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Communicate directly with trainers before and after sessions. Stay connected and clarify doubts.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Reviews & Ratings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rate and review your sessions. Help other learners make informed decisions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Certificates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Download certificates after completing sessions. Build your learning portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Simple Help Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                How to Book
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                Open a class, choose your preferred date and time, and confirm the booking. After that,
                use the dashboard to track status, chat, and download your certificate after completion.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                How to Teach
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                Publish a class from the provider dashboard with title, description, price, and category.
                Student applications and earnings will appear in your dashboard automatically.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                How to Contact Users
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-6">
                Use in-app chat first, then WhatsApp or email if needed. The profile and dashboard keep
                phone numbers and email shortcuts easy to access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students learning and earning on Skillzee
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth?mode=signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/explore"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-blue-800 transition-colors"
            >
              Explore Skills
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
