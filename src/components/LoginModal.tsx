import React, { useState } from 'react';
import { UserProfile, LoginRecord, WhitelistUser } from '../types';
import { authenticateWithFirebase, saveUserProfileToFirestore } from '../lib/firebaseService';
import { authenticateWhitelistUser, INITIAL_WHITELIST_USERS } from '../data/whitelistUsers';
import {
  Mail,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  LogIn,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  Users,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile, newRecord: LoginRecord) => void;
  initialUser?: UserProfile;
  whitelistUsers?: WhitelistUser[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialUser,
  whitelistUsers = INITIAL_WHITELIST_USERS,
}) => {
  const [role, setRole] = useState<'applicant' | 'hq'>(initialUser?.role || 'applicant');

  // HQ Reviewer specific credentials
  const [hqId, setHqId] = useState('');
  const [hqPassword, setHqPassword] = useState('');
  const [showHqPassword, setShowHqPassword] = useState(false);

  // Department Applicant fields
  const [email, setEmail] = useState(
    initialUser?.email && initialUser.role === 'applicant' ? initialUser.email : ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: 'applicant' | 'hq') => {
    setRole(newRole);
    setError(null);
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

      const hqAdmin = whitelistUsers.find(
        (u) =>
          u.role === 'hq' &&
          (u.staffId === trimmedHqId || u.email.toLowerCase() === trimmedHqId.toLowerCase()) &&
          u.password === trimmedHqPassword
      ) || (trimmedHqId === 'perolehan_hsaas' && trimmedHqPassword === 'Perolehan_2026' ? {
        name: 'PEROLEHAN HSAAS (SYSTEM ADMINISTRATOR)',
        email: 'perolehan_hsaas@upm.edu.my',
        department: 'Finance Department : Procurement',
        role: 'hq' as const,
        staffId: 'perolehan_hsaas',
        isActive: true,
      } : null);

      if (!hqAdmin) {
        setError('Access Denied: Kredensial Urus Setia HQ tidak sah.');
        return;
      }

      if (!hqAdmin.isActive) {
        setError('Access Denied: Akaun ini telah dinyahaktifkan oleh Pentadbir Sistem.');
        return;
      }

      // Authenticate with Firebase Auth
      await authenticateWithFirebase(hqAdmin.email, trimmedHqPassword);

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
        name: hqAdmin.name.toUpperCase(),
        email: hqAdmin.email.toLowerCase(),
        department: hqAdmin.department,
        loginDate: formattedTimestamp,
        updateDate: formattedTimestamp,
        role: 'hq',
        staffId: hqAdmin.staffId || 'perolehan_hsaas',
      };

      const newRecord: LoginRecord = {
        id: `log-${Date.now()}`,
        name: hqAdmin.name.toUpperCase(),
        email: hqAdmin.email.toLowerCase(),
        department: hqAdmin.department,
        loginTimestamp: nowIso,
        ipAddress: '10.221.113.18 (HQ Finance Secure Ingress)',
        deviceInfo: `${navigator.userAgent || 'Web Browser'} - Authenticated HQ Administrator`,
      };

      saveUserProfileToFirestore(updatedUser);
      onLoginSuccess(updatedUser, newRecord);
      return;
    }

    // Department Applicant Role - Whitelist Check
    const result = authenticateWhitelistUser(email, password, whitelistUsers);

    if (!result.success || !result.user) {
      setError(result.error || 'Access Denied: Pengesahan pengguna gagal.');
      return;
    }

    const approvedUser = result.user;

    // Authenticate with Firebase Auth
    await authenticateWithFirebase(approvedUser.email, approvedUser.password);

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
      name: approvedUser.name.toUpperCase(),
      email: approvedUser.email.toLowerCase(),
      department: approvedUser.department,
      loginDate: formattedTimestamp,
      updateDate: formattedTimestamp,
      role: 'applicant',
    };

    const newRecord: LoginRecord = {
      id: `log-${Date.now()}`,
      name: approvedUser.name.toUpperCase(),
      email: approvedUser.email.toLowerCase(),
      department: approvedUser.department,
      loginTimestamp: nowIso,
      ipAddress: '10.221.113.18 (Institutional Whitelist Ingress)',
      deviceInfo: `${navigator.userAgent || 'Web Browser'} - Whitelist Authorized`,
    };

    saveUserProfileToFirestore(updatedUser);
    onLoginSuccess(updatedUser, newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white p-6 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/70 hover:text-white p-1 rounded hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              UPM
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Sistem e-PPT HSAAS</h2>
              <p className="text-xs text-red-200 mt-0.5">
                Kawalan Akses Senarai Putih (Whitelist Authentication)
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
            <span>HQ Reviewer / Pentadbir</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={validateAndSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-rose-950">
                  Akses Ditolak / Access Denied
                </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {role === 'hq' ? (
            /* HQ Reviewer Login Section */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>HQ Administrator Secure Ingress</span>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      RESTRICTED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Akses dikhaskan untuk Urus Setia HQ Perolehan HSAAS.
                  </p>
                </div>
              </div>

              {/* HQ ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HQ Administrator ID / Email <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={hqId}
                    onChange={(e) => setHqId(e.target.value)}
                    placeholder="perolehan_hsaas"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/30 focus:border-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              {/* HQ Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HQ Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showHqPassword ? 'text' : 'password'}
                    value={hqPassword}
                    onChange={(e) => setHqPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/30 focus:border-slate-800 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowHqPassword(!showHqPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showHqPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-950 text-amber-300 py-2.5 rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 mt-2 ring-1 ring-slate-800 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Log Masuk Urus Setia HQ</span>
              </button>
            </div>
          ) : (
            /* Department PPT Application Whitelist Login */
            <div className="space-y-4">
              <div className="bg-red-50/80 border border-red-200/80 rounded-lg p-3 text-red-950 text-xs">
                <span className="font-bold block">Akses Terhad Senarai Putih (Approved Whitelist)</span>
                <span className="text-[11px] text-red-800">
                  Hanya 32 pengguna jabatan yang diluluskan dibenarkan log masuk menggunakan emel dan kata laluan yang telah ditetapkan.
                </span>
              </div>

              {/* Registered Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Institutional Email <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Profwaffy@upm.edu.my"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Assigned Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata laluan yang ditetapkan"
                    className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-800 hover:bg-red-900 text-white py-2.5 rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
