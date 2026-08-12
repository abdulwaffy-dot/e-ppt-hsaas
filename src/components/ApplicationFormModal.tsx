import React, { useState, useEffect } from 'react';
import {
  ProcurementApplication,
  UserProfile,
  PROCUREMENT_METHODS,
  EXPENDITURE_CATEGORIES,
  UPM_DEPARTMENTS,
  ProcurementMethod,
  ServiceType,
  AllocationType,
} from '../types';
import { X, FilePlus, DollarSign, Calendar, FileText, CheckCircle, Save } from 'lucide-react';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSubmitApplication: (app: ProcurementApplication) => void;
  editingApplication?: ProcurementApplication | null;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEARS = Array.from({ length: 15 }, (_, i) => 2023 + i);

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmitApplication,
  editingApplication,
}) => {
  const [title, setTitle] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(user.department);
  const [year, setYear] = useState<number>(2026);
  const [allocationType] = useState<AllocationType>('Operating 14005');
  const [procurementMethod, setProcurementMethod] = useState<ProcurementMethod>('SH');
  const [serviceType, setServiceType] = useState<ServiceType>('Service');
  const [expenditureCode, setExpenditureCode] = useState<string>('29000');
  const [invitationMonth, setInvitationMonth] = useState<string>('October');
  const [invitationYear, setInvitationYear] = useState<number>(2026);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [remarksJustification, setRemarksJustification] = useState<string>('');

  useEffect(() => {
    if (editingApplication) {
      setTitle(editingApplication.title);
      setSelectedDepartment(editingApplication.department || user.department);
      setYear(editingApplication.year);
      setProcurementMethod(editingApplication.procurementMethod);
      setServiceType(editingApplication.serviceType);
      setExpenditureCode(editingApplication.expenditureCategoryCode);
      setInvitationMonth(editingApplication.expectedInvitationMonth);
      setInvitationYear(editingApplication.expectedInvitationYear);
      setEstimatedCost(editingApplication.estimatedCost.toString());
      setRemarksJustification(editingApplication.remarksJustification);
    } else {
      // Default reset
      setTitle('');
      setSelectedDepartment(user.department);
      setYear(2026);
      setProcurementMethod('SH');
      setServiceType('Service');
      setExpenditureCode('29000');
      setInvitationMonth('October');
      setInvitationYear(2026);
      setEstimatedCost('');
      setRemarksJustification('');
    }
  }, [editingApplication, isOpen, user.department]);

  if (!isOpen) return null;

  const handleSubmit = (status: 'Draft' | 'Submitted') => {
    const costNum = parseFloat(estimatedCost) || 0;
    const catObj = EXPENDITURE_CATEGORIES.find((c) => c.code === expenditureCode);
    const targetDept = selectedDepartment || user.department;

    const nowIso = new Date().toISOString();
    const deptCode = targetDept
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

    const refNo = editingApplication
      ? editingApplication.referenceNo
      : `PPT-${year}-${deptCode}-${Math.floor(100 + Math.random() * 900)}`;

    const application: ProcurementApplication = {
      id: editingApplication ? editingApplication.id : `ppt-${Date.now()}`,
      referenceNo: refNo,
      title: title.trim() || 'Untitled Procurement Application',
      year,
      allocationType,
      procurementMethod,
      serviceType,
      expenditureCategoryCode: expenditureCode,
      expenditureCategoryName: catObj ? catObj.name : 'Services',
      expectedInvitationMonth: invitationMonth,
      expectedInvitationYear: invitationYear,
      estimatedCost: costNum,
      remarksJustification: remarksJustification.trim(),

      department: targetDept,
      applicantName: user.name,
      applicantEmail: user.email,
      createdAt: editingApplication ? editingApplication.createdAt : nowIso,
      updatedAt: nowIso,

      status,
      hqDecision: editingApplication ? editingApplication.hqDecision : undefined,
    };

    onSubmitApplication(application);
    if (status === 'Submitted') {
      alert(`Success! Application ${refNo} has been submitted to HQ Review Panel for review and approval.`);
    }
    onClose();
  };

  const formattedCostRM = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 2,
  }).format(parseFloat(estimatedCost) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-700/60 rounded-lg border border-red-500/40 text-amber-300">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                03. Procurement Application Information (PPT)
              </h2>
              <p className="text-xs text-red-200">
                Department: <strong className="text-white">{user.department}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Submitting Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submitting Department / Unit <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 font-semibold bg-white text-slate-900"
              required
            >
              {UPM_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Procurement Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procurement Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Supply & Commissioning of High-Resolution Medical Imaging Workstations"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Procurement Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procurement Year <span className="text-red-600">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Type of Allocation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type of Allocation
              </label>
              <div className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-lg flex items-center justify-between">
                <span>{allocationType}</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                  Standard
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Procurement Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procurement Method <span className="text-red-600">*</span>
              </label>
              <select
                value={procurementMethod}
                onChange={(e) => setProcurementMethod(e.target.value as ProcurementMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {Object.values(PROCUREMENT_METHODS).map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type of Service */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type of Service <span className="text-red-600">*</span>
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white font-medium"
              >
                <option value="Service">Service</option>
                <option value="Bekalan">Bekalan</option>
                <option value="Kerja">Kerja</option>
                <option value="Aset">Aset</option>
              </select>
            </div>
          </div>

          {/* Expenditure Categories */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expenditure Categories <span className="text-red-600">*</span>
            </label>
            <select
              value={expenditureCode}
              onChange={(e) => setExpenditureCode(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white font-medium"
            >
              {EXPENDITURE_CATEGORIES.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Invitation (Month/Year) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 border border-slate-200 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Expected Invitation Month
              </label>
              <select
                value={invitationMonth}
                onChange={(e) => setInvitationMonth(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Expected Invitation Year
              </label>
              <select
                value={invitationYear}
                onChange={(e) => setInvitationYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Cost (RM) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>
                Estimated Cost (RM) <span className="text-red-600">*</span>
              </span>
              <span className="text-emerald-700 font-bold font-mono text-xs">
                {formattedCostRM}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">RM</span>
              <input
                type="number"
                min="0"
                step="100"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 font-mono font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Remarks / Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Remarks / Justification <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={remarksJustification}
              onChange={(e) => setRemarksJustification(e.target.value)}
              placeholder="Provide clinical, technical, operational or administrative justification for this procurement request..."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
              required
            />
          </div>
        </div>

        {/* Footer Actions & Guidance */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              Pemohon: <strong className="text-slate-800">{user.name}</strong> ({user.email}) • Jabatan:{' '}
              <strong className="text-slate-800">{selectedDepartment || user.department}</strong>
            </div>
            <div className="text-[10px] text-slate-500 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              💡 Tekan <strong>Submit to HQ</strong> untuk membolehkan pihak HQ membuat semakan & kelulusan.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition"
            >
              Batal (Cancel)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSubmit('Draft');
                  alert('Draf Permohonan Berjaya Disimpan. Draf ini berada di portal jabatan anda dan belum dihantar ke HQ. Sila tekan butang "Hantar ke HQ" apabila sedia.');
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                title="Simpan sebagai draf jabatan (belum dihantar ke HQ)"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Draf (Save Draft)
              </button>

              <button
                type="button"
                disabled={!title.trim() || !estimatedCost}
                onClick={() => handleSubmit('Submitted')}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2 ring-2 ring-red-800/30"
                title="Hantar permohonan secara rasmi ke HQ Review Panel"
              >
                <CheckCircle className="w-4 h-4 text-amber-300" />
                <span>Hantar ke HQ (Submit to HQ)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
