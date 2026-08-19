import React from 'react';
import {
  Users,
  FolderOpen,
  HelpCircle,
  FileText,
  BarChart3,
  LogOut,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KidsManager } from './KidsManager';
import { MaterialsLibrary } from './MaterialsLibrary';
import { QuestionBankManager } from './QuestionBankManager';
import { QuestionSheetsManager } from './QuestionSheetsManager';
import { ParentProgressTracker } from './ParentProgressTracker';
import { soundEngine } from '../../utils/audio';

export const AdminDashboard: React.FC = () => {
  const { adminUser, logoutAdmin, activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'kids', label: 'Kid Profiles', icon: Users, badge: null },
    { id: 'library', label: 'Materials Library', icon: FolderOpen, badge: null },
    { id: 'bank', label: 'Question Bank', icon: HelpCircle, badge: null },
    { id: 'sheets', label: 'Question Sheets', icon: FileText, badge: null },
    { id: 'analytics', label: 'Parent Tracker', icon: BarChart3, badge: null },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Admin Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Admin & Teacher Studio</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                Active Session
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Signed in as <b>{adminUser?.username || 'admin'}</b> ({adminUser?.role || 'Administrator'})
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="admin-logout-btn"
            onClick={() => {
              soundEngine.playTilePop();
              logoutAdmin();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.playTilePop();
                setActiveTab(item.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-102'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <main className="transition-all">
        {activeTab === 'kids' && <KidsManager />}
        {activeTab === 'library' && <MaterialsLibrary />}
        {activeTab === 'bank' && <QuestionBankManager />}
        {activeTab === 'sheets' && <QuestionSheetsManager />}
        {activeTab === 'analytics' && <ParentProgressTracker />}
      </main>
    </div>
  );
};
