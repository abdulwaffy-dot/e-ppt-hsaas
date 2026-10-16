import React, { useState } from 'react';
import { UserProfile, LoginRecord } from '../types';
import { authenticateWithFirebase, saveUserProfileToFirestore } from '../lib/firebaseService';
import {
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  LogIn,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile, newRecord: LoginRecord) => void;
  initialUser?: UserProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess, initialUser }) => {
  const [role, setRole] = useState<'applicant' | 'hq'>(initialUser?.role || 'applicant');
  
  // HQ Reviewer specific credentials
  const [hqId, setHqId] = useState('');
  const [hqPassword, setHqPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Department Applicant fields - Simplified to Official Name & Official Institutional Email
  const [name, setName] = useState(
    initialUser?.name && initialUser.role === 'applicant' ? initialUser.name.toUpperCase() : ''
  );
  const [email, setEmail] = useState(
    initialUser?.email && initialUser.role === 'applicant' ? initialUser.email : ''
  );
  
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: 'applicant' | 'hq') => {
    setRole(newRole);
    setError(null);
    if (newRole === 'hq') {
      setName('Perolehan_hsaas');
      setEmail('perolehan_hsaas@upm.edu.my');
    }
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If HQ Reviewer Role
    if (role === 'hq') {
      const trimmedHqId = hqId.trim();
      const trimmedHqPassword = hqPassword.trim();

      if (!trimmedHqId) {
        setError('HQ Reviewer ID is required.');
        return;
      }

      if (!trimmedHqPassword) {
        setError('HQ Password is required.');
        return;
      }

      if (trimmedHqId !== 'perolehan_hsaas' || trimmedHqPassword !== 'Perolehan_2026') {
        setError('Invalid HQ Reviewer credentials! Please verify your authorized ID and password.');
        return;
      }

      // Authenticate with Firebase Auth
      await authenticateWithFirebase('perolehan_hsaas@upm.edu.my', trimmedHqPassword);

      const nowIso = new Date().toISOString();
      const formattedTimestamp = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const updatedUser: UserProfile = {
        name: 'Perolehan_hsaas',
        email: 'perolehan_hsaas@upm.edu.my',
        department: 'Finance Department',
        loginDate: formattedTimestamp,
        updateDate: formattedTimestamp,
        role: 'hq',
        staffId: 'perolehan_hsaas',
      };

      const newRecord: LoginRecord = {
        id: `log-${Date.now()}`,
        name: 'Perolehan_hsaas',
        email: 'perolehan_hsaas@upm.edu.my',
        department: 'Finance Department',
        loginTimestamp: nowIso,
        ipAddress: '10.221.113.18 (HQ Finance Secure Ingress)',
        deviceInfo: `${navigator.userAgent || 'Web Browser'} - Authenticated HQ Reviewer`,
      };

      saveUserProfileToFirestore(updatedUser);
      onLoginSuccess(updatedUser, newRecord);
      return;
    }

    // Department Applicant Role
    const trimmedName = name.trim().toUpperCase();
    let trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Official Name is required.');
      return;
    }

    if (!trimmedEmail) {
      setError('Official Institutional Email is required.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      trimmedEmail = `${trimmedEmail}@upm.edu.my`;
    }

    if (!trimmedEmail.endsWith('@upm.edu.my')) {
      setError('Official email address must use the @upm.edu.my domain.');
      return;
    }

    // Authenticate with Firebase Auth
    await authenticateWithFirebase(trimmedEmail);

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const userDept = initialUser?.department || 'Hospital Sultan Abdul Aziz Shah';

    const updatedUser: UserProfile = {
      name: trimmedName,
      email: trimmedEmail,
      department: userDept,
      loginDate: formattedTimestamp,
      updateDate: formattedTimestamp,
      role: 'applicant',
    };

    const newRecord: LoginRecord = {
      id: `log-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      department: userDept,
      loginTimestamp: nowIso,
      ipAddress: '10.221.113.18 (Institutional Ingress)',
      deviceInfo: navigator.userAgent || 'Web Browser',
    };

    saveUserProfileToFirestore(updatedUser);
    onLoginSuccess(updatedUser, newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              UPM
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Sistem e-PPT HSAAS</h2>
              <p className="text-xs text-red-200 mt-0.5">
                Hospital Sultan Abdul Aziz Shah Procurement System
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRoleChange('applicant')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              role === 'applicant'
                ? 'bg-red-800 text-white shadow-sm border border-red-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <User className="w-4 h-4 text-red-300" />
            <span>Department PPT Application</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('hq')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              role === 'hq'
                ? 'bg-slate-900 text-amber-300 shadow-sm border border-slate-800'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>HQ Reviewer</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={validateAndSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {role === 'hq' ? (
            /* HQ Reviewer Login Section (Restricted to ID and Password) */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3.5 text-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>HQ Reviewer Secure Access</span>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      RESTRICTED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Access role for HQ Reviewer is strictly restricted to login using designated ID and password.
                  </p>
                </div>
              </div>

              {/* HQ ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HQ Reviewer Login ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={hqId}
                    onChange={(e) => setHqId(e.target.value)}
                    placeholder="Enter HQ Login ID"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/30 focus:border-slate-800 font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Secure ID assigned to Unit Perolehan HSAAS
                </p>
              </div>

              {/* HQ Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HQ Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={hqPassword}
                    onChange={(e) => setHqPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/30 focus:border-slate-800 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Encrypted authorization key
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-950 text-amber-300 py-2.5 rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 mt-2 ring-1 ring-slate-800"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Login as HQ Reviewer</span>
              </button>
            </div>
          ) : (
            /* Department PPT Application Login Section */
            <div className="space-y-4">
              {/* Official Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    onBlur={(e) => setName((prev) => prev.toUpperCase())}
                    placeholder="Masukkan Nama Penuh (e.g. ABDUL WAFFY)"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 uppercase"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500">
                    Nama rasmi pemohon PPT
                  </p>
                  <span className="text-[9px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded tracking-wide">
                    HURUF BESAR / UPPERCASE
                  </span>
                </div>
              </div>

              {/* Email address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Institutional Email <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: nama@upm.edu.my"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be a valid institutional email ending with <span className="font-semibold text-slate-700">@upm.edu.my</span>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-red-800 hover:bg-red-900 text-white py-2.5 rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log Masuk Permohonan PPT (Login)</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};



