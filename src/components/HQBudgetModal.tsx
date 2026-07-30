import React, { useState, useEffect } from 'react';
import { AnnualBudgets, ProcurementApplication, UserProfile } from '../types';
import {
  X,
  DollarSign,
  Calendar,
  Save,
  CheckCircle2,
  ShieldCheck,
  Plus,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HQBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  annualBudgets: AnnualBudgets;
  applications: ProcurementApplication[];
  user: UserProfile;
  onSaveBudgets: (newBudgets: AnnualBudgets) => void;
}

export const HQBudgetModal: React.FC<HQBudgetModalProps> = ({
  isOpen,
  onClose,
  annualBudgets,
  applications,
  user,
  onSaveBudgets,
}) => {
  const [budgets, setBudgets] = useState<AnnualBudgets>(annualBudgets);
  const [newYearInput, setNewYearInput] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setBudgets(annualBudgets);
    setSavedSuccess(false);
  }, [annualBudgets, isOpen]);

  if (!isOpen) return null;

  const isHQ = user.role === 'hq';

  const handleBudgetChange = (year: number, val: number) => {
    const clampedVal = Math.max(0, val);
    setBudgets((prev) => ({
      ...prev,
      [year]: clampedVal,
    }));
    setSavedSuccess(false);
  };

  const handleQuickAdd = (year: number, delta: number) => {
    if (!isHQ) return;
    const current = budgets[year] || 0;
    handleBudgetChange(year, current + delta);
  };

  const handleApplyPercentageAll = (percent: number) => {
    if (!isHQ) return;
    setBudgets((prev) => {
      const updated: AnnualBudgets = {};
      Object.keys(prev).forEach((yrStr) => {
        const yr = Number(yrStr);
        const curr = prev[yr] || 0;
        updated[yr] = Math.round(curr * (1 + percent / 100));
      });
      return updated;
    });
  };

  const handleAutoCoverSubmissions = () => {
    if (!isHQ) return;
    setBudgets((prev) => {
      const updated = { ...prev };
      Object.keys(prev).forEach((yrStr) => {
        const yr = Number(yrStr);
        const totalNeeded = applications
          .filter((a) => a.year === yr && (a.status === 'Approved' || a.status === 'Submitted'))
          .reduce((sum, a) => sum + a.estimatedCost, 0);
        
        // Ensure budget is at least totalNeeded or current, rounded to nearest 100k
        const rounded = Math.ceil(totalNeeded / 100000) * 100000;
        updated[yr] = Math.max(prev[yr] || 0, rounded > 0 ? rounded : 1000000);
      });
      return updated;
    });
  };

  const handleAddYear = (customYr?: number) => {
    const yr = customYr || parseInt(newYearInput, 10);
    if (yr && yr >= 2020 && yr <= 2050 && !budgets[yr]) {
      const highestExisting = Math.max(...Object.keys(budgets).map(Number), 2025);
      const prevYearBudget = budgets[highestExisting] || 2500000;
      setBudgets((prev) => ({
        ...prev,
        [yr]: prevYearBudget,
      }));
      setNewYearInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHQ) return;
    onSaveBudgets(budgets);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const sortedYears = Object.keys(budgets)
    .map(Number)
    .sort((a, b) => a - b);

  const highestYear = sortedYears.length > 0 ? Math.max(...sortedYears) : 2026;
  const nextSuggestedYear = highestYear + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">HQ Annual Budget Allocation Authority</h2>
              <p className="text-xs text-slate-300">Easily adjust and set official procurement budget ceilings for each fiscal year</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Annual budget allocations updated and applied system-wide!
            </div>
          )}

          {!isHQ && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Read-Only View: Only HQ Reviewers are authorized to modify annual budget ceilings.
            </div>
          )}

          {/* Quick Action Presets Bar */}
          {isHQ && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Easy Quick Adjustments & Automations:
                </span>
                <button
                  type="button"
                  onClick={handleAutoCoverSubmissions}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-red-600" /> Auto-Fit All Submissions
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyPercentageAll(5)}
                  className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded-lg transition"
                >
                  +5% Inflation Bump All
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPercentageAll(10)}
                  className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded-lg transition"
                >
                  +10% Expansion All
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPercentageAll(-5)}
                  className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded-lg transition"
                >
                  -5% Trim All
                </button>
              </div>
            </div>
          )}

          {/* Year-by-Year Budget Allocations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Fiscal Years & Budget Ceilings
              </span>
              <span className="text-[11px] text-slate-500">
                Total Allocated Across All Years:{' '}
                <strong className="text-slate-800 font-mono">
                  RM {Object.values(budgets).reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                </strong>
              </span>
            </div>

            {sortedYears.map((year) => {
              const approvedSum = applications
                .filter((a) => a.year === year && a.status === 'Approved')
                .reduce((acc, a) => acc + a.estimatedCost, 0);

              const pendingSum = applications
                .filter((a) => a.year === year && a.status === 'Submitted')
                .reduce((acc, a) => acc + a.estimatedCost, 0);

              const currentVal = budgets[year] || 0;
              const isOverBudget = approvedSum > currentVal;
              const utilizationPct = Math.min(100, Math.round((approvedSum / (currentVal || 1)) * 100));

              return (
                <div
                  key={year}
                  className={`p-4 rounded-xl border transition space-y-3 bg-white shadow-sm ${
                    isOverBudget ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-extrabold text-xs flex items-center justify-center">
                        {year}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Fiscal Year {year} Budget</h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Approved: <strong className="text-emerald-700">RM {approvedSum.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Pending: <strong className="text-amber-700">RM {pendingSum.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick increment buttons */}
                    {isHQ && (
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(year, 100000)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition"
                        >
                          +100k
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(year, 500000)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition"
                        >
                          +500k
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(year, 1000000)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition"
                        >
                          +1M
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(year, -200000)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition"
                        >
                          -200k
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input and slider */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-6 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        RM
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        disabled={!isHQ}
                        value={currentVal}
                        onChange={(e) => handleBudgetChange(year, parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 text-sm font-black font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-600"
                      />
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Utilization Progress</span>
                        <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}>
                          {utilizationPct}% ({isOverBudget ? 'Exceeded!' : 'Within Budget'})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOverBudget ? 'bg-rose-600' : utilizationPct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, utilizationPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom year */}
          {isHQ && (
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAddYear(nextSuggestedYear)}
                className="px-3.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-red-600" /> Quick Add Year {nextSuggestedYear}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Custom year:</span>
                <input
                  type="number"
                  placeholder="e.g. 2031"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="w-24 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
                />
                <button
                  type="button"
                  onClick={() => handleAddYear()}
                  className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            {isHQ && (
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Budget Allocations
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

