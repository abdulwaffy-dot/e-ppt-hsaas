import React, { useState } from 'react';
import { LoginRecord, UserProfile, DeletionAuditLog } from '../types';
import {
  History,
  X,
  Clock,
  User,
  Mail,
  Building2,
  Monitor,
  ShieldCheck,
  Lock,
  Trash2,
  Search,
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Sliders,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LoginRecord[];
  auditLogs?: DeletionAuditLog[];
  user?: UserProfile;
  onClearLogs?: () => void;
  onClearAuditLogs?: () => void;
  defaultTab?: 'deletion' | 'adjustment' | 'login';
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  auditLogs = [],
  user,
  onClearLogs,
  onClearAuditLogs,
  defaultTab = 'adjustment',
}) => {
  const [activeTab, setActiveTab] = useState<'deletion' | 'adjustment' | 'login'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter Deletion Logs
  const deletionLogs = auditLogs.filter(
    (l) => l.action === 'DELETE_PPT_RECORD' || l.action === 'BATCH_DELETE_PPT_RECORDS'
  );
  const filteredDeletionLogs = deletionLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.applicationRef.referenceNo.toLowerCase().includes(term) ||
      log.applicationRef.title.toLowerCase().includes(term) ||
      log.applicationRef.department.toLowerCase().includes(term) ||
      log.hqUser.name.toLowerCase().includes(term) ||
      log.hqUser.email.toLowerCase().includes(term) ||
      log.reason.toLowerCase().includes(term)
    );
  });

  // Filter Amount Adjustment Logs
  const adjustmentLogs = auditLogs.filter((l) => l.action === 'ADJUST_REQUESTED_AMOUNT');
  const filteredAdjustmentLogs = adjustmentLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.applicationRef.referenceNo.toLowerCase().includes(term) ||
      log.applicationRef.title.toLowerCase().includes(term) ||
      log.applicationRef.department.toLowerCase().includes(term) ||
      log.hqUser.name.toLowerCase().includes(term) ||
      log.hqUser.email.toLowerCase().includes(term) ||
      log.reason.toLowerCase().includes(term)
    );
  });

  // Filter Login Logs
  const filteredLoginLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.name.toLowerCase().includes(term) ||
      log.email.toLowerCase().includes(term) ||
      log.department.toLowerCase().includes(term) ||
      log.ipAddress.toLowerCase().includes(term)
    );
  });

  const formatRM = (val?: number) =>
    new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in duration-200 my-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">
                  Log Audit & Rekod Aktiviti Sistem HSAAS
                </h3>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-semibold">
                  Live Audit Trail
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Perekodan telus aktiviti pelarasan amaun HQ, pemadaman rekod, dan sesi keselamatan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab: Penyelarasan Amaun */}
            <button
              onClick={() => setActiveTab('adjustment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'adjustment'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Log Penyelarasan Amaun</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'adjustment'
                    ? 'bg-amber-800 text-amber-200'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {adjustmentLogs.length}
              </span>
            </button>

            {/* Tab: Pelupusan Rekod */}
            <button
              onClick={() => setActiveTab('deletion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'deletion'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Log Pelupusan Rekod (HQ)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'deletion'
                    ? 'bg-rose-900 text-rose-200'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {deletionLogs.length}
              </span>
            </button>

            {/* Tab: Login Sessions */}
            <button
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Log Sesi Pengguna</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-slate-200'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {logs.length}
              </span>
            </button>
          </div>

          {/* Search box within audit modal */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari log..."
              className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'adjustment' ? (
            /* TAB: Amount Adjustment Audit Logs */
            filteredAdjustmentLogs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Sliders className="w-6 h-6 text-amber-500" />
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  {adjustmentLogs.length === 0
                    ? 'Tiada Aktiviti Penyelarasan Amaun Direkodkan'
                    : 'Tiada rekod sepadan dengan carian anda'}
                </div>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed">
                  Sebarang pelarasan amaun yang dibuat oleh pegawai Urus Setia HQ sebelum atau semasa kelulusan permohonan akan diaudit dan dipaparkan di sini secara automatik.
                </p>
              </div>
            ) : (
              filteredAdjustmentLogs.map((log) => {
                const adj = log.adjustmentDetail;
                const orig = adj?.originalAmount ?? log.applicationRef.originalCost ?? 0;
                const revised = adj?.adjustedAmount ?? log.applicationRef.adjustedCost ?? log.applicationRef.estimatedCost;
                const diff = adj?.differenceAmount ?? (revised - orig);
                const dir = adj?.direction ?? (diff < 0 ? 'reduced' : 'increased');

                return (
                  <div
                    key={log.id}
                    className="bg-white border border-amber-200/90 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] uppercase tracking-wide inline-flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-amber-700" />
                          Penyelarasan Amaun HQ
                        </span>
                        <span className="font-mono font-bold text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
                          {log.applicationRef.referenceNo}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 ${
                            dir === 'reduced'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {dir === 'reduced' ? (
                            <>
                              <TrendingDown className="w-3 h-3 text-amber-700" />
                              Diturunkan (-{formatRM(Math.abs(diff))})
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3 h-3 text-blue-700" />
                              Dinaikkan (+{formatRM(diff)})
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        <Calendar className="w-3 h-3 text-amber-700" />
                        <span className="font-semibold text-slate-800">{log.dateFormatted}</span>
                        <span className="text-slate-300">•</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{log.timeFormatted}</span>
                      </div>
                    </div>

                    {/* Application Details & Amount Comparison */}
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 text-xs">
                        {log.applicationRef.title}
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-amber-600" />
                        Jabatan: <strong className="text-slate-800">{log.applicationRef.department}</strong>
                        {log.applicationRef.applicantName && (
                          <span className="text-slate-500">
                            (Pemohon: <strong>{log.applicationRef.applicantName}</strong>)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount Comparison Pill */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Amaun Asal Dimohon</span>
                        <span className="font-mono font-bold text-slate-800">{formatRM(orig)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block">Amaun Dilaraskan HQ</span>
                        <span className="font-mono font-bold text-emerald-700">{formatRM(revised)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Perbezaan</span>
                        <span
                          className={`font-mono font-bold ${
                            dir === 'reduced' ? 'text-amber-700' : 'text-blue-700'
                          }`}
                        >
                          {dir === 'reduced' ? '-' : '+'}{formatRM(Math.abs(diff))}
                        </span>
                      </div>
                    </div>

                    {/* Justification & Reviewer */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-[11px] space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-600">Pegawai HQ:</span>
                          <strong className="text-slate-900">{log.hqUser.name}</strong>
                          <span className="text-slate-400 font-mono text-[10px]">({log.hqUser.email})</span>
                        </div>
                      </div>
                      <div className="text-slate-700">
                        <strong className="text-slate-900">Justifikasi Pelarasan:</strong> {log.reason}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : activeTab === 'deletion' ? (
            /* TAB: Deletion Audit Logs */
            filteredDeletionLogs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  {deletionLogs.length === 0
                    ? 'Tiada Aktiviti Pemadaman Rekod Ditemui'
                    : 'Tiada rekod sepadan dengan carian anda'}
                </div>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed">
                  Semua tindakan pelupusan rekod permohonan PPT yang dilakukan oleh pegawai HQ di bawah Modul DEPARTMENT PPT APPLICATION akan diaudit dan dipaparkan di sini secara automatik.
                </p>
              </div>
            ) : (
              filteredDeletionLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-rose-200/90 rounded-xl p-4 shadow-2xs hover:border-rose-300 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-[10px] uppercase tracking-wide inline-flex items-center gap-1">
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        Pelupusan Rekod PPT
                      </span>
                      <span className="font-mono font-bold text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
                        {log.applicationRef.referenceNo}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Tahun {log.applicationRef.year}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                      <Calendar className="w-3 h-3 text-rose-700" />
                      <span className="font-semibold text-slate-800">{log.dateFormatted}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{log.timeFormatted}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 text-xs">
                      {log.applicationRef.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-amber-600" />
                        Jabatan: <strong className="text-slate-800">{log.applicationRef.department}</strong>
                      </span>
                      <span className="font-mono font-bold text-emerald-800">
                        Kos: {formatRM(log.applicationRef.estimatedCost)}
                      </span>
                      <span className="text-slate-500">
                        Status Asal: <strong>{log.applicationRef.status}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-[11px] space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-600">Pegawai HQ:</span>
                        <strong className="text-slate-900">{log.hqUser.name}</strong>
                        <span className="text-slate-400 font-mono text-[10px]">({log.hqUser.email})</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded">
                        Peranan: {log.hqUser.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <strong className="text-slate-900">Kategori & Sebab Pelupusan:</strong>{' '}
                      {log.reasonCategory ? `[${log.reasonCategory.toUpperCase()}] ` : ''}
                      {log.reason}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* TAB: Login Sessions */
            filteredLoginLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Tiada sesi log masuk ditemui.
              </div>
            ) : (
              filteredLoginLogs.map((log) => {
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
                        <span className="truncate font-medium text-amber-900">
                          {log.department}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 sm:col-span-2">
                        <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-[10px] text-slate-500">
                          IP: {log.ipAddress} | {log.deviceInfo.slice(0, 55)}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 px-6 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <span className="text-xs text-slate-600 font-medium">
            {activeTab === 'adjustment' ? (
              <>
                Jumlah Penyelarasan Amaun Diaudit:{' '}
                <strong className="text-slate-900 font-mono">{adjustmentLogs.length}</strong>
              </>
            ) : activeTab === 'deletion' ? (
              <>
                Jumlah Rekod Dipadam Diaudit:{' '}
                <strong className="text-slate-900 font-mono">{deletionLogs.length}</strong>
              </>
            ) : (
              <>
                Jumlah Sesi Log Masuk:{' '}
                <strong className="text-slate-900 font-mono">{logs.length}</strong>
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            {user?.role === 'hq' && (
              activeTab !== 'login' && onClearAuditLogs ? (
                <button
                  onClick={onClearAuditLogs}
                  className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition font-medium"
                >
                  Kosongkan Log Audit
                </button>
              ) : activeTab === 'login' && onClearLogs ? (
                <button
                  onClick={onClearLogs}
                  className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition font-medium"
                >
                  Kosongkan Log Sesi
                </button>
              ) : null
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              Tutup (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
