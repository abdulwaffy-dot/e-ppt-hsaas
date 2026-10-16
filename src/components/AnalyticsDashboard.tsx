import React, { useState, useMemo } from 'react';
import { ProcurementApplication, EXPENDITURE_CATEGORIES, UPM_DEPARTMENTS, AnnualBudgets } from '../types';
import { exportHQReportToExcel, exportHQReportToPDF } from '../utils/exportUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  Filter,
  Layers,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Sliders,
} from 'lucide-react';

import { UserProfile } from '../types';

interface AnalyticsDashboardProps {
  applications: ProcurementApplication[];
  user?: UserProfile;
  annualBudgets?: AnnualBudgets;
  onOpenBudgetModal?: () => void;
}

const COLORS = [
  '#0284c7',
  '#0d9488',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#9333ea',
  '#4f46e5',
  '#2563eb',
  '#059669',
  '#d97706',
  '#b91c1c',
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  applications,
  user,
  annualBudgets,
  onOpenBudgetModal,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter applications according to user filters
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchYear = selectedYear === 'ALL' || app.year.toString() === selectedYear;
      const matchDept = selectedDept === 'ALL' || app.department === selectedDept;
      const matchCat = selectedCategory === 'ALL' || app.expenditureCategoryCode === selectedCategory;
      return matchYear && matchDept && matchCat;
    });
  }, [applications, selectedYear, selectedDept, selectedCategory]);

  // Summary Metrics
  const totalApplicationsCount = filteredApps.length;
  const totalValueRM = filteredApps.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  const approvedValueRM = filteredApps
    .filter((a) => a.status === 'Approved')
    .reduce((acc, curr) => acc + curr.estimatedCost, 0);

  const pendingValueRM = filteredApps
    .filter((a) => a.status === 'Submitted')
    .reduce((acc, curr) => acc + curr.estimatedCost, 0);

  const avgCostRM = totalApplicationsCount > 0 ? totalValueRM / totalApplicationsCount : 0;

  // Chart 1 Data: Expenditure Categories Distribution
  const categoryData = useMemo(() => {
    const map: Record<string, { code: string; name: string; value: number; count: number }> = {};

    EXPENDITURE_CATEGORIES.forEach((cat) => {
      map[cat.code] = { code: cat.code, name: cat.name, value: 0, count: 0 };
    });

    filteredApps.forEach((app) => {
      if (!map[app.expenditureCategoryCode]) {
        map[app.expenditureCategoryCode] = {
          code: app.expenditureCategoryCode,
          name: app.expenditureCategoryName,
          value: 0,
          count: 0,
        };
      }
      map[app.expenditureCategoryCode].value += app.estimatedCost;
      map[app.expenditureCategoryCode].count += 1;
    });

    return Object.values(map).filter((item) => item.value > 0);
  }, [filteredApps]);

  // Chart 2 Data: Costs by Department
  const departmentData = useMemo(() => {
    const deptMap: Record<string, { department: string; cost: number; count: number }> = {};

    filteredApps.forEach((app) => {
      if (!deptMap[app.department]) {
        deptMap[app.department] = { department: app.department, cost: 0, count: 0 };
      }
      deptMap[app.department].cost += app.estimatedCost;
      deptMap[app.department].count += 1;
    });

    return Object.values(deptMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // top 10 for clean presentation
  }, [filteredApps]);

  // Chart 3 Data: Estimated Costs by Year
  const yearData = useMemo(() => {
    const yearMap: Record<number, { year: string; Approved: number; Pending: number; Rejected: number }> = {
      2025: { year: '2025', Approved: 0, Pending: 0, Rejected: 0 },
      2026: { year: '2026', Approved: 0, Pending: 0, Rejected: 0 },
      2027: { year: '2027', Approved: 0, Pending: 0, Rejected: 0 },
    };

    filteredApps.forEach((app) => {
      if (!yearMap[app.year]) {
        yearMap[app.year] = { year: app.year.toString(), Approved: 0, Pending: 0, Rejected: 0 };
      }
      if (app.status === 'Approved') yearMap[app.year].Approved += app.estimatedCost;
      if (app.status === 'Submitted') yearMap[app.year].Pending += app.estimatedCost;
      if (app.status === 'Rejected') yearMap[app.year].Rejected += app.estimatedCost;
    });

    return Object.values(yearMap);
  }, [filteredApps]);

  // Chart 4 Data: Status Breakdown Count
  const statusData = useMemo(() => {
    const counts = { Approved: 0, Submitted: 0, Rejected: 0, Draft: 0 };
    filteredApps.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return [
      { name: 'Approved', value: counts.Approved, color: '#16a34a' },
      { name: 'Pending HQ', value: counts.Submitted, color: '#d97706' },
      { name: 'Rejected', value: counts.Rejected, color: '#dc2626' },
      { name: 'Draft', value: counts.Draft, color: '#64748b' },
    ];
  }, [filteredApps]);

  const formatCurrencyRM = (val: number) => {
    if (val >= 1000000) return `RM ${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `RM ${(val / 1000).toFixed(1)}k`;
    return `RM ${val.toFixed(0)}`;
  };

  const exportReportCSV = () => {
    const headers = [
      'Reference No',
      'Title',
      'Department',
      'Procurement Year',
      'Allocation',
      'Method',
      'Service Type',
      'Category Code',
      'Category Name',
      'Original Requested Cost (RM)',
      'Revised Cost (RM)',
      'Difference (RM)',
      'Adjustment Status',
      'Status',
    ];

    const rows = filteredApps.map((a) => {
      const origCost = a.originalEstimatedCost ?? a.estimatedCost;
      const revCost = a.estimatedCost;
      const diff = revCost - origCost;
      const adjStatus =
        a.isAmountAdjusted || Math.abs(diff) > 0.01
          ? diff < 0
            ? 'Reduced'
            : 'Increased'
          : 'Original';

      return [
        `"${a.referenceNo}"`,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${a.department}"`,
        a.year,
        `"${a.allocationType}"`,
        a.procurementMethod,
        a.serviceType,
        a.expenditureCategoryCode,
        `"${a.expenditureCategoryName}"`,
        origCost,
        revCost,
        diff,
        adjStatus,
        a.status,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UPM_Procurement_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <PieChartIcon className="w-4 h-4 text-amber-400" />
            Cost & Category Analytics Dashboard
          </div>
          <h1 className="text-xl font-bold tracking-tight">UPM Procurement Expenditure Analytics</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time visual distribution of procurement applications across expenditure categories, departments, and financial years.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportHQReportToExcel({
                applications: filteredApps,
                annualBudgets,
                yearFilter: selectedYear,
                deptFilter: selectedDept,
                statusFilter: selectedCategory,
              })
            }
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow transition flex items-center gap-1.5"
            title="Export filtered analytics report to Excel workbook (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() =>
              exportHQReportToPDF({
                applications: filteredApps,
                annualBudgets,
                yearFilter: selectedYear,
                deptFilter: selectedDept,
                statusFilter: selectedCategory,
              })
            }
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow border border-slate-700 transition flex items-center gap-1.5"
            title="Export formatted PDF report (.pdf)"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>PDF (.pdf)</span>
          </button>

          <button
            onClick={exportReportCSV}
            className="bg-slate-900 hover:bg-black text-slate-300 font-medium px-3.5 py-2 rounded-lg text-xs transition flex items-center gap-1.5 border border-slate-700"
            title="Export CSV data"
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* View-Only Alert for Department Users */}
      {user?.role !== 'hq' && (
        <div className="bg-slate-100 border border-slate-200/90 rounded-xl p-3.5 text-slate-800 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-slate-600 shrink-0" />
            <span>
              <strong>View-Only Analytics View:</strong> Department users can view real-time procurement expenditure charts, distributions, and export CSV reports.
            </span>
          </div>
          <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wide">
            Read-Only Dashboard
          </span>
        </div>
      )}

      {/* Interactive Global Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-red-700" />
          <span>Analytics Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600/30"
          >
            <option value="ALL">All Fiscal Years</option>
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y.toString()}>
                Year {y}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600/30 max-w-[220px]"
          >
            <option value="ALL">All 27 Departments</option>
            {UPM_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-red-600/30 max-w-[220px]"
          >
            <option value="ALL">All Expenditure Categories</option>
            {EXPENDITURE_CATEGORIES.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {annualBudgets && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                HQ Determined Budget Ceiling ({selectedYear === 'ALL' ? 'Fiscal Year 2026' : `Year ${selectedYear}`})
              </div>
              <div className="text-xl font-black font-mono text-white">
                RM {(annualBudgets[selectedYear === 'ALL' ? 2026 : parseInt(selectedYear, 10)] || 2500000).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-300">
                Approved: RM {approvedValueRM.toLocaleString()} ({Math.min(100, Math.round((approvedValueRM / (annualBudgets[selectedYear === 'ALL' ? 2026 : parseInt(selectedYear, 10)] || 1)) * 100))}% utilized)
              </div>
            </div>
          </div>

          {onOpenBudgetModal && user?.role === 'hq' && (
            <button
              onClick={onOpenBudgetModal}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Adjust HQ Annual Budgets
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Procurement Value</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalValueRM)}
          </div>
          <p className="text-[10px] text-slate-500">{totalApplicationsCount} total applications submitted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved Value (RM)
          </span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(approvedValueRM)}
          </div>
          <p className="text-[10px] text-slate-500">
            {approvedValueRM > 0 ? `${((approvedValueRM / (totalValueRM || 1)) * 100).toFixed(1)}% of total budget` : '0%'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending HQ Value (RM)
          </span>
          <div className="text-xl font-extrabold text-amber-800 font-mono">
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(pendingValueRM)}
          </div>
          <p className="text-[10px] text-slate-500">Awaiting Bursar decision</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average Application Cost</span>
          <div className="text-xl font-extrabold text-slate-800 font-mono">
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(avgCostRM)}
          </div>
          <p className="text-[10px] text-slate-500">Per procurement title</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Expenditure Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-red-700" />
                Expenditure Categories Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">
                Value distribution by standard category codes (e.g. Assets, Services, Maintenance)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expenditure data available for selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ code, percent }) => `${code} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value),
                      'Estimated Value',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Legend List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
            {categoryData.map((cat, idx) => (
              <div key={cat.code} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-800 truncate">
                    {cat.code}: {cat.name}
                  </span>
                </div>
                <span className="font-mono text-slate-600 font-bold ml-2 shrink-0">
                  {formatCurrencyRM(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Costs by Department */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                Estimated Costs by Department
              </h3>
              <p className="text-[11px] text-slate-500">Top departments by total requested procurement budget</p>
            </div>
          </div>

          <div className="h-80 w-full">
            {departmentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No department data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={formatCurrencyRM}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={110}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(val) => (val.length > 18 ? val.substring(0, 18) + '...' : val)}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value),
                      'Total Budget',
                    ]}
                  />
                  <Bar dataKey="cost" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {departmentData.map((_, index) => (
                      <Cell key={`dept-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Costs by Fiscal Year & Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Expenditure by Year & Status
              </h3>
              <p className="text-[11px] text-slate-500">Comparison of Approved vs Pending vs Rejected budgets</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatCurrencyRM} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [
                    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value),
                  ]}
                />
                <Legend />
                <Bar dataKey="Approved" fill="#16a34a" name="Approved (RM)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#d97706" name="Pending HQ (RM)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#dc2626" name="Rejected (RM)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Application Status Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Application Volume by Status
              </h3>
              <p className="text-[11px] text-slate-500">Proportion of application states in system</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
