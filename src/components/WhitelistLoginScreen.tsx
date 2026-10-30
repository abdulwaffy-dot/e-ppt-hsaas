import React, { useState } from 'react';
import { UserProfile, LoginRecord, WhitelistUser } from '../types';
import { authenticateWithFirebase, saveUserProfileToFirestore } from '../lib/firebaseService';
import { authenticateWhitelistUser } from '../data/whitelistUsers';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  KeyRound,
  Info,
  Users,
} from 'lucide-react';

interface WhitelistLoginScreenProps {
  whitelistUsers: WhitelistUser[];
  onLoginSuccess: (user: UserProfile, newRecord: LoginRecord) => void;
}

export const WhitelistLoginScreen: React.FC<WhitelistLoginScreenProps> = ({
  whitelistUsers,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'applicant' | 'hq'>('applicant');

  // Applicant login state
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPassword, setApplicantPassword] = useState('');
  const [showApplicantPassword, setShowApplicantPassword] = useState(false);

  // HQ Reviewer / Admin login state
  const [hqId, setHqId] = useState('');
  const [hqPassword, setHqPassword] = useState('');
  const [showHqPassword, setShowHqPassword] = useState(false);

  // Error and feedback state
  const [error, setError] = useState<string | null>(null);

  // Handle applicant login
  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = authenticateWhitelistUser(applicantEmail, applicantPassword, whitelistUsers);

    if (!result.success || !result.user) {
      setError(result.error || 'Akses Ditolak: Log masuk tidak berjaya.');
      return;
    }

    const approvedUser = result.user;

    // Authenticate with Firebase for persistent Firestore session
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

    const userProfile: UserProfile = {
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
      ipAddress: '10.221.113.18 (HSAAS Whitelist Ingress)',
      deviceInfo: `${navigator.userAgent || 'Web Browser'} - Whitelist Authorized`,
    };

    saveUserProfileToFirestore(userProfile);
    onLoginSuccess(userProfile, newRecord);
  };

  // Handle HQ / Admin login
  const handleHqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = hqId.trim();
    const trimmedPassword = hqPassword.trim();

    if (!trimmedId) {
      setError('HQ Reviewer ID is required.');
      return;
    }

    if (!trimmedPassword) {
      setError('HQ Password is required.');
      return;
    }

    const hqAdmin = whitelistUsers.find(
      (u) =>
        u.role === 'hq' &&
        (u.staffId === trimmedId || u.email.toLowerCase() === trimmedId.toLowerCase()) &&
        u.password === trimmedPassword
    ) || (trimmedId === 'perolehan_hsaas' && trimmedPassword === 'Perolehan_2026' ? {
      name: 'PEROLEHAN HSAAS (SYSTEM ADMINISTRATOR)',
      email: 'perolehan_hsaas@upm.edu.my',
      department: 'Finance Department : Procurement',
      role: 'hq' as const,
      staffId: 'perolehan_hsaas',
      isActive: true,
    } : null);

    if (!hqAdmin) {
      setError('Access Denied: Kredensial Urus Setia HQ / Pentadbir Sistem tidak sah.');
      return;
    }

    if (!hqAdmin.isActive) {
      setError('Access Denied: Akaun Pentadbir ini telah dinyahaktifkan.');
      return;
    }

    // Authenticate with Firebase Auth
    await authenticateWithFirebase(hqAdmin.email, trimmedPassword);

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const userProfile: UserProfile = {
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
      ipAddress: '10.221.113.18 (HQ Procurement Secure Ingress)',
      deviceInfo: `${navigator.userAgent || 'Web Browser'} - Authenticated HQ Administrator`,
    };

    saveUserProfileToFirestore(userProfile);
    onLoginSuccess(userProfile, newRecord);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Institutional Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 bg-slate-800/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              UPM
            </div>
            <div className="text-left">
              <span className="block text-white font-bold text-base tracking-tight leading-tight">
                Sistem e-PPT HSAAS
              </span>
              <span className="block text-slate-300 text-[11px] font-medium leading-tight">
                Hospital Sultan Abdul Aziz Shah • Universiti Putra Malaysia
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('applicant');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'applicant'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Department PPT Application</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('hq');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'hq'
                  ? 'bg-slate-900 text-amber-300 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>HQ Reviewer / Pentadbir</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Access Denied / Error Alert */}
            {error && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-rose-950 uppercase tracking-wide block">
                    Akses Ditolak / Access Denied
                  </span>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {activeTab === 'applicant' ? (
              /* Applicant Login Form */
              <form onSubmit={handleApplicantSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Akses Senarai Putih Pemohon (Whitelist Only)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Sistem ini hanya membenarkan akses kepada <strong>32 pengguna jabatan yang diluluskan</strong> menggunakan <strong>emel rasmi</strong> dan <strong>kata laluan yang telah ditetapkan</strong>.
                  </p>
                </div>

                {/* Registered Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Institutional Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => {
                        setApplicantEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="Profwaffy@upm.edu.my"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-mono bg-white text-slate-900 shadow-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Emel rasmi institusi yang berdaftar dalam senarai putih UPM.
                  </p>
                </div>

                {/* Assigned Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Assigned Password <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Kata laluan yang diberikan
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showApplicantPassword ? 'text' : 'password'}
                      value={applicantPassword}
                      onChange={(e) => {
                        setApplicantPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Masukkan kata laluan yang ditetapkan"
                      className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-mono bg-white text-slate-900 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowApplicantPassword(!showApplicantPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                      title={showApplicantPassword ? 'Hide password' : 'Show password'}
                    >
                      {showApplicantPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white py-3 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 mt-3 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log Masuk Permohonan PPT (E-PPT Login)</span>
                </button>
              </form>
            ) : (
              /* HQ Reviewer & System Administrator Form */
              <form onSubmit={handleHqSubmit} className="space-y-4">
                <div className="p-3 bg-slate-900 text-amber-300 rounded-xl text-xs space-y-1 border border-slate-800 shadow-sm">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Akses Pentadbir Sistem / Urus Setia HQ</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Akses pentadbir untuk semakan permohonan PPT, kelulusan, penetapan bajet tahunan, dan pengurusan senarai putih pengguna.
                  </p>
                </div>

                {/* HQ ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    HQ Administrator Login ID / Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={hqId}
                      onChange={(e) => {
                        setHqId(e.target.value);
                        setError(null);
                      }}
                      placeholder="perolehan_hsaas"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900 font-mono bg-white text-slate-900 shadow-sm"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    ID rasmi: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">perolehan_hsaas</code>
                  </p>
                </div>

                {/* HQ Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    HQ Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showHqPassword ? 'text' : 'password'}
                      value={hqPassword}
                      onChange={(e) => {
                        setHqPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:border-slate-900 font-mono bg-white text-slate-900 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowHqPassword(!showHqPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showHqPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-amber-300 py-3 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 mt-3 cursor-pointer ring-1 ring-slate-800"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Log Masuk Urus Setia HQ / Pentadbir Sistem</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>© 2026 Hospital Sultan Abdul Aziz Shah (HSAAS), Universiti Putra Malaysia.</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Untuk bantuan akaun atau permohonan akses senarai putih, hubungi Urus Setia HQ Perolehan HSAAS.
          </p>
        </div>
      </div>
    </div>
  );
};
