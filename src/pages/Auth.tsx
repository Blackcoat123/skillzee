/**
 * Auth Page - Login and Sign Up
 */

import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { interestOptions } from '../data/interests';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [isSignUp, setIsSignUp] = useState(queryMode === 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'learner' | 'trainer' | 'both'>('learner');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const heading = useMemo(
    () => (isSignUp ? 'Create your account' : 'Sign in to Skillzee'),
    [isSignUp]
  );

  const subHeading = useMemo(
    () =>
      isSignUp
        ? 'Join as a learner, trainer, or both and personalize your dashboard from day one.'
        : 'Use your registered email and password to continue.',
    [isSignUp]
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const validate = () => {
    if (isSignUp && !fullName.trim()) {
      return 'Please enter your full name.';
    }

    if (!email.trim() || !password.trim()) {
      return 'Please fill in all required fields.';
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (isSignUp && password.trim().length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError, requiresEmailConfirmation } = await signUp(email, password, {
          email,
          full_name: fullName.trim(),
          college: college.trim(),
          phone_number: phoneNumber.trim(),
          role,
          interests: selectedInterests,
        });

        if (signUpError) {
          setError(signUpError.message || 'Account creation failed.');
          return;
        }

        if (requiresEmailConfirmation) {
          setSuccessMessage(
            'Your account has been created. Please verify your email, then sign in.'
          );
          setIsSignUp(false);
          setPassword('');
          return;
        }

        navigate('/dashboard');
        return;
      }

      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message || 'Sign in failed.');
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#111827_0%,_#0f172a_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/80 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                Skillzee
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{heading}</h1>
            </div>
          </div>

          <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {subHeading}
          </p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="college" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      College / Organization
                    </label>
                    <input
                      id="college"
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                      placeholder="Where are you learning from?"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      I want to use Skillzee as
                    </span>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { value: 'learner', label: 'Learner' },
                        { value: 'trainer', label: 'Provider' },
                        { value: 'both', label: 'Both' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRole(option.value as typeof role)}
                          className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                            role === option.value
                              ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Interests
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Choose multiple to improve recommendations
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {interestOptions.map((interest) => {
                      const selected = selectedInterests.includes(interest);
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
              </>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/30"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            <button
              onClick={() => {
                resetMessages();
                setIsSignUp(!isSignUp);
              }}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-300"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl dark:border-slate-800 md:p-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-blue-200">
            <ShieldCheck className="h-4 w-4" />
            Better sign in experience
          </div>

          <h2 className="mb-4 text-3xl font-bold leading-tight">
            Clear dashboards for learning, teaching, and growth.
          </h2>
          <p className="mb-8 text-sm leading-7 text-slate-300">
            Your account setup now feeds recommendations, learner history, provider analytics,
            contact shortcuts, and cleaner feedback across the app.
          </p>

          <div className="space-y-4">
            {[
              'Specific auth errors for missing fields, wrong password, duplicate email, and server issues',
              'Multi-select interests that shape the recommendation engine',
              'Separate learner and provider experiences after sign-in',
              'Built-in support for WhatsApp, email, reviews, and certificates',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
