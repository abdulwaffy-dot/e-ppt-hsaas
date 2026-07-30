import React from 'react';
import { UserProfile } from '../types';
import { User, Mail, Building2, Calendar, Clock, ShieldCheck } from 'lucide-react';

interface FooterBarProps {
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenLoginHistory: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  user,
  onOpenProfile,
  onOpenLoginHistory,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-slate-100 border-t border-slate-800 shadow-lg px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left section: Identity & Department */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400 mr-1">Session Active:</span>
            <span>{user.role === 'hq' ? 'HQ Administrator' : 'Department PPT Application'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Name:</span>
            <span className="font-semibold text-white">{user.name || 'Not Logged In'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Email:</span>
            <span className="font-mono text-emerald-300">{user.email || '-'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Department:</span>
            <span className="font-medium text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
              {user.department || 'Select Department'}
            </span>
          </div>
        </div>

        {/* Right section: Login date, Update date (key in), and quick actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Login date:</span>
            <span className="font-mono">{user.loginDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Update date (key in):</span>
            <span className="font-mono text-cyan-300">{user.updateDate}</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <button
              onClick={onOpenProfile}
              className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition text-[11px] font-medium"
              title="Verify Identity / Update Department"
            >
              Verify Identity
            </button>
            <button
              onClick={onOpenLoginHistory}
              className="text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 px-2.5 py-1 rounded border border-cyan-800 transition text-[11px] font-medium"
              title="View Login History Logs"
            >
              Login History
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
