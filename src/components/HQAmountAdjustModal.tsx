import React, { useState, useEffect } from 'react';
import { ProcurementApplication, UserProfile, AmountAdjustment } from '../types';
import {
  X,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  FileText,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  Info,
  RotateCcw,
} from 'lucide-react';

interface HQAmountAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ProcurementApplication | null;
  user: UserProfile;
  onConfirmAdjustment: (
    applicationId: string,
    newAmount: number,
    justification: string
  ) => void;
}

export const HQAmountAdjustModal: React.FC<HQAmountAdjustModalProps> = ({
  isOpen,
  onClose,
  application,
  user,
  onConfirmAdjustment,
}) => {
  const [adjustedCostInput, setAdjustedCostInput] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      // If already adjusted, prefill with current adjusted cost or estimated cost
      const currentVal = application.estimatedCost || 0;
      setAdjustedCostInput(currentVal.toString());
      setJustification('');
      setError(null);
    }
  }, [application, isOpen]);

  if (!isOpen || !application || user.role !== 'hq') return null;

  const originalAmount = application.originalEstimatedCost ?? application.estimatedCost;
  const currentAdjustedNumber = parseFloat(adjustedCostInput) || 0;
  const difference = currentAdjustedNumber - originalAmount;
  const percentage = originalAmount > 0 ? (difference / originalAmount) * 100 : 0;

  const direction: 'increased' | 'reduced' | 'unchanged' =
    difference < -0.01 ? 'reduced' : difference > 0.01 ? 'increased' : 'unchanged';

  const formatRM = (val: number) =>
    new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val);

  const handleApplyPreset = (percent: number) => {
    const calculated = Math.round(originalAmount * (1 + percent / 100) * 100) / 100;
    setAdjustedCostInput(calculated.toString());
    setError(null);
  };

  const handleResetToOriginal = () => {
    setAdjustedCostInput(originalAmount.toString());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAdjustedNumber <= 0) {
      setError('Amaun pelarasan mestilah lebih besar daripada RM 0.00.');
      return;
    }
    if (!justification.trim()) {
      setError('Sila nyatakan justifikasi atau sebab pelarasan amaun untuk rekod audit integriti.');
      return;
    }

    onConfirmAdjustment(application.id, currentAdjustedNumber, justification.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-300">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">
                  Penyelarasan Amaun Permohonan (HQ Review)
                </h3>
                <span className="text-[10px] bg-red-950 text-amber-300 border border-red-700 px-2 py-0.5 rounded-full font-bold">
                  {application.referenceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Laraskan siling amaun yang dimohon oleh jabatan sebelum kelulusan rasmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Application Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="font-bold text-slate-900 text-sm">{application.title}</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{application.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{application.applicantName}</span>
              </div>
            </div>
          </div>

          {/* Amount Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Original Requested Amount */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Amaun Asal Dimohon (Applicant)
              </span>
              <div className="text-base font-bold font-mono text-slate-800">
                {formatRM(originalAmount)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Dikemukakan oleh {application.applicantName}
              </span>
            </div>

            {/* Revised / Adjusted Amount Preview */}
            <div
              className={`border rounded-xl p-3.5 space-y-1 transition ${
                direction === 'reduced'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : direction === 'increased'
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                  : 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                Amaun Diselaraskan HQ (Adjusted)
              </span>
              <div className="text-base font-bold font-mono">
                {formatRM(currentAdjustedNumber)}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                {direction === 'reduced' ? (
                  <span className="inline-flex items-center gap-1 text-amber-800">
                    <TrendingDown className="w-3 h-3 text-amber-600" />
                    Diturunkan {formatRM(Math.abs(difference))} ({percentage.toFixed(1)}%)
                  </span>
                ) : direction === 'increased' ? (
                  <span className="inline-flex items-center gap-1 text-blue-800">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    Dinaikkan {formatRM(difference)} (+{percentage.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-800">
                    <Minus className="w-3 h-3" /> Tiada Perubahan (0.0%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Input for New Amount */}
          <div className="space-y-2 bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <label className="block font-bold text-slate-900 text-xs">
              Masukkan Amaun Baharu Ditetapkan HQ (RM) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-xs">RM</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={adjustedCostInput}
                onChange={(e) => {
                  setAdjustedCostInput(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                placeholder="Contoh: 45000.00"
                required
              />
            </div>

            {/* Quick Adjustment Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-500 font-medium mr-1 text-[10px]">Pilihan Pantas:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(-10)}
                className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold transition"
              >
                -10%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(-15)}
                className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold transition"
              >
                -15%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(-20)}
                className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold transition"
              >
                -20%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(10)}
                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 font-semibold transition"
              >
                +10%
              </button>
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium inline-flex items-center gap-1 transition ml-auto"
                title="Kembalikan kepada amaun asal yang dipohon"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Set Semula Asal
              </button>
            </div>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Justifikasi Penyelarasan Amaun oleh HQ <span className="text-red-600">* (Wajib)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Section 04 Audit Trail</span>
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nyatakan sebab pelarasan amaun (contoh: Penyelarasan siling peruntukan belanjawan 14005, pengurangan skop bekalan mengikut sebut harga semasa, atau persetujuan rundingan)..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
              required
            />
          </div>

          {/* Transparency Guarantee Note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-900">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Ketelusan & Pemberitahuan Pemohon Jabatan
            </div>
            <p className="leading-relaxed text-slate-700">
              Amaun yang dilaraskan ini akan <strong>dipaparkan serta-merta kepada pemohon jabatan</strong> ({application.applicantName})
              berserta amaun asal, amaun yang disemak, dan perbezaan nilainya sebelum kelulusan akhir diberikan.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              Pegawai HQ: <strong className="text-slate-800">{user.name}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold shadow transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                Sahkan & Simpan Penyelarasan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
