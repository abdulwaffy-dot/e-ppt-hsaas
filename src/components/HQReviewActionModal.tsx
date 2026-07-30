import React, { useState } from 'react';
import { ProcurementApplication, UserProfile, HQDecision } from '../types';
import { X, CheckCircle2, XCircle, AlertCircle, FileText, Building2, User, DollarSign } from 'lucide-react';

interface HQReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ProcurementApplication | null;
  decisionType: 'Approved' | 'Rejected' | null;
  user: UserProfile;
  onSubmitDecision: (applicationId: string, decision: HQDecision) => void;
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

  if (!isOpen || !application || !decisionType || user.role !== 'hq') return null;

  const isApprove = decisionType === 'Approved';

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Justification is strictly required for every decision (whether approved or rejected).');
      return;
    }

    const decision: HQDecision = {
      status: decisionType,
      justification: justification.trim(),
      decidedBy: user.name,
      decidedByEmail: user.email,
      decisionDate: new Date().toISOString(),
    };

    onSubmitDecision(application.id, decision);
    setJustification('');
    setError(null);
    onClose();
  };

  const formattedCost = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(application.estimatedCost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
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
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formattedCost}</span>
              </div>
              <div>Category: {application.expenditureCategoryCode} - {application.expenditureCategoryName}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
              <strong>Applicant Remarks:</strong> {application.remarksJustification}
            </div>
          </div>

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
                rows={4}
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
