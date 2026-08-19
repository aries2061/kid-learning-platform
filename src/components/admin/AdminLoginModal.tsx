import React, { useState } from 'react';
import { Shield, Lock, User, X, KeyRound, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEngine } from '../../utils/audio';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLogin, setShowAdminLogin, loginAsAdmin } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAdminLogin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    const success = loginAsAdmin(username, password);
    if (!success) {
      setErrorMsg('Invalid admin credentials. Use admin / admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900">Admin & Teacher Login</h2>
              <p className="text-xs text-zinc-500">Manage kid profiles, curriculum & media</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdminLogin(false)}
            className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-6">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                id="admin-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="password"
                id="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Quick Demo Fill Pill */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-center justify-between">
            <span className="text-indigo-700 font-medium">Default: <b>admin</b> / <b>admin123</b></span>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
                soundEngine.playTilePop();
              }}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Fill Demo
            </button>
          </div>

          <button
            type="submit"
            id="admin-submit-btn"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-102 active:scale-98"
          >
            Log In to Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
};
