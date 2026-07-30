import React, { useState } from 'react';
import { UPM_DEPARTMENTS, UserProfile } from '../types';
import { Building2, Mail, User, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface DepartmentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const DepartmentVerificationModal: React.FC<DepartmentVerificationModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [department, setDepartment] = useState(user.department);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<'applicant' | 'hq'>(user.role);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    onUpdateUser({
      ...user,
      name,
      department,
      role,
      updateDate: formattedTimestamp,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">02. User Identity Verification</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Department Representative Self-Verification:</strong> Confirm or update your official department unit below to ensure all submitted PPT applications are routed accurately.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-100 text-slate-500 rounded-lg font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Department / Section / Unit (27 Official Options)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 bg-white"
              required
            >
              {UPM_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">System Mode / Role</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition ${
                  role === 'applicant'
                    ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'applicant'}
                  onChange={() => setRole('applicant')}
                  className="accent-red-700"
                />
                <span>Department PPT Application</span>
              </label>

              <label
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition ${
                  role === 'hq'
                    ? 'bg-slate-900 border-slate-800 text-white font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'hq'}
                  onChange={() => setRole('hq')}
                  className="accent-amber-400"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> HQ Reviewer
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Verified & Saved!
                </>
              ) : (
                'Save Verification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
