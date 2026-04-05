# Skillzee - Student-to-Student Learning Marketplace

<div align="center">
  <h3>Learn From Student Experts • Book Affordable Sessions • Build Real Skills</h3>
  <p>A complete peer-to-peer learning marketplace where students can learn from and teach each other</p>
</div>

---

## 📋 Overview

Skillzee is a production-ready marketplace platform that connects student learners with student trainers. Built with React, TypeScript, Tailwind CSS, and Supabase, it provides a complete ecosystem for peer-to-peer learning including:

- 🎓 Skill discovery and booking
- 💬 Real-time chat and communication
- 💰 Integrated wallet and payment tracking
- ⭐ Reviews, ratings, and leaderboards
- 🎨 Dark mode support
- 📱 Fully responsive design

## ✨ Features

### For Learners
- Browse and search 200+ skills across 10 categories
- Book affordable sessions with student trainers
- Chat with trainers before and after sessions
- Rate and review completed sessions
- Download certificates upon completion
- Track spending and learning history

### For Trainers
- Create and manage skill listings
- Set your own pricing and availability
- Receive booking requests
- Track earnings and wallet balance
- Build reputation through ratings and badges
- View analytics on the dashboard

### Platform Features
- **Secure Authentication** - Supabase Auth integration with email/password
- **Real-time Chat** - Booking-based messaging system
- **Payment Tracking** - Complete wallet and transaction history
- **Reviews & Ratings** - Build trust through social proof
- **Admin Dashboard** - Platform analytics and monitoring
- **Dark Mode** - Full dark theme support
- **Responsive Design** - Mobile-first approach

## 🚀 Quick Start

### Option 1: Run with Mock Data (Fastest)

Perfect for testing and development without setting up Supabase:

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server
pnpm dev

# 3. Open your browser
# The app will run with fake data automatically!
```

The application runs in **hardcode mode** by default, using realistic mock data without requiring Supabase.

### Option 2: Run with Supabase (Production)

For full functionality with real database:

```bash
# 1. Install dependencies
pnpm install

# 2. Create Supabase project
# Visit https://supabase.com and create a new project

# 3. Run the database schema
# Open your Supabase SQL Editor and run schema.sql

# 4. Configure environment variables
cp .env.example .env.local

# Edit .env.local and set:
VITE_HARDCODE=false
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Start the development server
pnpm dev
```

## 📁 Project Structure

```
skillzee/
├── src/
│   ├── app/
│   │   ├── App.tsx               # Main app component with routing
│   │   └── components/           # Reusable components
│   │       ├── Navbar.tsx        # Navigation bar
│   │       └── Footer.tsx        # Footer component
│   ├── pages/
│   │   ├── Home.tsx             # Landing page
│   │   ├── Auth.tsx             # Login/Signup
│   │   ├── Explore.tsx          # Browse skills
│   │   ├── SkillDetail.tsx      # Skill details & reviews
│   │   ├── Booking.tsx          # Book a session
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Chat.tsx             # Messaging
│   │   ├── Profile.tsx          # User profile
│   │   ├── Wallet.tsx           # Transactions & earnings
│   │   ├── Admin.tsx            # Admin panel
│   │   └── HowItWorks.tsx       # Documentation
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark mode state
│   ├── services/
│   │   └── api.ts               # API service layer (Supabase/Mock)
│   ├── data/
│   │   └── mockData.ts          # Mock data for hardcode mode
│   ├── config/
│   │   ├── env.ts               # Environment config
│   │   └── supabase.ts          # Supabase client
│   └── styles/
│       ├── theme.css            # Theme variables
│       └── fonts.css            # Font imports
├── schema.sql                    # Supabase database schema
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🗄️ Database Schema

The platform uses a comprehensive database schema with:

- **Users & Profiles** - User accounts with roles (learner/trainer/both)
- **Skills** - Skill listings with categories, pricing, and ratings
- **Bookings** - Session bookings with status tracking
- **Reviews** - Ratings and feedback system
- **Messages** - Chat communication
- **Notifications** - User notifications
- **Wallets & Transactions** - Payment tracking
- **Badges** - Achievement system
- **Certificates** - Completion certificates

See `schema.sql` for the complete database structure.

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Backend**: Supabase (Auth + Database)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 🔧 Configuration

### Environment Variables

```env
# Hardcode mode (true = mock data, false = Supabase)
VITE_HARDCODE=true

# Supabase credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Platform settings
VITE_PLATFORM_COMMISSION=15
VITE_CURRENCY=INR
```

### Hardcode Mode

The application includes a smart fallback system:

- When `VITE_HARDCODE=true` or Supabase is not configured, the app uses realistic mock data
- All features work exactly the same with mock data
- Perfect for demos, development, and testing
- No database setup required

## 📱 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with trending skills and leaderboard |
| `/auth` | Sign up / Sign in page |
| `/explore` | Browse and search skills |
| `/skills/:id` | View skill details, reviews, and book |
| `/booking` | Book a session |
| `/dashboard` | User dashboard (learner & trainer) |
| `/chat` | Messaging interface |
| `/profile` | View and edit profile |
| `/wallet` | View balance, earnings, and transactions |
| `/admin` | Platform analytics dashboard |
| `/how-it-works` | Documentation and user guide |

## 🎯 Key Features Explained

### Dual-Mode Operation

The application seamlessly switches between Supabase and mock data:

```typescript
// In api.ts service layer
export const authService = {
  async signIn(email: string, password: string) {
    if (env.hardcode) {
      // Use mock data
      return { user: mockData.getCurrentMockUser(), error: null };
    }
    // Use Supabase
    return await supabase!.auth.signInWithPassword({ email, password });
  }
}
```

### Dark Mode

Automatically syncs with user preference and persists:

```typescript
// Toggle dark mode anywhere
const { theme, toggleTheme } = useTheme();
```

### Authentication

Full authentication flow with role selection:

- Sign up as learner, trainer, or both
- Email/password authentication
- Protected routes
- User session management

### Platform Commission

Transparent commission model (15% by default):

- Configurable via `VITE_PLATFORM_COMMISSION`
- Automatically calculated on bookings
- Displayed to both learners and trainers

## 🚀 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Import to Vercel
# Connect your GitHub repository
# Add environment variables
# Deploy!
```

### Deploy to Netlify

```bash
# 1. Build the project
pnpm build

# 2. Deploy dist folder
netlify deploy --prod --dir=dist
```

## 📝 Development Notes

### Mock Data

The mock data includes:
- 6 pre-configured users (5 trainers + 1 learner)
- 10 skills across different categories
- Sample bookings, reviews, messages
- Realistic wallet and transaction data

### API Service Pattern

All data operations go through the service layer (`src/services/api.ts`):

```typescript
// Always use service methods, never direct Supabase calls
import { skillService } from '../services/api';

const skills = await skillService.getSkills({ category: 'programming' });
```

### Adding New Features

1. Add database table to `schema.sql`
2. Add type definitions to `src/services/api.ts`
3. Add mock data to `src/data/mockData.ts`
4. Create service methods in `src/services/api.ts`
5. Use service methods in components

## 🐛 Troubleshooting

### "Supabase not configured" warning

**Solution**: Set `VITE_HARDCODE=true` in `.env.local` to use mock data, or configure Supabase properly.

### Dark mode not persisting

**Solution**: Check browser localStorage is enabled.

### Routes not working

**Solution**: Ensure `BrowserRouter` is properly configured in `App.tsx`.

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub or contact support.

---

<div align="center">
  <p>Built with ❤️ for students, by students</p>
  <p><strong>Skillzee</strong> - Empowering peer-to-peer learning</p>
</div>
