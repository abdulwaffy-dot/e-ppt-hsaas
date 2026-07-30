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
  const [deptFilterState, setDeptFilterState] = useState<string>('MY_DEPT');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  const filteredApps = applications.filter((app) => {
    // Department filtering: MY_DEPT shows user.department, ALL shows all, or specific department
    const matchesDept =
      deptFilterState === 'ALL'
        ? true
        : deptFilterState === 'MY_DEPT'
        ? app.department === user.department
        : app.department === deptFilterState;

    const matchesSearch =
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.expenditureCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || app.year.toString() === yearFilter;

    return matchesDept && matchesSearch && matchesStatus && matchesYear;
  });

  const totalCost = filteredApps.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending HQ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-bold">
            Draft
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
            Department PPT Application
          </div>
          <h1 className="text-xl font-bold tracking-tight">{user.department}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Create, manage, and submit Procurement Applications (PPT) for Hospital Sultan Abdul Aziz Shah.
          </p>
        </div>

        <button
          onClick={onOpenNewForm}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs shadow-md transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Procurement Application (PPT)</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, ref no, category..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
            />
          </div>

          {/* Department filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={deptFilterState}
              onChange={(e) => setDeptFilterState(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 max-w-[200px]"
            >
              <option value="MY_DEPT">My Dept ({user.department})</option>
              <option value="ALL">All 27 HSAAS Departments</option>
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
              <option value="ALL">All Statuses</option>
              <option value="Draft">Drafts</option>
              <option value="Submitted">Pending HQ</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Year filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">All Years</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y.toString()}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aggregate Summary Line */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2 px-1">
          <span>
            Showing <strong className="text-slate-900">{filteredApps.length}</strong> application(s) for{' '}
            <strong className="text-slate-900">{user.department}</strong>
          </span>

          <span className="font-semibold text-slate-900">
            Total Filtered Cost:{' '}
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
            <FilePlus className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-slate-700 font-bold text-sm">No Procurement Applications Found</div>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              No PPT applications found matching your criteria for {user.department}. Click below to create a new application.
            </p>
            <button
              onClick={onOpenNewForm}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold shadow hover:bg-red-900 transition"
            >
              <Plus className="w-4 h-4" /> Create New PPT Application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">Ref No / Title</th>
                  <th className="p-3.5">Category & Method</th>
                  <th className="p-3.5">Expected Invitation</th>
                  <th className="p-3.5">Estimated Cost</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => {
                  const formattedRM = new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(app.estimatedCost);

                  const isOwner = user && (
                    (app.applicantEmail && app.applicantEmail.toLowerCase() === user.email.toLowerCase()) ||
                    (!app.applicantEmail && app.applicantName && app.applicantName.toLowerCase() === user.name.toLowerCase()) ||
                    (!app.applicantEmail && !app.applicantName)
                  );

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition group">
                      {/* Ref No & Title */}
                      <td className="p-3.5 pl-4 max-w-xs">
                        <div className="font-mono text-[11px] text-red-800 font-bold mb-0.5">
                          {app.referenceNo}
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-2">{app.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Year {app.year} • {app.allocationType}</span>
                          <span>•</span>
                          <span className={isOwner ? "text-slate-600 font-medium" : "text-amber-800 font-semibold"}>
                            Pemohon: {app.applicantName || 'Pengguna'} {isOwner && '(Saya)'}
                          </span>
                        </div>
                      </td>

                      {/* Category & Method */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {app.expenditureCategoryCode} ({app.expenditureCategoryName})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Method: <span className="font-medium text-slate-700">{app.procurementMethod}</span> | Type:{' '}
                          <span className="font-medium text-slate-700">{app.serviceType}</span>
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
                          title="View Application Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {app.status === 'Draft' && (
                          isOwner ? (
                            <button
                              onClick={() => onSubmitDraft(app.id)}
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition inline-flex items-center gap-1 font-semibold text-[11px]"
                              title="Submit Draft to HQ"
                            >
                              <Send className="w-3.5 h-3.5" /> Submit
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 p-1 text-slate-400 bg-slate-100 rounded text-[10px]"
                              title={`Hanya pemohon asal (${app.applicantName}) boleh menghantar draf ini.`}
                            >
                              <Lock className="w-3 h-3 text-slate-400" /> Draft
                            </span>
                          )
                        )}

                        {isOwner ? (
                          <>
                            <button
                              onClick={() => onOpenEditForm(app)}
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition"
                              title="Edit Application"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded transition"
                              title="Delete Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-medium border border-slate-200"
                            title={`Akses Dibataskan: Permohonan ini milik ${app.applicantName}. Hanya pemohon asal yang boleh mengedit.`}
                          >
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="hidden sm:inline">Hak Milik {app.applicantName?.split(' ')[0] || 'Lain'}</span>
                          </span>
                        )}
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
