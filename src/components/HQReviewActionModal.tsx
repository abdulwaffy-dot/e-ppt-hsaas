import React, { useState, useEffect } from 'react';
import { ProcurementApplication, UserProfile, HQDecision } from '../types';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Building2,
  User,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Minus,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface HQReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ProcurementApplication | null;
  decisionType: 'Approved' | 'Rejected' | null;
  user: UserProfile;
  onSubmitDecision: (
    applicationId: string,
    decision: HQDecision,
    adjustedAmount?: number,
    adjustmentNote?: string
  ) => void;
}

export const HQReviewActionModal: React.FC<HQReviewActionModalProps> = ({
  isOpen,
  onClose,
  application,
  decisionType,
  user,
  onSubmitDecision,
}) => {
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdjustingAmount, setIsAdjustingAmount] = useState<boolean>(false);
  const [adjustedAmountInput, setAdjustedAmountInput] = useState<string>('');

  useEffect(() => {
    if (application) {
      setJustification('');
      setError(null);
      const currentCost = application.estimatedCost || 0;
      setAdjustedAmountInput(currentCost.toString());
      setIsAdjustingAmount(application.isAmountAdjusted || false);
    }
  }, [application, isOpen]);

  if (!isOpen || !application || !decisionType || user.role !== 'hq') return null;

  const isApprove = decisionType === 'Approved';
  const originalAmount = application.originalEstimatedCost ?? application.estimatedCost;
  const currentAdjustedNum = parseFloat(adjustedAmountInput) || 0;
  const difference = currentAdjustedNum - originalAmount;
  const percentage = originalAmount > 0 ? (difference / originalAmount) * 100 : 0;
  const isModified = Math.abs(difference) > 0.01;

  const direction: 'increased' | 'reduced' | 'unchanged' =
    difference < -0.01 ? 'reduced' : difference > 0.01 ? 'increased' : 'unchanged';

  const formatRM = (val: number) =>
    new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Justification is strictly required for every decision (whether approved or rejected).');
      return;
    }

    if (isApprove && isAdjustingAmount && currentAdjustedNum <= 0) {
      setError('Amaun yang dilaraskan mestilah lebih daripada RM 0.00.');
      return;
    }

    const decision: HQDecision = {
      status: decisionType,
      justification: justification.trim(),
      decidedBy: user.name,
      decidedByEmail: user.email,
      decisionDate: new Date().toISOString(),
    };

    const finalAdjustedAmount =
      isApprove && (isAdjustingAmount || isModified) ? currentAdjustedNum : undefined;

    onSubmitDecision(
      application.id,
      decision,
      finalAdjustedAmount,
      isModified ? `Diselaraskan semasa kelulusan HQ: ${justification.trim()}` : undefined
    );

    setJustification('');
    setError(null);
    onClose();
  };

  const handleApplyPreset = (percent: number) => {
    const calculated = Math.round(originalAmount * (1 + percent / 100) * 100) / 100;
    setAdjustedAmountInput(calculated.toString());
    setIsAdjustingAmount(true);
    setError(null);
  };

  const handleReset = () => {
    setAdjustedAmountInput(originalAmount.toString());
    setIsAdjustingAmount(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`p-5 px-6 text-white flex items-center justify-between ${
            isApprove ? 'bg-emerald-800' : 'bg-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {isApprove ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-300" />
            )}
            <div>
              <h3 className="font-bold text-base tracking-tight">
                HQ Decision: {isApprove ? 'Approve PPT Application' : 'Reject PPT Application'}
              </h3>
              <p className="text-xs text-slate-100 opacity-90">{application.referenceNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-black/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Application Summary Preview */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="font-bold text-slate-900 text-sm">{application.title}</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{application.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{application.applicantName}</span>
              </div>
              <div>
                <span className="text-slate-400">Amaun Asal: </span>
                <span className="font-mono font-bold text-slate-900">{formatRM(originalAmount)}</span>
              </div>
              <div>Category: {application.expenditureCategoryCode} - {application.expenditureCategoryName}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
              <strong>Applicant Remarks:</strong> {application.remarksJustification}
            </div>
          </div>

          {/* Amount Adjustment Section in HQ Approval */}
          {isApprove && (
            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-slate-900 text-xs">
                    Penyelarasan Amaun Permohonan (HQ Amount Adjustment)
                  </span>
                </div>
                {!isAdjustingAmount && !isModified ? (
                  <button
                    type="button"
                    onClick={() => setIsAdjustingAmount(true)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline cursor-pointer"
                  >
                    + Laras Amaun Kelulusan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Set Semula Asal
                  </button>
                )}
              </div>

              {/* Amount Comparison Display */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold block">Amaun Asal Dimohon</span>
                  <span className="font-mono font-bold text-slate-800">{formatRM(originalAmount)}</span>
                </div>

                <div
                  className={`p-2.5 border rounded-lg ${
                    direction === 'reduced'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : direction === 'increased'
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <span className="text-[10px] font-bold block opacity-80">Amaun Disemak / Dilaraskan</span>
                  <span className="font-mono font-bold">{formatRM(currentAdjustedNum)}</span>
                </div>
              </div>

              {/* If Adjusted, show Difference and Direction badge */}
              {isModified && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border text-[11px] font-semibold bg-white border-slate-200">
                  <span className="text-slate-600">Perbezaan Amaun:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                      direction === 'reduced'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {direction === 'reduced' ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        Diturunkan {formatRM(Math.abs(difference))} ({percentage.toFixed(1)}%)
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        Dinaikkan {formatRM(difference)} (+{percentage.toFixed(1)}%)
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Adjustment Input (Always editable or expandable) */}
              {(isAdjustingAmount || isModified) && (
                <div className="space-y-2 pt-1 border-t border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Amaun Diluluskan HQ (Adjusted Amount in RM):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-500 text-xs">RM</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adjustedAmountInput}
                      onChange={(e) => {
                        setAdjustedAmountInput(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-10 pr-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                      placeholder="Contoh: 45000.00"
                    />
                  </div>

                  {/* Shortcuts */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="text-slate-400">Pilihan Pantas:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(-5)}
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                    >
                      -5%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(-10)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold"
                    >
                      -10%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(-15)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold"
                    >
                      -15%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(-20)}
                      className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold"
                    >
                      -20%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(10)}
                      className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 font-semibold"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleConfirm} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  HQ Justification <span className="text-red-600">* (Mandatory)</span>
                </span>
                <span className="text-[10px] text-slate-500">Section 04 Compliance Requirement</span>
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={
                  isApprove
                    ? 'State justification for approval (e.g. Verified against Department Budget Allocation 14005, crucial for operational readiness)...'
                    : 'State justification for rejection (e.g. Budget limit exceeded, insufficient justification provided, or deferred to next fiscal year)...'
                }
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Reviewer: <strong className="text-slate-800">{user.name}</strong> (Perolehan HSAAS / HQ)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5 ${
                    isApprove ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {isApprove ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  Confirm {isApprove ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
