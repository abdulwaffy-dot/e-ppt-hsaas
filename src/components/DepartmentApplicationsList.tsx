import React, { useState } from 'react';
import { ProcurementApplication, UserProfile, UPM_DEPARTMENTS } from '../types';
import {
  Plus,
  Search,
  Filter,
  FilePlus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Building2,
  DollarSign,
  Send,
  FileText,
  Lock,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  History,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Sliders,
} from 'lucide-react';

interface DepartmentApplicationsListProps {
  applications: ProcurementApplication[];
  user: UserProfile;
  onOpenNewForm: () => void;
  onOpenEditForm: (app: ProcurementApplication) => void;
  onOpenDetailModal: (app: ProcurementApplication) => void;
  onDeleteApplication: (id: string) => void;
  onSubmitDraft: (id: string) => void;
  onHQDeleteRequest?: (apps: ProcurementApplication[]) => void;
  onOpenAuditLogModal?: () => void;
  auditLogsCount?: number;
  onOpenAdjustAmount?: (app: ProcurementApplication) => void;
}

export const DepartmentApplicationsList: React.FC<DepartmentApplicationsListProps> = ({
  applications,
  user,
  onOpenNewForm,
  onOpenEditForm,
  onOpenDetailModal,
  onDeleteApplication,
  onSubmitDraft,
  onHQDeleteRequest,
  onOpenAuditLogModal,
  auditLogsCount = 0,
  onOpenAdjustAmount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilterState, setDeptFilterState] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  const isHQ = user.role === 'hq';

  // Strict Privacy & Data Isolation:
  // For applicants, ONLY return applications whose applicantName AND applicantEmail match this logged-in applicant.
  // For HQ users, full administrative oversight across all hospital departments is enabled.
  const userOwnedApps = applications.filter((app) => {
    if (isHQ) return true; // Authorized HQ global administrative oversight
    
    const userName = (user.name || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const appName = (app.applicantName || '').trim().toLowerCase();
    const appEmail = (app.applicantEmail || '').trim().toLowerCase();

    if (appName && appEmail) {
      return appName === userName && appEmail === userEmail;
    }
    if (appName && !appEmail) {
      return appName === userName;
    }
    return false;
  });

  const filteredApps = userOwnedApps.filter((app) => {
    const matchesDept =
      deptFilterState === 'ALL'
        ? true
        : app.department === deptFilterState;

    const matchesSearch =
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.expenditureCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicantName && app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || app.year.toString() === yearFilter;

    return matchesDept && matchesSearch && matchesStatus && matchesYear;
  });

  const totalCost = filteredApps.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
  const myDraftCount = userOwnedApps.filter((a) => a.status === 'Draft').length;
  const myApprovedCount = userOwnedApps.filter((a) => a.status === 'Approved').length;
  const myPendingCount = userOwnedApps.filter((a) => a.status === 'Submitted').length;
  const myRejectedCount = userOwnedApps.filter((a) => a.status === 'Rejected').length;

  // Checkbox handlers for HQ users
  const handleToggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTriggerBatchDelete = () => {
    if (!isHQ) {
      alert('Akses Terhad: Hanya Urus Setia HQ yang diberi kuasa dibenarkan memadam rekod permohonan.');
      return;
    }
    const targetApps = applications.filter((a) => selectedAppIds.includes(a.id));
    if (targetApps.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu rekod permohonan PPT untuk dipadam.');
      return;
    }
    if (onHQDeleteRequest) {
      onHQDeleteRequest(targetApps);
    }
  };

  const handleTriggerSingleDelete = (app: ProcurementApplication) => {
    if (isHQ) {
      if (onHQDeleteRequest) {
        onHQDeleteRequest([app]);
      } else {
        onDeleteApplication(app.id);
      }
    } else {
      onDeleteApplication(app.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved (Lulus)
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected (Ditolak)
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending HQ (Dalam Semakan)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-500" />
            Draft (Belum Hantar)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Department Title */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Department PPT Application • Portal Permohonan Jabatan
          </div>
          <h1 className="text-xl font-bold tracking-tight">Hospital Sultan Abdul Aziz Shah (HSAAS)</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-200">
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Nama Pengguna: <strong className="text-white ml-1">{user.name}</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[11px]">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              {user.email}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                isHQ
                  ? 'bg-red-900/90 text-amber-300 border-red-700'
                  : 'bg-slate-800/80 text-emerald-400 border-slate-700'
              }`}
            >
              {isHQ ? 'Urus Setia HQ Perolehan (Pentadbir)' : 'Pemohon Jabatan (Applicant)'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenNewForm}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs shadow-md transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cipta Permohonan PPT Baharu</span>
        </button>
      </div>

      {/* HQ Module under DEPARTMENT PPT APPLICATION */}
      {isHQ ? (
        <div
          className="bg-gradient-to-r from-slate-900 via-rose-950/80 to-slate-900 text-white rounded-xl p-5 border border-rose-800/60 shadow-md space-y-4"
          id="hq-module-department-ppt"
        >
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-rose-600/30 border border-rose-500/50 rounded-xl text-rose-300 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Modul Urus Setia HQ • Pengurusan & Pelupusan Rekod PPT
                  </span>
                  <span className="px-2 py-0.5 bg-rose-900/80 text-rose-200 border border-rose-500/40 rounded-full text-[10px] font-bold">
                    HQ Authorized Deletion Active
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                  Sebagai pegawai Urus Setia HQ, anda mempunyai kebenaran untuk memilih dan memadam
                  sebarang rekod permohonan PPT yang <strong>tidak diperlukan</strong> atau{' '}
                  <strong>tidak sah</strong>. Setiap pemadaman akan dipadam secara kekal dari pangkalan data
                  dan direkodkan ke dalam <strong>Log Audit Sistem</strong> berserta nama pegawai, tarikh, masa, dan no. rujukan.
                </p>
              </div>
            </div>

            {/* Top Action Buttons for HQ Module */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {onOpenAuditLogModal && (
                <button
                  onClick={onOpenAuditLogModal}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  title="Lihat Log Audit Pelupusan Rekod & Sesi Log Masuk"
                >
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Log Audit Sistem</span>
                  <span className="bg-rose-900 text-rose-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                    {auditLogsCount}
                  </span>
                </button>
              )}

              {selectedAppIds.length > 0 && (
                <button
                  onClick={handleTriggerBatchDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-[0.98]"
                  title="Padam semua rekod yang dipilih serentak"
                  id="btn-hq-batch-delete"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Padam Rekod Terpilih ({selectedAppIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Selection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span>
                Status Pilihan: Rekod dipilih{' '}
                <strong className="text-white font-mono">{selectedAppIds.length}</strong> daripada{' '}
                <strong className="text-white font-mono">{filteredApps.length}</strong>
              </span>
              {selectedAppIds.length > 0 && (
                <button
                  onClick={() => setSelectedAppIds([])}
                  className="text-rose-300 hover:text-white underline ml-1 cursor-pointer"
                >
                  Nyahpilih Semua
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const allIds = filteredApps.map((a) => a.id);
                  setSelectedAppIds(allIds);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-medium transition"
              >
                Pilih Semua Yang Ditapis
              </button>

              <button
                type="button"
                onClick={() => {
                  const candidates = filteredApps
                    .filter((a) => a.status === 'Draft' || a.status === 'Rejected')
                    .map((a) => a.id);
                  setSelectedAppIds(candidates);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-medium transition"
                title="Pilih rekod berstatus Draf atau Ditolak yang berpotensi untuk dilupuskan"
              >
                Pilih Draf & Ditolak Sahaja
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Non-HQ User: Privacy & Restricted Deletion Info */
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-600/40 rounded-xl p-3.5 text-xs text-emerald-100 flex items-start sm:items-center justify-between gap-3 shadow-sm flex-wrap">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-emerald-900/60 rounded-lg border border-emerald-500/40 text-emerald-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Akses Privasi & Kawalan Pemohon Jabatan
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Anda hanya dibenarkan melihat dan mengurus permohonan milik anda sendiri ({user.name}).
                Fungsi pemadaman permohonan telah dikeluarkan daripada tindakan pemohon dan dipusatkan kepada Urus Setia HQ. Sebarang pelarasan amaun oleh HQ akan dipaparkan secara telus di sini.
              </p>
            </div>
          </div>

          {onOpenAuditLogModal && (
            <button
              onClick={onOpenAuditLogModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition ml-auto"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Log Audit Sistem</span>
            </button>
          )}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            {isHQ ? 'Semua Permohonan' : 'Permohonan Saya'}
          </span>
          <div className="text-lg font-bold text-slate-900 font-mono">{userOwnedApps.length}</div>
          <span className="text-[10px] text-slate-400">Jumlah permohonan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Draf Belum Hantar</span>
          <div className="text-lg font-bold text-slate-700 font-mono">{myDraftCount}</div>
          <span className="text-[10px] text-slate-400">Di portal jabatan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Dalam Semakan HQ</span>
          <div className="text-lg font-bold text-amber-700 font-mono">{myPendingCount}</div>
          <span className="text-[10px] text-slate-400">Menunggu kelulusan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Diluluskan HQ</span>
          <div className="text-lg font-bold text-emerald-700 font-mono">{myApprovedCount}</div>
          <span className="text-[10px] text-slate-400">Sedia untuk perolehan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1">Ditolak HQ</span>
          <div className="text-lg font-bold text-rose-700 font-mono">{myRejectedCount}</div>
          <span className="text-[10px] text-slate-400">Perlu semakan semula</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tajuk permohonan, no. rujukan, pemohon, kategori..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
            />
          </div>

          {/* Department / Status / Year filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={deptFilterState}
              onChange={(e) => setDeptFilterState(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 max-w-[220px]"
            >
              <option value="ALL">Semua Jabatan HSAAS</option>
              {UPM_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Semua Status</option>
              <option value="Draft">Draf (Draft)</option>
              <option value="Submitted">Dalam Semakan HQ (Submitted)</option>
              <option value="Approved">Diluluskan (Approved)</option>
              <option value="Rejected">Ditolak (Rejected)</option>
            </select>

            {/* Year filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Semua Tahun</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y.toString()}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aggregate Summary Line */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2 px-1">
          <span>
            Memaparkan <strong className="text-slate-900">{filteredApps.length}</strong> daripada{' '}
            <strong className="text-slate-900">{userOwnedApps.length}</strong> rekod permohonan
            {isHQ ? ' (Akses Keseluruhan HQ)' : ` milik ${user.name}`}
          </span>

          <span className="font-semibold text-slate-900">
            Jumlah Anggaran Kos:{' '}
            <strong className="text-emerald-700 font-mono text-sm ml-1">
              {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalCost)}
            </strong>
          </span>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="p-3 bg-slate-100 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
              <FilePlus className="w-7 h-7" />
            </div>
            <div className="text-slate-800 font-bold text-sm">
              Tiada Rekod Permohonan PPT Ditemui
            </div>
            <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
              {userOwnedApps.length === 0
                ? `Tiada sebarang permohonan PPT ditemui. Sila klik butang di bawah untuk mencipta permohonan pertama.`
                : 'Tiada permohonan ditemui berdasarkan tapisan carian anda. Sila ubah kriteria tapisan di atas.'}
            </p>
            <button
              onClick={onOpenNewForm}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold shadow hover:bg-red-900 transition"
            >
              <Plus className="w-4 h-4" /> Cipta Permohonan PPT Baharu
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  {isHQ && (
                    <th className="p-3.5 pl-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-slate-500 hover:text-slate-900 cursor-pointer"
                        title={
                          selectedAppIds.length === filteredApps.length
                            ? 'Nyahpilih Semua'
                            : 'Pilih Semua'
                        }
                      >
                        {selectedAppIds.length === filteredApps.length && filteredApps.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className={`p-3.5 ${isHQ ? 'pl-2' : 'pl-4'}`}>No. Rujukan & Tajuk</th>
                  <th className="p-3.5">Jabatan / Kategori</th>
                  <th className="p-3.5">Kaedah & Jenis</th>
                  <th className="p-3.5">Pelawaan Dijangka</th>
                  <th className="p-3.5">Anggaran Kos</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => {
                  const originalCost = app.originalEstimatedCost ?? app.estimatedCost;
                  const activeCost = app.estimatedCost;
                  const isAdjusted =
                    app.isAmountAdjusted ||
                    (app.originalEstimatedCost !== undefined &&
                      Math.abs(app.estimatedCost - app.originalEstimatedCost) > 0.01);
                  const diffCost = activeCost - originalCost;
                  const direction =
                    diffCost < -0.01 ? 'reduced' : diffCost > 0.01 ? 'increased' : 'unchanged';
                  const formatRM = (val: number) =>
                    new Intl.NumberFormat('en-MY', {
                      style: 'currency',
                      currency: 'MYR',
                    }).format(val);

                  const isSelected = selectedAppIds.includes(app.id);

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/90 transition group ${
                        isSelected ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      {/* Checkbox for HQ Selection */}
                      {isHQ && (
                        <td className="p-3.5 pl-4 w-10 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectOne(app.id)}
                            className="cursor-pointer"
                            title="Pilih rekod ini untuk tindakan HQ"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Ref No & Title */}
                      <td className={`p-3.5 ${isHQ ? 'pl-2' : 'pl-4'} max-w-xs`}>
                        <div className="font-mono text-[11px] text-red-800 font-bold mb-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{app.referenceNo}</span>
                          {isHQ && app.applicantName && (
                            <span className="text-[10px] font-sans font-normal text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {app.applicantName}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-2">{app.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Tahun {app.year} • {app.allocationType}</span>
                        </div>
                      </td>

                      {/* Department & Category */}
                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate" title={app.department}>
                          {app.department}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {app.expenditureCategoryCode} ({app.expenditureCategoryName})
                        </div>
                      </td>

                      {/* Method & Type */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          Kaedah: <strong className="text-slate-900">{app.procurementMethod}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Jenis: <strong className="text-slate-700">{app.serviceType}</strong>
                        </div>
                      </td>

                      {/* Expected Invitation */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          {app.expectedInvitationMonth} {app.expectedInvitationYear}
                        </div>
                      </td>

                      {/* Estimated Cost (Original vs Adjusted Transparency) */}
                      <td className="p-3.5 font-mono text-xs">
                        {isAdjusted ? (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-sm">{formatRM(activeCost)}</div>
                            <div className="text-[10px] text-slate-500 font-sans">
                              Asal: <span className="line-through font-mono">{formatRM(originalCost)}</span>
                            </div>
                            <div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5 ${
                                  direction === 'reduced'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}
                                title={`Penyelarasan oleh HQ Review: ${direction === 'reduced' ? 'Diturunkan' : 'Dinaikkan'} sebanyak ${formatRM(Math.abs(diffCost))}`}
                              >
                                {direction === 'reduced' ? (
                                  <>
                                    <TrendingDown className="w-3 h-3 text-amber-600" />
                                    Diturunkan (-{formatRM(Math.abs(diffCost))})
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp className="w-3 h-3 text-blue-600" />
                                    Dinaikkan (+{formatRM(diffCost)})
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-emerald-700 text-sm">{formatRM(activeCost)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{getStatusBadge(app.status)}</td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenDetailModal(app)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition inline-flex items-center gap-1"
                            title="Lihat Butiran Permohonan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {app.status === 'Draft' && !isHQ && (
                            <button
                              onClick={() => {
                                onSubmitDraft(app.id);
                                alert(`Permohonan ${app.referenceNo} telah dihantar ke Portal HQ untuk kelulusan.`);
                              }}
                              className="px-2.5 py-1 text-white bg-red-800 hover:bg-red-900 rounded-md transition inline-flex items-center gap-1.5 font-bold text-xs shadow-sm ring-1 ring-red-700"
                              title="Hantar Permohonan ke HQ untuk Semakan & Kelulusan"
                            >
                              <Send className="w-3 h-3 text-amber-300" />
                              <span>Hantar</span>
                            </button>
                          )}

                          {/* Edit button */}
                          {(!isHQ || app.status === 'Draft') && (
                            <button
                              onClick={() => onOpenEditForm(app)}
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition"
                              title="Kemaskini Permohonan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* HQ Actions (Adjust Amount & Delete) */}
                          {isHQ && (
                            <>
                              {onOpenAdjustAmount && (
                                <button
                                  onClick={() => onOpenAdjustAmount(app)}
                                  className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition inline-flex items-center gap-1"
                                  title="Laras Amaun Permohonan Ini (HQ Review)"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleTriggerSingleDelete(app)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-xs transition inline-flex items-center gap-1"
                                title="Padam rekod permohonan ini secara kekal (HQ Deletion)"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="hidden sm:inline">Padam</span>
                              </button>
                            </>
                          )}
                          {/* Note: Delete function is intentionally removed from Applicant Action section per requirements */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
