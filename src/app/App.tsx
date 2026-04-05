/**
 * Main App Component - Skillzee
 * Peer-to-peer student skill learning marketplace
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

// Pages
import { Home } from '../pages/Home';
import { Auth } from '../pages/Auth';
import { Explore } from '../pages/Explore';
import { SkillDetail } from '../pages/SkillDetail';
import { Booking } from '../pages/Booking';
import { Dashboard } from '../pages/Dashboard';
import { Chat } from '../pages/Chat';
import { Profile } from '../pages/Profile';
import { Wallet } from '../pages/Wallet';
import { Admin } from '../pages/Admin';
import { HowItWorks } from '../pages/HowItWorks';
import { CreateSkill } from '../pages/CreateSkill';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/skills/:skillId" element={<SkillDetail />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-skill" element={<CreateSkill />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
