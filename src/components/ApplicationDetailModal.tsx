import React from 'react';
import { ProcurementApplication, UserProfile } from '../types';
import {
  X,
  Building2,
  User,
  Mail,
  Calendar,
  Tag,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  DollarSign,
  Edit2,
  Trash2,
  Lock,
  TrendingDown,
  TrendingUp,
  Minus,
  Sliders,
  History,
  AlertCircle,
  Info,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ProcurementApplication | null;
  user?: UserProfile;
  readOnly?: boolean;
  onEdit?: (app: ProcurementApplication) => void;
  onDelete?: (id: string) => void;
  onOpenAdjustAmount?: (app: ProcurementApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  user,
  readOnly = false,
  onEdit,
  onDelete,
  onOpenAdjustAmount,
}) => {
  if (!isOpen || !application) return null;

  const isOwner = user && application && (
    application.applicantName.trim().toLowerCase() === user.name.trim().toLowerCase() &&
    (!application.applicantEmail || application.applicantEmail.trim().toLowerCase() === user.email.trim().toLowerCase())
  );

  // If user is an applicant and NOT the owner of this application, block access completely
  if (user && user.role !== 'hq' && !isOwner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Akses Ditolak: Kerahsiaan Pemohon</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Maklumat permohonan PPT ini sulit dan tidak boleh dilihat oleh pemohon lain. Hanya pemohon yang memasukkan <strong>Nama Rasmi</strong> dan <strong>Emel Rasmi Institusi</strong> yang sepadan dibenarkan mengaksesnya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const originalCost = application.originalEstimatedCost ?? application.estimatedCost;
  const activeCost = application.estimatedCost;
  const isAdjusted = application.isAmountAdjusted || (application.originalEstimatedCost !== undefined && Math.abs(application.estimatedCost - application.originalEstimatedCost) > 0.01);
  const diffCost = activeCost - originalCost;
  const percentDiff = originalCost > 0 ? (diffCost / originalCost) * 100 : 0;
  const direction = diffCost < -0.01 ? 'reduced' : diffCost > 0.01 ? 'increased' : 'unchanged';

  const formatRM = (val: number) =>
    new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending HQ Review
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs text-amber-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {application.referenceNo}
              </span>
              {getStatusBadge(application.status)}
              {isAdjusted && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                    direction === 'reduced'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-blue-950 text-blue-300 border-blue-700'
                  }`}
                >
                  {direction === 'reduced' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  HQ Adjusted ({formatRM(activeCost)})
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white tracking-tight leading-snug">
              {application.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Main Key Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                {isAdjusted ? 'Revised Cost (HQ)' : 'Estimated Cost'}
              </span>
              <div className="text-base font-bold text-emerald-700 font-mono">{formatRM(activeCost)}</div>
              {isAdjusted && (
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Asal: <span className="line-through">{formatRM(originalCost)}</span>
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Procurement Method</span>
              <div className="font-bold text-slate-800 text-xs">
                {application.procurementMethod} (
                {application.procurementMethod === 'SH'
                  ? 'Quotation'
                  : application.procurementMethod === 'T'
                  ? 'Tender'
                  : 'Direct Purchase'}
                )
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Type of Allocation</span>
              <div className="font-bold text-slate-800 text-xs">{application.allocationType}</div>
            </div>
          </div>

          {/* Section: HQ Amount Adjustment & Transparency Notice (Displayed to Applicant & HQ) */}
          {isAdjusted ? (
            <div className="bg-gradient-to-r from-amber-50/90 via-white to-slate-50 border border-amber-300/80 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Penyelarasan Amaun oleh HQ Review (Amount Adjustment)
                    </h3>
                    <p className="text-[10px] text-slate-600">
                      Urus Setia HQ telah melaraskan amaun permohonan ini untuk ketelusan sebelum kelulusan
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border ${
                    direction === 'reduced'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  {direction === 'reduced' ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
                      Diturunkan oleh HQ (-{formatRM(Math.abs(diffCost))})
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                      Dinaikkan oleh HQ (+{formatRM(diffCost)})
                    </>
                  )}
                </span>
              </div>

              {/* Amount Breakdown Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    1. Amaun Asal Dimohon
                  </span>
                  <div className="font-mono text-sm font-bold text-slate-800 mt-0.5">
                    {formatRM(originalCost)}
                  </div>
                  <span className="text-[10px] text-slate-400">Dimohon oleh pemohon</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    2. Amaun Dilaraskan HQ
                  </span>
                  <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                    {formatRM(activeCost)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Amaun aktif semasa</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    3. Perbezaan Nilai
                  </span>
                  <div
                    className={`font-mono text-sm font-bold mt-0.5 ${
                      direction === 'reduced' ? 'text-amber-700' : 'text-blue-700'
                    }`}
                  >
                    {direction === 'reduced' ? '-' : '+'}
                    {formatRM(Math.abs(diffCost))} ({percentDiff.toFixed(1)}%)
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {direction === 'reduced' ? 'Pengurangan belanja' : 'Peningkatan had'}
                  </span>
                </div>
              </div>

              {/* Adjustment Details & Explanation */}
              <div className="p-2.5 bg-amber-100/40 rounded-lg border border-amber-200/60 text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  Makluman Ketelusan Pemohon:
                </div>
                <p className="leading-relaxed">
                  Penyelarasan amaun dilakukan berdasarkan siling peruntukan 14005 atau semakan skop teknikal oleh Urus Setia HQ.
                  {application.lastAdjustedBy && (
                    <span> Terakhir diselaraskan oleh <strong>{application.lastAdjustedBy}</strong>.</span>
                  )}
                </p>
              </div>

              {/* Audit Trail List of Adjustments */}
              {application.amountAdjustments && application.amountAdjustments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-900">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Kronologi & Log Audit Penyelarasan Amaun:
                  </div>
                  <div className="space-y-1.5">
                    {application.amountAdjustments.map((adj) => (
                      <div
                        key={adj.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>
                            Pegawai HQ: <strong className="text-slate-800">{adj.adjustedBy}</strong> ({adj.adjustedByEmail})
                          </span>
                          <span>{adj.dateFormatted || new Date(adj.adjustmentDate).toLocaleDateString('en-GB')} {adj.timeFormatted}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono font-bold text-slate-900 flex-wrap">
                          <span>{formatRM(adj.originalAmount)}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-700">{formatRM(adj.adjustedAmount)}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                              adj.direction === 'reduced'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {adj.direction === 'reduced' ? 'Diturunkan' : 'Dinaikkan'} ({formatRM(Math.abs(adj.differenceAmount))})
                          </span>
                        </div>
                        {adj.justification && (
                          <div className="text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{adj.justification}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : user?.role === 'hq' ? (
            /* HQ quick action to adjust amount if not yet adjusted */
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Amaun semasa masih pada nilai asal yang dipohon ({formatRM(originalCost)}).</span>
              </div>
              {onOpenAdjustAmount && (
                <button
                  type="button"
                  onClick={() => onOpenAdjustAmount(application)}
                  className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded text-[11px] font-bold shadow-xs transition inline-flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" /> Laras Amaun Ini
                </button>
              )}
            </div>
          ) : null}

          {/* Section 03 Application Breakdown */}
          <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-700" />
              Procurement Application Information (PPT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-500 block">Procurement Year:</span>
                <span className="font-semibold text-slate-900">{application.year}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Type of Service:</span>
                <span className="font-semibold text-slate-900">{application.serviceType}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Expenditure Category:</span>
                <span className="font-semibold text-slate-900">
                  {application.expenditureCategoryCode} - {application.expenditureCategoryName}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Expected Invitation:</span>
                <span className="font-semibold text-slate-900">
                  {application.expectedInvitationMonth} {application.expectedInvitationYear}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block mb-1 font-medium">Remarks / Justification:</span>
              <p className="bg-white p-3 rounded border border-slate-200 text-slate-800 leading-relaxed">
                {application.remarksJustification}
              </p>
            </div>
          </div>

          {/* Department & Submitter Details */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              Applicant & Department Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Department: <strong className="text-slate-900">{application.department}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Submitted by: <strong className="text-slate-900">{application.applicantName}</strong></span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.applicantEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submission Date: {new Date(application.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* HQ Review Decision Section (Section 04) */}
          <div className="bg-slate-900 text-white rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                04. HQ Review & Decision Trail
              </h3>
              {application.hqDecision ? (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    application.hqDecision.status === 'Approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}
                >
                  {application.hqDecision.status}
                </span>
              ) : (
                <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Awaiting Review
                </span>
              )}
            </div>

            {application.hqDecision ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">HQ Decision Justification:</span>
                  <p className="bg-slate-800 p-3 rounded border border-slate-700 text-slate-100 font-medium leading-relaxed mt-1">
                    "{application.hqDecision.justification}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Decided By: <strong className="text-white">{application.hqDecision.decidedBy}</strong></div>
                  <div>
                    Date:{' '}
                    <strong className="text-white">
                      {new Date(application.hqDecision.decisionDate).toLocaleString('en-GB')}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                This application is currently pending review by Bursar / HQ Finance authority.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        {(() => {
          const isOwner = user && application && (
            (application.applicantEmail && application.applicantEmail.toLowerCase() === user.email.toLowerCase()) ||
            (!application.applicantEmail && application.applicantName && application.applicantName.toLowerCase() === user.name.toLowerCase()) ||
            (!application.applicantEmail && !application.applicantName)
          );

          return (
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center flex-wrap gap-3">
              <div>
                {!readOnly && (
                  user?.role === 'hq' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenAdjustAmount && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAdjustAmount(application);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition flex items-center gap-1.5"
                          title="Laras Amaun Permohonan Ini Sebagai HQ"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Laras Amaun (Adjust Amount)
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onClose();
                            onDelete(application.id);
                          }}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
                          title="Padam Permohonan Ini Sebagai HQ Reviewer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Padam Permohonan (HQ Delete)
                        </button>
                      )}
                    </div>
                  ) : onEdit && isOwner && application.status === 'Draft' ? (
                    /* Applicant: Only edit permitted for Drafts; Delete function removed per requirements */
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(application);
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Permohonan (Draft)
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium">
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {application.status === 'Submitted' || application.status === 'Approved'
                          ? 'Permohonan telah dihantar/diluluskan dan berada dalam kawalan semakan HQ.'
                          : `Hak Milik Terhad: Dimiliki oleh ${application.applicantName}.`}
                      </span>
                    </div>
                  )
                )}
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow transition ml-auto"
              >
                Close Window
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
