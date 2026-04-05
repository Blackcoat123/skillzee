import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Bell,
  Download,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  bookingService,
  certificateService,
  notificationService,
  skillService,
  walletService,
} from '../services/api';
import type { Booking, Certificate, Notification, Review, Skill, User, Wallet } from '../services/api';

const money = (value: number | null | undefined) => `Rs ${Number(value || 0).toFixed(0)}`;

const sessionLabel = (booking: Booking) => {
  if (booking.status === 'completed') return 'Completed';
  if (booking.status === 'cancelled') return 'Cancelled';
  return new Date(booking.scheduled_date).getTime() <= Date.now() + 86400000 ? 'Ongoing' : 'Upcoming';
};

const whatsappLink = (user?: User | null, title?: string) => {
  if (!user?.phone_number) return '';
  const phone = user.phone_number.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(`Hi ${user.full_name}, I am contacting you about ${title || 'your class'} on Skillzee.`);
  return `https://wa.me/${phone}?text=${text}`;
};

const emailLink = (user?: User | null, title?: string) => {
  if (!user?.email) return '#';
  const subject = encodeURIComponent(`Skillzee: ${title || 'Class question'}`);
  const body = encodeURIComponent(`Hi ${user.full_name},\n\nI am reaching out via Skillzee regarding ${title || 'the class'}.\n\nI would like to discuss the session details.\n\nThanks`);
  return `mailto:${user.email}?subject=${subject}&body=${body}`;
};

const openCertificate = (certificate: Certificate, booking?: Booking) => {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return;
  w.document.write(`
    <html><head><title>${certificate.skill_title}</title><style>
      body{font-family:Georgia,serif;background:#eff6ff;padding:32px}
      .card{max-width:780px;margin:0 auto;background:#fff;border:6px solid #2563eb;border-radius:24px;padding:40px}
      h1{font-size:42px;margin:0 0 12px}.eyebrow{text-transform:uppercase;letter-spacing:.3em;color:#2563eb;font-size:12px}
      p{font-size:18px;line-height:1.7;color:#334155}
    </style></head><body><div class="card">
      <div class="eyebrow">Skillzee Certificate</div>
      <h1>Certificate of Completion</h1>
      <p><strong>${(certificate.certificate_data?.learnerName as string) || booking?.learner?.full_name || 'Learner'}</strong> completed <strong>${certificate.skill_title}</strong>.</p>
      <p>Instructor: <strong>${(certificate.certificate_data?.trainerName as string) || booking?.trainer?.full_name || 'Trainer'}</strong></p>
      <p>Completed on ${format(new Date(certificate.issued_at), 'MMMM dd, yyyy')}</p>
    </div></body></html>
  `);
  w.document.close();
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'learner' | 'provider'>('learner');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommended, setRecommended] = useState<Skill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [providerSkills, setProviderSkills] = useState<Skill[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role === 'trainer') setMode('provider');
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const providerEnabled = user.role === 'trainer' || user.role === 'both';
      const [allBookings, recs, notifs, walletData, certs, userReviews, trainerSkills, leaders] = await Promise.all([
        bookingService.getBookings(user.id),
        skillService.getRecommendedSkills(user.id),
        notificationService.getNotifications(user.id),
        walletService.getWallet(user.id),
        certificateService.getCertificatesForLearner(user.id),
        bookingService.getReviewsByLearner(user.id),
        providerEnabled ? skillService.getTrainerSkills(user.id) : Promise.resolve([]),
        skillService.getLeaderboard(),
      ]);
      setBookings(allBookings);
      setRecommended(recs);
      setNotifications(notifs);
      setWallet(walletData);
      setCertificates(certs);
      setReviews(userReviews);
      setProviderSkills(trainerSkills);
      setLeaderboard(leaders);
    } catch {
      setError('We could not load your dashboard right now.');
    } finally {
      setLoading(false);
    }
  };

  const learnerBookings = useMemo(() => bookings.filter((b) => b.learner_id === user?.id), [bookings, user]);
  const providerBookings = useMemo(() => bookings.filter((b) => b.trainer_id === user?.id), [bookings, user]);
  const reviewMap = useMemo(() => new Map(reviews.map((r) => [r.booking_id, r])), [reviews]);
  const certificateMap = useMemo(() => new Map(certificates.map((c) => [c.booking_id, c])), [certificates]);
  const providerStats = useMemo(() => {
    const earnings = providerBookings.reduce((sum, booking) => sum + Number(booking.trainer_payout || 0), 0);
    const commission = providerBookings.reduce((sum, booking) => sum + Number(booking.platform_commission || 0), 0);
    const students = new Set(providerBookings.map((booking) => booking.learner_id)).size;
    const byMonth = providerBookings.reduce<Record<string, number>>((acc, booking) => {
      const key = format(new Date(booking.scheduled_date), 'MMM yyyy');
      acc[key] = (acc[key] || 0) + Number(booking.trainer_payout || 0);
      return acc;
    }, {});
    return { earnings, commission, students, byMonth: Object.entries(byMonth).slice(-4) };
  }, [providerBookings]);

  const submitReview = async (booking: Booking) => {
    const result = await bookingService.addReview({
      booking_id: booking.id,
      skill_id: booking.skill_id,
      learner_id: booking.learner_id,
      trainer_id: booking.trainer_id,
      rating,
      comment,
    });
    if (result.error) {
      setError(result.error.message || 'Could not save your review.');
      return;
    }
    setReviewing(null);
    setRating(5);
    setComment('');
    loadData();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.full_name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold">
                  {user.full_name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
                <p className="text-sm text-blue-100">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/profile" className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700">Profile</Link>
              {(user.role === 'trainer' || user.role === 'both') && (
                <Link to="/create-skill" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Publish Class
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose Dashboard Mode</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Switch between learner mode and provider mode to see the correct dashboard features.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setMode('learner')}
              className={`rounded-3xl border p-5 text-left transition ${
                mode === 'learner'
                  ? 'border-blue-600 bg-blue-50 shadow-sm dark:bg-blue-950/20'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learner Mode</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Profile snapshot, applied classes, ongoing and completed labels, certificates,
                    reviews, and personalized recommendations.
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === 'learner' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {mode === 'learner' ? 'Active' : 'Open'}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                if (user.role === 'trainer' || user.role === 'both') {
                  setMode('provider');
                }
              }}
              className={`rounded-3xl border p-5 text-left transition ${
                mode === 'provider'
                  ? 'border-blue-600 bg-blue-50 shadow-sm dark:bg-blue-950/20'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:bg-gray-800'
              } ${(user.role === 'trainer' || user.role === 'both') ? '' : 'opacity-70'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Mode</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Revenue and earnings overview, commission and payouts, student applications,
                    and my published classes.
                  </p>
                  {!(user.role === 'trainer' || user.role === 'both') && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                      Available when your account role includes provider access
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === 'provider' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {mode === 'provider' ? 'Active' : user.role === 'trainer' || user.role === 'both' ? 'Open' : 'Locked'}
                </span>
              </div>
            </button>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">Loading dashboard...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {mode === 'learner' ? (
                <>
                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.full_name} className="h-16 w-16 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                          {user.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learner Profile Snapshot</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {user.full_name} • {(user.interests || []).length > 0 ? user.interests?.slice(0, 3).join(', ') : 'Add interests to improve recommendations'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Applied classes: {learnerBookings.length} • Completed: {learnerBookings.filter((b) => b.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Applied</p><p className="mt-2 text-3xl font-bold dark:text-white">{learnerBookings.length}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Completed</p><p className="mt-2 text-3xl font-bold dark:text-white">{learnerBookings.filter((b) => b.status === 'completed').length}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Wallet</p><p className="mt-2 text-3xl font-bold dark:text-white">{money(wallet?.available_balance)}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Points</p><p className="mt-2 text-3xl font-bold dark:text-white">{user.points}</p></div>
                  </div>

                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold dark:text-white">My Applied Classes</h2>
                      <Link to="/explore" className="text-sm font-semibold text-blue-600">Explore More</Link>
                    </div>
                    <div className="space-y-4">
                      {learnerBookings.map((booking) => (
                        <div key={booking.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <h3 className="font-semibold dark:text-white">{booking.skill?.title}</h3>
                              <p className="text-sm text-gray-500">{booking.trainer?.full_name} • {format(new Date(booking.scheduled_date), 'MMM dd, yyyy • hh:mm a')}</p>
                              <div className="mt-2 text-sm text-gray-500">{sessionLabel(booking)} • {money(booking.price)}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/chat?booking=${booking.id}`} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><MessageSquare className="mr-2 inline h-4 w-4" />Chat</Link>
                              {whatsappLink(booking.trainer, booking.skill?.title) && <a href={whatsappLink(booking.trainer, booking.skill?.title)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><MessageCircle className="mr-2 inline h-4 w-4" />WhatsApp</a>}
                              <a href={emailLink(booking.trainer, booking.skill?.title)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"><Mail className="mr-2 inline h-4 w-4" />Send Email</a>
                            </div>
                          </div>
                          {booking.status === 'completed' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button onClick={() => openCertificate(certificateMap.get(booking.id) || { id: `certificate-${booking.id}`, booking_id: booking.id, learner_id: booking.learner_id, trainer_id: booking.trainer_id, skill_title: booking.skill?.title || 'Completed Class', issued_at: booking.scheduled_date }, booking)} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"><Download className="mr-2 inline h-4 w-4" />Download Certificate</button>
                              {reviewMap.get(booking.id) ? (
                                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Review submitted</div>
                              ) : (
                                <button onClick={() => setReviewing(booking.id)} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">Leave Review</button>
                              )}
                            </div>
                          )}
                          {reviewing === booking.id && (
                            <div className="mt-4 space-y-3">
                              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                              </select>
                              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Share your feedback" />
                              <div className="flex gap-2">
                                <button onClick={() => submitReview(booking)} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Submit</button>
                                <button onClick={() => setReviewing(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {learnerBookings.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No classes applied yet.</div>}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold dark:text-white">Personalized Recommendations</h2>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommended.slice(0, 4).map((skill) => (
                        <Link key={skill.id} to={`/skills/${skill.id}`} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                          <h3 className="font-semibold dark:text-white">{skill.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-gray-500">{skill.description}</p>
                          <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-500">{skill.trainer?.full_name}</span><span className="font-semibold text-blue-600">{money(skill.price)}</span></div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Provider Dashboard</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Revenue, payouts, student applications, and published class management.
                        </p>
                      </div>
                      <Link to="/create-skill" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                        <Plus className="mr-2 inline h-4 w-4" />
                        New Class
                      </Link>
                    </div>
                  </section>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Revenue</p><p className="mt-2 text-3xl font-bold dark:text-white">{money(providerStats.earnings)}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Commission</p><p className="mt-2 text-3xl font-bold dark:text-white">{money(providerStats.commission)}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Students</p><p className="mt-2 text-3xl font-bold dark:text-white">{providerStats.students}</p></div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><p className="text-sm text-gray-500">Pending Payouts</p><p className="mt-2 text-3xl font-bold dark:text-white">{money(wallet?.pending_balance)}</p></div>
                  </div>

                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-xl font-semibold dark:text-white">Earnings Graph</h2>
                    <div className="mt-4 space-y-4">
                      {providerStats.byMonth.map(([month, amount]) => {
                        const max = Math.max(...providerStats.byMonth.map((item) => item[1]), 1);
                        return (
                          <div key={month}>
                            <div className="mb-2 flex justify-between text-sm text-gray-500"><span>{month}</span><span>{money(amount)}</span></div>
                            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-3 rounded-full bg-blue-600" style={{ width: `${Math.max((amount / max) * 100, 12)}%` }} /></div>
                          </div>
                        );
                      })}
                      {providerStats.byMonth.length === 0 && <p className="text-sm text-gray-500">No earnings yet.</p>}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold dark:text-white">Students Who Applied</h2>
                    </div>
                    <div className="space-y-4">
                      {providerBookings.map((booking) => (
                        <div key={booking.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                          <h3 className="font-semibold dark:text-white">{booking.learner?.full_name || 'Learner'}</h3>
                          <p className="mt-1 text-sm text-gray-500">{booking.skill?.title} • {sessionLabel(booking)}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link to={`/chat?booking=${booking.id}`} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><MessageSquare className="mr-2 inline h-4 w-4" />Chat</Link>
                            {whatsappLink(booking.learner, booking.skill?.title) && <a href={whatsappLink(booking.learner, booking.skill?.title)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><MessageCircle className="mr-2 inline h-4 w-4" />WhatsApp</a>}
                            <a href={emailLink(booking.learner, booking.skill?.title)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"><Mail className="mr-2 inline h-4 w-4" />Send Email</a>
                          </div>
                        </div>
                      ))}
                      {providerBookings.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No student applications yet.</div>}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold dark:text-white">My Published Classes</h2>
                      <Link to="/create-skill" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><Plus className="mr-2 inline h-4 w-4" />Create</Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {providerSkills.map((skill) => (
                        <Link key={skill.id} to={`/skills/${skill.id}`} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                          <h3 className="font-semibold dark:text-white">{skill.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-gray-500">{skill.description}</p>
                          <div className="mt-3 flex items-center justify-between text-sm"><span>{skill.total_bookings} bookings</span><span className="font-semibold text-blue-600">{money(skill.price)}</span></div>
                        </Link>
                      ))}
                      {providerSkills.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No published classes yet.</div>}
                    </div>
                  </section>
                </>
              )}
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold dark:text-white">Notifications</h2><Bell className="h-5 w-5 text-blue-600" /></div>
                <div className="space-y-3">
                  {notifications.slice(0, 6).map((notification) => (
                    <div key={notification.id} className={`rounded-2xl px-4 py-4 text-sm ${notification.is_read ? 'bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300' : 'border border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'}`}>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="mt-1">{notification.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No notifications.</div>}
                </div>
              </section>

              <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold dark:text-white">Leaderboard</h2><Star className="h-5 w-5 text-yellow-500" /></div>
                <div className="space-y-3">
                  {leaderboard.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                      <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{index + 1}</div><div><p className="text-sm font-semibold dark:text-white">{member.full_name}</p><p className="text-xs text-gray-500">{member.role}</p></div></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{member.points} pts</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-xl font-semibold dark:text-white">How to Use</h2>
                <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>Book classes from Explore and follow them here in learner view.</p>
                  <p>Publish and manage classes in provider view.</p>
                  <p>Use WhatsApp, email, or in-app chat to contact users quickly.</p>
                  <p>Leave reviews after completed classes and open certificates from the dashboard.</p>
                </div>
                <Link to="/how-it-works" className="mt-4 inline-block rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">Open Help</Link>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
