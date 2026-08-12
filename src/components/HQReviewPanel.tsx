import React, { useState } from 'react';
import { ProcurementApplication, UserProfile, UPM_DEPARTMENTS, AnnualBudgets } from '../types';
import { exportHQReportToExcel, exportHQReportToPDF } from '../utils/exportUtils';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  DollarSign,
  AlertCircle,
  FileCheck,
  Settings,
  TrendingUp,
  Sliders,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';

interface HQReviewPanelProps {
  applications: ProcurementApplication[];
  user: UserProfile;
  annualBudgets: AnnualBudgets;
  onOpenActionModal: (app: ProcurementApplication, decision: 'Approved' | 'Rejected') => void;
  onOpenDetailModal: (app: ProcurementApplication) => void;
  onOpenBudgetModal: () => void;
}

export const HQReviewPanel: React.FC<HQReviewPanelProps> = ({
  applications,
  user,
  annualBudgets,
  onOpenActionModal,
  onOpenDetailModal,
  onOpenBudgetModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('Submitted');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Filter applications across all departments submitted to HQ
  const filteredApps = applications.filter((app) => {
    // Exclude unsubmitted drafts unless specifically filtering for ALL or Draft
    if (statusFilter !== 'ALL' && statusFilter !== 'Draft' && app.status === 'Draft') return false;

    const matchesSearch =
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || app.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || app.year.toString() === yearFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesYear;
  });

  const pendingCount = applications.filter((a) => a.status === 'Submitted').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const draftCount = applications.filter((a) => a.status === 'Draft').length;

  // Budget computations for selected year
  const activeYearNum = yearFilter === 'ALL' ? 2026 : parseInt(yearFilter, 10);
  const allocatedBudgetRM = annualBudgets[activeYearNum] || 2500000;

  const yearApprovedCost = applications
    .filter((a) => a.status === 'Approved' && (yearFilter === 'ALL' || a.year.toString() === yearFilter))
    .reduce((sum, a) => sum + a.estimatedCost, 0);

  const yearPendingCost = applications
    .filter((a) => a.status === 'Submitted' && (yearFilter === 'ALL' || a.year.toString() === yearFilter))
    .reduce((sum, a) => sum + a.estimatedCost, 0);

  const remainingBudgetRM = allocatedBudgetRM - yearApprovedCost;
  const utilizationRate = Math.min(100, Math.round((yearApprovedCost / (allocatedBudgetRM || 1)) * 100));

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
            Pending Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-bold inline-flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Draft (Dept Unsubmitted)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HQ Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Section 04: HQ Review & Approval Portal
          </div>
          <h1 className="text-xl font-bold tracking-tight">Bursar & Finance HQ Review Authority</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Review, evaluate, and issue official Justified Decisions (Approve / Reject) for department procurement applications.
          </p>
        </div>

        {/* HQ KPI Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-amber-950/80 border border-amber-700/60 rounded-lg p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Pending Review</span>
            <span className="text-lg font-bold text-amber-200">{pendingCount}</span>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-lg p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Approved</span>
            <span className="text-lg font-bold text-emerald-200">{approvedCount}</span>
          </div>

          <div className="bg-rose-950/80 border border-rose-700/60 rounded-lg p-3 text-center min-w-[100px]">
            <span className="text-[10px] text-rose-300 uppercase font-bold block">Rejected</span>
            <span className="text-lg font-bold text-rose-200">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* HQ Annual Budget Allocation Bar & Controls */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4 text-red-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Fiscal Year {activeYearNum} Budget Determination & Control
                {user.role === 'hq' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    HQ Authority Active
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300">
                    HQ Set Ceiling
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500">
                Official procurement budget ceiling set by Bursar & Finance HQ Authority
              </p>
            </div>
          </div>

          <div>
            {user.role === 'hq' ? (
              <button
                onClick={onOpenBudgetModal}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                Determine / Edit Budget Amounts
              </button>
            ) : (
              <button
                onClick={onOpenBudgetModal}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                View All Annual Budget Allocations
              </button>
            )}
          </div>
        </div>

        {/* Budget Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">
              HQ Set Annual Budget ({activeYearNum})
            </span>
            <span className="text-base font-extrabold text-slate-900">
              RM {allocatedBudgetRM.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-lg">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block mb-0.5">
              Approved Commitments
            </span>
            <span className="text-base font-extrabold text-emerald-900">
              RM {yearApprovedCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
              {utilizationRate}% of set budget
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-lg">
            <span className="text-[10px] text-amber-900 font-bold uppercase block mb-0.5">
              Pending Submissions
            </span>
            <span className="text-base font-extrabold text-amber-900">
              RM {yearPendingCost.toLocaleString()}
            </span>
          </div>

          <div className={`border p-3.5 rounded-lg ${remainingBudgetRM >= 0 ? 'bg-blue-50/70 border-blue-200' : 'bg-rose-50/70 border-rose-200'}`}>
            <span className={`text-[10px] font-bold uppercase block mb-0.5 ${remainingBudgetRM >= 0 ? 'text-blue-900' : 'text-rose-900'}`}>
              Available Unallocated Fund
            </span>
            <span className={`text-base font-extrabold ${remainingBudgetRM >= 0 ? 'text-blue-900' : 'text-rose-900'}`}>
              RM {remainingBudgetRM.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-600 block mt-0.5">
              {remainingBudgetRM >= 0 ? 'Remaining budget balance' : 'Exceeds HQ ceiling!'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600">
            <span>Budget Utilization Gauge</span>
            <span className="font-bold text-slate-800">{utilizationRate}% Used</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                utilizationRate > 90 ? 'bg-rose-600' : utilizationRate > 70 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, utilizationRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* View-Only Banner for Department Users */}
      {user.role !== 'hq' && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>View-Only HQ Approval Module:</strong> You are logged in as <strong>Department PPT Application</strong>. You can view all HQ decision logs and application statuses, but decision actions (Approve / Reject) are strictly reserved for HQ Reviewers.
            </span>
          </div>
          <span className="bg-amber-200 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wide">
            Read-Only Access
          </span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, ref no, applicant, department..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 max-w-[200px]"
            >
              <option value="ALL">All 27 Departments</option>
              {UPM_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="Submitted">Pending Review ({pendingCount})</option>
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved ({approvedCount})</option>
              <option value="Rejected">Rejected ({rejectedCount})</option>
              <option value="Draft">Unsubmitted Drafts</option>
            </select>

            {/* Year filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="ALL">All Years</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y.toString()}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export Report Buttons for HQ & Dept Users */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
            <button
              onClick={() =>
                exportHQReportToExcel({
                  applications: filteredApps,
                  annualBudgets,
                  yearFilter,
                  deptFilter,
                  statusFilter,
                })
              }
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
              title="Export filtered HQ report to Microsoft Excel workbook (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() =>
                exportHQReportToPDF({
                  applications: filteredApps,
                  annualBudgets,
                  yearFilter,
                  deptFilter,
                  statusFilter,
                })
              }
              className="px-3 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
              title="Export formatted official PDF report with signature box (.pdf)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Export PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs for Status */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('Submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'Submitted'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'Submitted' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Statuses</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-800">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'Approved'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'Approved' ? 'bg-emerald-900 text-white' : 'bg-emerald-200 text-emerald-900'
            }`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'Rejected'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'Rejected' ? 'bg-rose-900 text-white' : 'bg-rose-200 text-rose-900'
            }`}>
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'Draft'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Department Drafts</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === 'Draft' ? 'bg-purple-900 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {draftCount}
            </span>
          </button>

          {(searchTerm || deptFilter !== 'ALL' || statusFilter !== 'Submitted' || yearFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDeptFilter('ALL');
                setStatusFilter('Submitted');
                setYearFilter('ALL');
              }}
              className="ml-auto text-xs text-red-700 hover:text-red-900 font-semibold underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2 px-1">
          <span>
            HQ Reviewing <strong className="text-slate-900">{filteredApps.length}</strong> application(s)
          </span>
          <span className="font-semibold text-slate-900">
            Total Approved Budget:{' '}
            <strong className="text-emerald-700 font-mono text-sm ml-1">
              {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(yearApprovedCost)}
            </strong>
          </span>
        </div>
      </div>

      {/* HQ Applications Review Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-slate-800 font-bold text-sm">Tiada Permohonan Dijumpai (No Applications Found)</div>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Tiada permohonan PPT yang sepadan dengan tapisan semasa ({statusFilter === 'Submitted' ? 'Pending Review' : statusFilter}).
              Jika staf baru sahaja mengisi permohonan, pastikan mereka telah menekan butang <strong>"Hantar ke HQ"</strong> (bukan sekadar Simpan Draf).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDeptFilter('ALL');
                  setStatusFilter('ALL');
                  setYearFilter('ALL');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Papar Semua Permohonan (All Statuses)
              </button>
              {draftCount > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDeptFilter('ALL');
                    setStatusFilter('Draft');
                    setYearFilter('ALL');
                  }}
                  className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-lg text-xs font-semibold transition"
                >
                  Lihat {draftCount} Draf Jabatan (View Drafts)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Ref No & Title</th>
                  <th className="p-3.5">Department & Submitter</th>
                  <th className="p-3.5">Category & Method</th>
                  <th className="p-3.5">Estimated Cost</th>
                  <th className="p-3.5">Status & HQ Justification</th>
                  <th className="p-3.5 pr-4 text-right">HQ Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => {
                  const formattedRM = new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(app.estimatedCost);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/90 transition group">
                      {/* Ref No & Title */}
                      <td className="p-3.5 pl-4 max-w-xs">
                        <div className="font-mono text-[11px] text-amber-700 font-bold mb-0.5">
                          {app.referenceNo}
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-2">{app.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Year {app.year} • {app.allocationType}
                        </div>
                      </td>

                      {/* Department & Submitter */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{app.department}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Applicant: <span className="font-medium">{app.applicantName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{app.applicantEmail}</div>
                      </td>

                      {/* Category & Method */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {app.expenditureCategoryCode} ({app.expenditureCategoryName})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {app.procurementMethod} • {app.serviceType}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Invite: {app.expectedInvitationMonth} {app.expectedInvitationYear}
                        </div>
                      </td>

                      {/* Estimated Cost */}
                      <td className="p-3.5 font-mono font-bold text-emerald-700 text-sm">
                        {formattedRM}
                      </td>

                      {/* Status & HQ Justification */}
                      <td className="p-3.5 max-w-xs">
                        {getStatusBadge(app.status)}
                        {app.hqDecision && (
                          <div className="mt-1.5 p-2 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 space-y-0.5">
                            <div className="font-semibold text-slate-900 text-[10px] uppercase">
                              Justification by {app.hqDecision.decidedBy}:
                            </div>
                            <div className="italic line-clamp-2">"{app.hqDecision.justification}"</div>
                          </div>
                        )}
                      </td>

                      {/* HQ Action Buttons */}
                      <td className="p-3.5 pr-4 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenDetailModal(app)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition inline-flex items-center gap-1"
                          title="View Full Application Info"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {app.status === 'Submitted' && user.role === 'hq' ? (
                          <div className="inline-flex items-center gap-1 mt-1 sm:mt-0">
                            <button
                              onClick={() => onOpenActionModal(app, 'Approved')}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>

                            <button
                              onClick={() => onOpenActionModal(app, 'Rejected')}
                              className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          user.role !== 'hq' && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                              View Only
                            </span>
                          )
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
