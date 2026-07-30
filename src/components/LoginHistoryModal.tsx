import React from 'react';
import { LoginRecord, UserProfile } from '../types';
import { History, X, Clock, User, Mail, Building2, Monitor, ShieldCheck, Lock } from 'lucide-react';

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LoginRecord[];
  user?: UserProfile;
  onClearLogs?: () => void;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  user,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded-md border border-slate-700">
              <History className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">01. Login History Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Recorded authentication events and system sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logs Table / List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No login logs recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const formattedTime = new Date(log.loginTimestamp).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-200 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-slate-700">{log.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate font-medium text-amber-900">{log.department}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 sm:col-span-2">
                      <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-[10px] text-slate-500">
                        IP: {log.ipAddress} | {log.deviceInfo.slice(0, 50)}...
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-6 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Total Sessions Logged: <strong className="text-slate-800">{logs.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            {user?.role === 'hq' ? (
              onClearLogs && (
                <button
                  onClick={onClearLogs}
                  className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition font-medium"
                >
                  Clear History
                </button>
              )
            ) : (
              <span className="text-[11px] text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-md border border-slate-300/80 flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-slate-600" /> View Only (Clear restricted to HQ)
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
