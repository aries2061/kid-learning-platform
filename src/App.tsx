import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { KidDashboard } from './components/kid/KidDashboard';
import { KidGameSession } from './components/kid/KidGameSession';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KidLoginModal } from './components/kid/KidLoginModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

const AppContent: React.FC = () => {
  const { activeSheet, adminUser } = useApp();

  return (
    <div className="min-h-screen bg-sky-100 bg-sky-dots text-slate-900 flex flex-col font-sans selection:bg-pink-400 selection:text-white relative">
      {/* Top Main Navigation */}
      <Navbar />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col">
        {activeSheet ? (
          <KidGameSession sheet={activeSheet} />
        ) : adminUser ? (
          <AdminDashboard />
        ) : (
          <KidDashboard />
        )}
      </main>

      {/* Global Modals */}
      <KidLoginModal />
      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
