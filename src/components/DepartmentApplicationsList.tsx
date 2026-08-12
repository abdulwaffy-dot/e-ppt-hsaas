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
  User,
  Mail,
} from 'lucide-react';

interface DepartmentApplicationsListProps {
  applications: ProcurementApplication[];
  user: UserProfile;
  onOpenNewForm: () => void;
  onOpenEditForm: (app: ProcurementApplication) => void;
  onOpenDetailModal: (app: ProcurementApplication) => void;
  onDeleteApplication: (id: string) => void;
  onSubmitDraft: (id: string) => void;
}

export const DepartmentApplicationsList: React.FC<DepartmentApplicationsListProps> = ({
  applications,
  user,
  onOpenNewForm,
  onOpenEditForm,
  onOpenDetailModal,
  onDeleteApplication,
  onSubmitDraft,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilterState, setDeptFilterState] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Strict Privacy & Data Isolation:
  // For applicants, ONLY return applications whose applicantName AND applicantEmail match this logged-in applicant.
  const userOwnedApps = applications.filter((app) => {
    if (user.role === 'hq') return true; // HQ has authorized global administrative oversight
    
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
      app.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || app.year.toString() === yearFilter;

    return matchesDept && matchesSearch && matchesStatus && matchesYear;
  });

  const totalCost = filteredApps.reduce((acc, curr) => acc + curr.estimatedCost, 0);
  const myDraftCount = userOwnedApps.filter((a) => a.status === 'Draft').length;
  const myApprovedCount = userOwnedApps.filter((a) => a.status === 'Approved').length;
  const myPendingCount = userOwnedApps.filter((a) => a.status === 'Submitted').length;
  const myRejectedCount = userOwnedApps.filter((a) => a.status === 'Rejected').length;

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
              Nama Pemohon: <strong className="text-white ml-1">{user.name}</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-[11px]">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              {user.email}
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

      {/* Security and Confidentiality Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-600/40 rounded-xl p-3.5 text-xs text-emerald-100 flex items-start sm:items-center gap-3 shadow-sm">
        <div className="p-2 bg-emerald-900/60 rounded-lg border border-emerald-500/40 text-emerald-300 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Akses Privasi & Keselamatan Pemohon Aktif
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Maklumat permohonan pemohon lain dilindungi dan disekat. Anda hanya boleh melihat dan mengurus permohonan PPT yang sepadan dengan <strong>Nama Rasmi ({user.name})</strong> dan <strong>Emel Rasmi Institusi ({user.email})</strong> yang anda masukkan.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards for Current Applicant */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Permohonan Saya</span>
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
              placeholder="Cari tajuk permohonan, no. rujukan, kategori..."
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

        {/* Draft Notice if any unsubmitted drafts exist */}
        {myDraftCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>
                <strong>Perhatian:</strong> Anda mempunyai <strong>{myDraftCount}</strong> permohonan dalam status{' '}
                <span className="font-bold underline">Draf</span>. Pihak HQ <strong>hanya boleh melihat & meluluskan</strong> permohonan yang telah ditekan butang <strong>"Hantar ke HQ"</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Aggregate Summary Line */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2 px-1">
          <span>
            Memaparkan <strong className="text-slate-900">{filteredApps.length}</strong> daripada{' '}
            <strong className="text-slate-900">{userOwnedApps.length}</strong> permohonan rasmi milik{' '}
            <strong className="text-slate-900">{user.name}</strong>
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
              Tiada Rekod Permohonan PPT untuk {user.name}
            </div>
            <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
              {userOwnedApps.length === 0
                ? `Tiada sebarang permohonan PPT ditemui di bawah akaun rasmi ${user.name} (${user.email}). Sila klik butang di bawah untuk mencipta permohonan pertama anda.`
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
                  <th className="p-3.5 pl-4">No. Rujukan & Tajuk</th>
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
                  const formattedRM = new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(app.estimatedCost);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition group">
                      {/* Ref No & Title */}
                      <td className="p-3.5 pl-4 max-w-xs">
                        <div className="font-mono text-[11px] text-red-800 font-bold mb-0.5">
                          {app.referenceNo}
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

                      {/* Estimated Cost */}
                      <td className="p-3.5 font-mono font-bold text-emerald-700 text-sm">
                        {formattedRM}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{getStatusBadge(app.status)}</td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right space-x-1">
                        <button
                          onClick={() => onOpenDetailModal(app)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition inline-flex items-center gap-1"
                          title="Lihat Butiran Permohonan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {app.status === 'Draft' && (
                          <button
                            onClick={() => {
                              onSubmitDraft(app.id);
                              alert(`Permohonan ${app.referenceNo} telah dihantar ke Portal HQ untuk kelulusan.`);
                            }}
                            className="px-2.5 py-1 text-white bg-red-800 hover:bg-red-900 rounded-md transition inline-flex items-center gap-1.5 font-bold text-xs shadow-sm ring-1 ring-red-700"
                            title="Hantar Permohonan ke HQ untuk Semakan & Kelulusan"
                          >
                            <Send className="w-3 h-3 text-amber-300" />
                            <span>Hantar ke HQ</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenEditForm(app)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition"
                          title="Kemaskini Permohonan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded transition"
                          title="Padam Permohonan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
