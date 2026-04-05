# Skillzee - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Run the Application

```bash
pnpm dev
```

That's it! The application will start with **mock data** automatically. No database setup required for testing!

---

## 🎯 Two Ways to Run Skillzee

### Option A: Mock Data Mode (Recommended for Testing)

**Best for**: Development, testing, demos, and exploration

- ✅ No Supabase setup required
- ✅ Realistic sample data included
- ✅ All features work exactly the same
- ✅ Start instantly

**How it works**: The app runs with `VITE_HARDCODE=true` by default.

### Option B: Production Mode with Supabase

**Best for**: Production deployment and real usage

**Steps**:

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete (2-3 minutes)

2. **Run Database Schema**
   - Open your Supabase SQL Editor
   - Copy and paste the entire contents of `schema.sql`
   - Click "Run" to execute

3. **Configure Environment**
   ```bash
   # Create local environment file
   cp .env.example .env.local
   ```

4. **Add Your Supabase Credentials**

   Edit `.env.local`:
   ```env
   VITE_HARDCODE=false
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Where to find these**:
   - Open your Supabase project
   - Go to Settings > API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

5. **Start the App**
   ```bash
   pnpm dev
   ```

---

## 📋 What's Included

### Mock Data Includes:
- ✅ 6 user accounts (5 trainers + 1 learner)
- ✅ 10 sample skills across different categories
- ✅ Pre-configured bookings and reviews
- ✅ Chat messages and notifications
- ✅ Wallet and transaction history

### Test Accounts (Mock Mode):

**Current User (Auto-logged in)**:
- Email: `student@example.com`
- Role: Learner
- Has 3 bookings (1 upcoming, 1 confirmed, 1 completed)

---

## 🎨 Key Features to Explore

1. **Landing Page** (`/`)
   - View trending skills
   - Check the leaderboard
   - See platform stats

2. **Explore Skills** (`/explore`)
   - Search and filter skills
   - Browse by category
   - View trainer profiles

3. **Skill Details** (`/skills/:id`)
   - Read detailed descriptions
   - Check reviews and ratings
   - Contact trainers via WhatsApp/Email
   - Book sessions

4. **Dashboard** (`/dashboard`)
   - View upcoming and past sessions
   - Check notifications
   - See recommended skills
   - Quick access to wallet

5. **Chat** (`/chat`)
   - Message trainers about bookings
   - View conversation history
   - Real-time communication

6. **Profile** (`/profile`)
   - Edit your information
   - View stats and badges
   - Update bio and college

7. **Wallet** (`/wallet`)
   - Check balance
   - View transaction history
   - Track earnings and spending

8. **Admin Dashboard** (`/admin`)
   - Platform analytics
   - Revenue tracking
   - Top performing skills

9. **Dark Mode** 🌙
   - Toggle in the navbar
   - Persistent across sessions
   - Full dark theme support

---

## 🔧 Configuration Options

### Environment Variables

```env
# Core Settings
VITE_HARDCODE=true                 # true = mock data, false = Supabase
VITE_SUPABASE_URL=                 # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=            # Your Supabase anon key

# Platform Settings
VITE_PLATFORM_COMMISSION=15        # Commission percentage (default: 15%)
VITE_CURRENCY=INR                  # Currency (default: INR)

# Debug
VITE_DEBUG=false                   # Enable debug mode
```

---

## 🗂️ File Structure

```
skillzee/
├── schema.sql              # Supabase database schema
├── .env.example           # Environment template
├── README.md              # Full documentation
├── STARTUP.md             # This file
├── src/
│   ├── app/
│   │   ├── App.tsx       # Main app with routing
│   │   └── components/   # Reusable components
│   ├── pages/            # All page components
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── services/         # API service layer
│   ├── data/             # Mock data
│   └── config/           # Configuration files
```

---

## 🐛 Common Issues

### "The app shows mock data even with Supabase configured"

**Solution**: Make sure `VITE_HARDCODE=false` in your `.env.local` file

### "Environment variables not loading"

**Solution**:
- File must be named `.env.local` (not `.env`)
- Restart the dev server after changing env variables
- Check that variables start with `VITE_`

### "Dark mode not working"

**Solution**: Check that JavaScript is enabled and localStorage is accessible

### "Routes showing 404"

**Solution**: This is a SPA with client-side routing - routes work in development mode automatically

---

## 📚 Next Steps

1. ✅ **Explore the App** - Click around and test all features
2. 📖 **Read the Docs** - Check `README.md` for detailed information
3. 🎨 **Customize** - Modify colors, add features, make it yours
4. 🚀 **Deploy** - Deploy to Vercel, Netlify, or your platform of choice

---

## 🎓 Learning Resources

### Understanding the Stack

- **React Router** - For navigation: [reactrouter.com](https://reactrouter.com)
- **Tailwind CSS** - For styling: [tailwindcss.com](https://tailwindcss.com)
- **Supabase** - For backend: [supabase.com/docs](https://supabase.com/docs)
- **TypeScript** - For type safety: [typescriptlang.org](https://typescriptlang.org)

### Code Architecture

The app uses a **service layer pattern**:
- All data operations go through `src/services/api.ts`
- Services automatically switch between Supabase and mock data
- Components never directly access Supabase or mock data

Example:
```typescript
// ✅ Good - Using service layer
import { skillService } from '../services/api';
const skills = await skillService.getSkills();

// ❌ Bad - Direct Supabase access
import { supabase } from '../config/supabase';
const { data } = await supabase.from('skills').select();
```

---

## 💡 Pro Tips

1. **Mock Mode is Perfect for Development**
   - Test features without database setup
   - Realistic data for demos
   - Faster development iteration

2. **Dark Mode Everywhere**
   - All components support dark mode
   - Uses Tailwind's dark: prefix
   - Managed by ThemeContext

3. **Type Safety**
   - All data types defined in `src/services/api.ts`
   - Use TypeScript for better development experience
   - Import types: `import type { User, Skill } from '../services/api'`

4. **Responsive Design**
   - Mobile-first approach
   - Test on different screen sizes
   - Uses Tailwind responsive utilities

---

## 🤝 Support

Need help? Here's what to do:

1. 📖 Check `README.md` for detailed documentation
2. 🔍 Search existing GitHub issues
3. 💬 Ask in GitHub Discussions
4. 🐛 Report bugs via GitHub Issues

---

## 📄 Additional Resources

- **Full Documentation**: See `README.md`
- **Database Schema**: See `schema.sql`
- **Product Guide**: See `src/imports/pasted_text/skillzee-product-guide.md`

---

<div align="center">
  <p><strong>Happy Learning! 🎓</strong></p>
  <p>Built with ❤️ for students</p>
</div>
