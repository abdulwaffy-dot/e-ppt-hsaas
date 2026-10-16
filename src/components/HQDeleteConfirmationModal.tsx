import React, { useState } from 'react';
import { ProcurementApplication, UserProfile, DeletionReasonCategory } from '../types';
import {
  AlertTriangle,
  Trash2,
  X,
  Building2,
  DollarSign,
  ShieldAlert,
  UserCheck,
  FileText,
  Clock,
  Check,
} from 'lucide-react';

interface HQDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationsToDelete: ProcurementApplication[];
  hqUser: UserProfile;
  onConfirmDelete: (
    apps: ProcurementApplication[],
    reasonCategory: DeletionReasonCategory,
    reasonText: string
  ) => void;
}

export const HQDeleteConfirmationModal: React.FC<HQDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  applicationsToDelete,
  hqUser,
  onConfirmDelete,
}) => {
  const [reasonCategory, setReasonCategory] =
    useState<DeletionReasonCategory>('unnecessary');
  const [reasonText, setReasonText] = useState('');
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || applicationsToDelete.length === 0) return null;

  const isBatch = applicationsToDelete.length > 1;
  const totalCost = applicationsToDelete.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);

  const getSuggestedReason = (cat: DeletionReasonCategory) => {
    switch (cat) {
      case 'unnecessary':
        return 'Rekod permohonan PPT ini didapati tidak diperlukan lagi bagi perancangan perolehan tahunan.';
      case 'invalid':
        return 'Maklumat permohonan didapati tidak sah atau mengandungi ralat pengisian yang tidak mematuhi garis panduan perolehan HSAAS.';
      case 'duplicate':
        return 'Rekod permohonan ini merupakan duplikasi / bertindih dengan permohonan PPT lain yang telah wujud.';
      case 'cancelled':
        return 'Permohonan dibatalkan secara rasmi atas permintaan pihak jabatan pemohon.';
      case 'other':
        return 'Pelupusan rekod permohonan atas arahan pentadbiran Urus Setia HQ Perolehan HSAAS.';
    }
  };

  const handleCategoryChange = (cat: DeletionReasonCategory) => {
    setReasonCategory(cat);
    if (!reasonText || reasonText === getSuggestedReason(reasonCategory)) {
      setReasonText(getSuggestedReason(cat));
    }
  };

  const finalReason = reasonText.trim() || getSuggestedReason(reasonCategory);

  const handleConfirm = () => {
    setIsDeleting(true);
    try {
      onConfirmDelete(applicationsToDelete, reasonCategory, finalReason);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
      id="hq-delete-modal-overlay"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]"
        id="hq-delete-modal-container"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 text-white p-5 px-6 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-rose-300 flex items-center gap-1.5">
                <span>Modul Urus Setia HQ Perolehan HSAAS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Kuasa Pentadbir</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isBatch
                  ? `Pengesahan Pelupusan ${applicationsToDelete.length} Rekod Permohonan PPT`
                  : 'Pengesahan Pelupusan Rekod Permohonan PPT'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs flex-1">
          {/* Target Application(s) Card */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-950 uppercase tracking-wider border-b border-rose-200 pb-2">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                {isBatch
                  ? `Senarai Rekod Yang Akan Dipadam (${applicationsToDelete.length})`
                  : 'Maklumat Rekod Sasaran'}
              </span>
              <span className="font-mono text-rose-700">
                Jumlah Kos:{' '}
                {new Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: 'MYR',
                }).format(totalCost)}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {applicationsToDelete.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-3 rounded-lg border border-rose-200/90 shadow-2xs flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">
                        {app.referenceNo}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Tahun {app.year}
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                        Status: {app.status}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 truncate" title={app.title}>
                      {app.title}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {app.department}
                      </span>
                      {app.applicantName && (
                        <span>• Pemohon: {app.applicantName}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-emerald-800 text-xs">
                      {new Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: 'MYR',
                      }).format(app.estimatedCost)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason Category Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 text-xs">
              Kategori Sebab Pemadaman Rekod (Deletion Reason):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'unnecessary',
                  label: 'Rekod Tidak Diperlukan',
                  sub: 'Unnecessary Record',
                },
                {
                  id: 'invalid',
                  label: 'Maklumat Tidak Sah / Ralat',
                  sub: 'Invalid / Data Error',
                },
                {
                  id: 'duplicate',
                  label: 'Permohonan Bertindih',
                  sub: 'Duplicate Record',
                },
                {
                  id: 'cancelled',
                  label: 'Dibatalkan oleh Jabatan',
                  sub: 'Cancelled by Department',
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleCategoryChange(item.id as DeletionReasonCategory)}
                  className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between ${
                    reasonCategory === item.id
                      ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sub}</div>
                  </div>
                  {reasonCategory === item.id && (
                    <Check className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs">
              Catatan / Justifikasi Urus Setia HQ (Akan Direkod Dalam Log Audit):
            </label>
            <textarea
              rows={3}
              value={reasonText || getSuggestedReason(reasonCategory)}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Sila masukkan justifikasi pemadaman rekod permohonan ini..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/40 text-slate-800 bg-white"
            />
          </div>

          {/* HQ User Audit Metadata Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Pegawai HQ Bertanggungjawab:
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
              <span>
                Nama: <strong>{hqUser.name}</strong>
              </span>
              <span>
                Emel: <strong className="font-mono text-[10px]">{hqUser.email}</strong>
              </span>
              <span>
                Peranan: <strong className="uppercase text-red-900">Urus Setia HQ</strong>
              </span>
            </div>
          </div>

          {/* Legal / Audit Warning Box */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-[11px] text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold text-amber-900 block">
                Perakuan Integriti & Audit Jejak Sistem:
              </span>
              <span>
                Pemadaman ini adalah <strong>kekal dan tidak boleh dikembalikan</strong>.
                Rekod ini akan dipadamkan daripada pangkalan data Firestore Cloud. Maklumat
                pegawai HQ, cap masa (tarikh & masa), dan no. rujukan permohonan akan disimpan
                secara automatik dalam <strong>Log Audit Sistem</strong> untuk tujuan semakan
                integriti & audit pematuhan.
              </span>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition select-none">
            <input
              type="checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-900">
              Saya mengesahkan bahawa permohonan ini tidak sah / tidak diperlukan dan wajar dipadamkan secara kekal dari sistem.
            </span>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Batal (Cancel)
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasConfirmedCheckbox || isDeleting}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition flex items-center gap-2 ${
              hasConfirmedCheckbox && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98]'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
            id="btn-confirm-permanent-delete"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isDeleting
                ? 'Sedang Memadam...'
                : isBatch
                ? `Sahkan & Padam Kekal (${applicationsToDelete.length} Rekod)`
                : 'Sahkan & Padam Rekod Ini Secara Kekal'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
