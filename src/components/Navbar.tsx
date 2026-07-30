import React from 'react';
import { UserProfile } from '../types';
import {
  Building2,
  FileText,
  ShieldCheck,
  PieChart,
  UserCheck,
  History,
  LogOut,
  Sparkles,
  Share2,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'applicant' | 'hq' | 'analytics';
  onSelectTab: (tab: 'applicant' | 'hq' | 'analytics') => void;
  user: UserProfile;
  onOpenVerification: () => void;
  onOpenLoginHistory: () => void;
  onLogout: () => void;
  pendingHQCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenVerification,
  onOpenLoginHistory,
  onLogout,
  pendingHQCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black text-sm tracking-tighter shadow">
              UPM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  Sistem e-PPT HSAAS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Hospital Sultan Abdul Aziz Shah Procurement System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onSelectTab('applicant')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'applicant'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Department PPT Application</span>
              <span className="md:hidden">Dept PPT</span>
            </button>

            {user.role === 'hq' ? (
              <>
                <button
                  onClick={() => onSelectTab('hq')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition relative ${
                    currentTab === 'hq'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HQ Approval</span>
                  {pendingHQCount > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                      {pendingHQCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onSelectTab('analytics')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentTab === 'analytics'
                      ? 'bg-cyan-700 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
              </>
            ) : (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-700/60 opacity-80 cursor-not-allowed"
                title="Akses Terhad: HQ Approval & Analytics hanya untuk Urus Setia HQ Perolehan HSAAS"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">HQ Approval & Analytics (Akses Terhad)</span>
                <span className="sm:hidden">HQ (Terhad)</span>
              </div>
            )}
          </nav>

          {/* User Quick Actions & Identity */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenVerification}
              className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition"
              title="Verify Identity / Update Department (Section 02)"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={onOpenLoginHistory}
              className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
              title="View Login History Logs (Section 01)"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Switch User / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
