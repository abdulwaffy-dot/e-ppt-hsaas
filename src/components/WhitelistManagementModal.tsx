import React, { useState } from 'react';
import { WhitelistUser, UPM_DEPARTMENTS, UserProfile, DeletionAuditLog } from '../types';
import {
  X,
  Users,
  Search,
  Plus,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  Lock,
  KeyRound,
  Building2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  History,
  Sparkles,
} from 'lucide-react';

interface WhitelistManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  whitelistUsers: WhitelistUser[];
  auditLogs?: DeletionAuditLog[];
  onSaveUser: (user: WhitelistUser, customReason?: string) => void;
  onDeleteUser: (userOrId: string | WhitelistUser) => void;
}

export const WhitelistManagementModal: React.FC<WhitelistManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  whitelistUsers,
  auditLogs = [],
  onSaveUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WhitelistUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDepartment, setFormDepartment] = useState(UPM_DEPARTMENTS[0]);
  const [formRole, setFormRole] = useState<'applicant' | 'hq'>('applicant');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Password visibility state - default to TRUE as requested ("hq can see all password")
  const [showPasswordInTable, setShowPasswordInTable] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCredsId, setCopiedCredsId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Only System Administrator (HQ) can access
  if (currentUser.role !== 'hq') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Akses Ditolak / Access Denied</h3>
          <p className="text-xs text-slate-600">
            Hanya Pentadbir Sistem (HQ Administrator) Urus Setia HQ sahaja yang mempunyai hak akses untuk menguruskan akaun pengguna sistem E-PPT.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // Filter User Management Audit Logs
  const userAuditLogs = auditLogs.filter(
    (l) =>
      l.action === 'CREATE_USER_ACCOUNT' ||
      l.action === 'UPDATE_USER_ACCOUNT' ||
      l.action === 'ACTIVATE_USER_ACCOUNT' ||
      l.action === 'DEACTIVATE_USER_ACCOUNT' ||
      l.action === 'DELETE_USER_ACCOUNT'
  );

  const filteredUserAuditLogs = userAuditLogs.filter((log) => {
    const term = auditSearchTerm.toLowerCase();
    return (
      (log.targetUser?.name || '').toLowerCase().includes(term) ||
      (log.targetUser?.email || '').toLowerCase().includes(term) ||
      (log.targetUser?.department || '').toLowerCase().includes(term) ||
      (log.hqUser?.name || '').toLowerCase().includes(term) ||
      (log.actionLabel || '').toLowerCase().includes(term) ||
      (log.reason || '').toLowerCase().includes(term)
    );
  });

  const handleOpenAddForm = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword(`EPPT@${Math.floor(1000 + Math.random() * 9000)}#UPM`);
    setFormDepartment(UPM_DEPARTMENTS[0]);
    setFormRole('applicant');
    setFormIsActive(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: WhitelistUser) => {
    setEditingUser(user);
    setFormName(user.name.toUpperCase());
    setFormEmail(user.email);
    setFormPassword(user.password);
    setFormDepartment(user.department || 'Tiada / Umum');
    setFormRole(user.role);
    setFormIsActive(user.isActive);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `EPPT@${rand}#2026`;
    setFormPassword(newPass);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim().toUpperCase();
    let trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedPassword = formPassword.trim();

    if (!trimmedName) {
      setFormError('Full Name (Nama rasmi pengguna) adalah wajib.');
      return;
    }

    if (!trimmedEmail) {
      setFormError('Email Address (Emel rasmi institusi) adalah wajib.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      trimmedEmail = `${trimmedEmail}@upm.edu.my`;
    }

    if (!trimmedEmail.endsWith('@upm.edu.my')) {
      setFormError('Emel mestilah menggunakan domain rasmi @upm.edu.my.');
      return;
    }

    if (!trimmedPassword) {
      setFormError('Password (Kata laluan yang ditetapkan) adalah wajib.');
      return;
    }

    // Check duplicate email if creating new or changing email
    const duplicate = whitelistUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && (!editingUser || u.id !== editingUser.id)
    );

    if (duplicate) {
      setFormError(`Emel ${trimmedEmail} telah sedia wujud dalam senarai putih.`);
      return;
    }

    const nowIso = new Date().toISOString();

    const userToSave: WhitelistUser = {
      id: editingUser ? editingUser.id : `wl-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      department: formDepartment,
      role: formRole,
      isActive: formIsActive,
      createdAt: editingUser ? editingUser.createdAt : nowIso,
      updatedAt: nowIso,
    };

    const reason = editingUser
      ? `Kemaskini maklumat pengguna: ${trimmedName} (${trimmedEmail}) - Peranan: ${formRole} - Jabatan: ${formDepartment}`
      : `Penciptaan akaun pengguna baru oleh HQ: ${trimmedName} (${trimmedEmail}) - Peranan: ${formRole} - Jabatan: ${formDepartment}`;

    onSaveUser(userToSave, reason);
    setIsFormOpen(false);
  };

  const handleToggleActive = (user: WhitelistUser) => {
    const updated: WhitelistUser = {
      ...user,
      isActive: !user.isActive,
      updatedAt: new Date().toISOString(),
    };
    const reason = user.isActive
      ? `Nyahaktifkan capaian akaun pengguna: ${user.name} (${user.email})`
      : `Pengaktifan semula capaian akaun pengguna: ${user.name} (${user.email})`;
    onSaveUser(updated, reason);
  };

  const handleDelete = (user: WhitelistUser) => {
    if (user.role === 'hq' && user.email === 'perolehan_hsaas@upm.edu.my') {
      alert('Akaun Pentadbir Utama tidak boleh dipadamkan.');
      return;
    }

    if (
      window.confirm(
        `Adakah anda pasti mahu memadamkan pengguna ${user.name} (${user.email}) daripada Senarai Putih yang diluluskan? Pengguna ini tidak lagi boleh mengakses sebarang modul e-PPT.`
      )
    ) {
      onDeleteUser(user);
    }
  };

  const copyToClipboard = (text: string, id: string, isCreds = false) => {
    navigator.clipboard.writeText(text);
    if (isCreds) {
      setCopiedCredsId(id);
      setTimeout(() => setCopiedCredsId(null), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Rasmi', 'Emel Rasmi', 'Kata Laluan', 'Jabatan', 'Peranan', 'Status'];
    const rows = whitelistUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      `"${u.password}"`,
      `"${u.department || 'Tiada'}"`,
      u.role === 'hq' ? 'Pentadbir HQ' : 'Pemohon Jabatan',
      u.isActive ? 'Aktif' : 'Dinyahaktifkan',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Senarai_Pengguna_EPPT_HSAAS_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered users
  const filteredUsers = whitelistUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.password.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? u.isActive : !u.isActive;

    return matchesSearch && matchesStatus;
  });

  const activeCount = whitelistUsers.filter((u) => u.isActive).length;
  const inactiveCount = whitelistUsers.length - activeCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight text-white">
                  HQ Review &gt; User Management (Pengurusan Pengguna &amp; Senarai Putih)
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
                  HQ ADMINISTRATOR ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat kawalan akaun berdaftar, kata laluan pengguna, dan log audit aktiviti pengurusan akaun e-PPT.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Users vs Audit Log */}
        <div className="bg-slate-800/90 text-white px-6 py-2 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Direktori Pengguna</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'users' ? 'bg-slate-900 text-amber-300' : 'bg-slate-700 text-slate-200'
              }`}>
                {whitelistUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Log Audit Pengurusan Pengguna</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'audit' ? 'bg-slate-900 text-amber-300' : 'bg-slate-700 text-slate-200'
              }`}>
                {userAuditLogs.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendaftaran Kendiri Dinyahaktifkan • Hanya HQ Dibenarkan Cipta Akaun</span>
          </div>
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Toolbar & Summary Stats */}
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Ringkasan Pengguna:</span>
                <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full font-bold">
                  Jumlah: {whitelistUsers.length}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aktif: {activeCount}
                </span>
                {inactiveCount > 0 && (
                  <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Dinyahaktifkan: {inactiveCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Eksport CSV</span>
                </button>
                <button
                  onClick={handleOpenAddForm}
                  className="px-3.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cipta Akaun Pengguna Baru</span>
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="p-4 sm:px-6 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari mengikut nama, emel rasmi, jabatan, atau kata laluan..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'ALL' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Semua ({whitelistUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Aktif ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('INACTIVE')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Dinyahaktifkan ({inactiveCount})
                  </button>
                </div>

                {/* HQ Password Visibility Controller */}
                <button
                  type="button"
                  onClick={() => setShowPasswordInTable(!showPasswordInTable)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                    showPasswordInTable
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="HQ can toggle clear password visibility"
                >
                  {showPasswordInTable ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{showPasswordInTable ? 'Kata Laluan Terpapar (HQ Visible)' : 'Topeng Kata Laluan'}</span>
                </button>
              </div>
            </div>

            {/* User Table with Prominent Password Visibility */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Tiada pengguna ditemui mengikut kriteria carian.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-4">Nama Rasmi (Official Name)</th>
                      <th className="py-2.5 px-4">Emel Berdaftar</th>
                      <th className="py-2.5 px-4 bg-amber-50/60 text-amber-900 border-x border-amber-200">
                        Kata Laluan Ditetapkan (Assigned Password)
                      </th>
                      <th className="py-2.5 px-4">Jabatan / Organisasi</th>
                      <th className="py-2.5 px-3 text-center">Peranan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Tindakan HQ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-50/90 transition ${
                          !user.isActive ? 'bg-rose-50/40 text-slate-500' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-medium text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="tracking-wide uppercase">{user.name}</span>
                            {user.role === 'hq' && (
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                HQ ADMIN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700 font-medium flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        {/* Prominent Password Column for HQ */}
                        <td className="py-3 px-4 bg-amber-50/30 border-x border-amber-200/70">
                          <div className="flex items-center gap-2">
                            {showPasswordInTable ? (
                              <span className="font-mono font-bold text-xs bg-amber-100/90 text-amber-950 px-2 py-1 rounded border border-amber-300 select-all tracking-wider shadow-2xs">
                                {user.password}
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 tracking-widest text-xs">
                                ••••••••••••
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => copyToClipboard(user.password, user.id)}
                              className="p-1 text-slate-600 hover:text-amber-800 hover:bg-amber-100 rounded border border-slate-200 hover:border-amber-300 transition cursor-pointer"
                              title="Salin Kata Laluan"
                            >
                              {copiedId === user.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  `Emel: ${user.email}\nKata Laluan: ${user.password}\nSistem: E-PPT HSAAS`,
                                  user.id,
                                  true
                                )
                              }
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded border border-slate-200 transition cursor-pointer text-[10px] hidden lg:inline-flex items-center gap-1"
                              title="Salin Emel & Kata Laluan Lengkap"
                            >
                              {copiedCredsId === user.id ? (
                                <span className="text-emerald-700 font-bold">Disalin!</span>
                              ) : (
                                <span>Salin Info</span>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                            {user.department || 'Tiada / Belum Ditetapkan'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.role === 'hq'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {user.role === 'hq' ? 'Pentadbir HQ' : 'Pemohon'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Nyahaktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                user.isActive
                                  ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title={user.isActive ? 'Nyahaktifkan Akaun Pengguna' : 'Aktifkan Semula Akaun'}
                            >
                              {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleOpenEditForm(user)}
                              className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition cursor-pointer"
                              title="Kemaskini Profil & Kata Laluan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(user)}
                              disabled={user.role === 'hq' && user.email === 'perolehan_hsaas@upm.edu.my'}
                              className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Padam Pengguna daripada Senarai Putih"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* User Management Audit Log Tab */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs text-slate-800">
                  Log Audit Pengurusan Akaun Pengguna (User Management Activity Trail)
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  {userAuditLogs.length} Rekod
                </span>
              </div>
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  placeholder="Cari log mengikut pentadbir, pengguna, tindakan..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUserAuditLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <History className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">
                    {userAuditLogs.length === 0
                      ? 'Tiada rekod audit pengurusan akaun pengguna lagi. Sebarang aktiviti penciptaan, kemaskini, pengaktifan, atau pemadaman akaun akan direkodkan di sini secara automatik.'
                      : 'Tiada rekod audit sepadan dengan carian.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-4 w-36">Tarikh &amp; Masa</th>
                      <th className="py-2.5 px-4 w-44">Jenis Tindakan</th>
                      <th className="py-2.5 px-4">Pengguna Sasaran</th>
                      <th className="py-2.5 px-4">Dilaksanakan Oleh (HQ)</th>
                      <th className="py-2.5 px-4">Butiran / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUserAuditLogs.map((log, idx) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          <div>{log.dateFormatted}</div>
                          <div className="text-[10px] text-slate-500">{log.timeFormatted}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                              log.action === 'CREATE_USER_ACCOUNT'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : log.action === 'DELETE_USER_ACCOUNT'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : log.action === 'ACTIVATE_USER_ACCOUNT'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : log.action === 'DEACTIVATE_USER_ACCOUNT'
                                ? 'bg-orange-50 text-orange-800 border-orange-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {log.actionLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {log.targetUser ? (
                            <div>
                              <div className="font-bold text-slate-900 uppercase">
                                {log.targetUser.name}
                              </div>
                              <div className="text-[11px] text-slate-600 font-mono">
                                {log.targetUser.email}
                              </div>
                              {log.targetUser.department && (
                                <div className="text-[10px] text-slate-500">
                                  {log.targetUser.department}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Tiada data sasaran</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{log.hqUser.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.hqUser.email}</div>
                          <div className="text-[10px] text-amber-700 font-medium">HQ Administrator</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 text-xs">
                          <p className="leading-relaxed">{log.reason}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>
              Perubahan dikuatkuasakan serta-merta ke dalam modul log masuk dan pangkalan data Firestore.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Add / Edit Sub-Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingUser ? 'Kemaskini Pengguna Senarai Putih' : 'Cipta Akaun Pengguna Baru (HQ Admin)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Official Name (auto-uppercase) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name (Nama Rasmi Pengguna) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  onBlur={(e) => setFormName((prev) => prev.toUpperCase())}
                  placeholder="NAMA PENUH RASMI (HURUF BESAR)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 uppercase font-semibold"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Ditukar secara automatik ke huruf besar (CAPITAL LETTERS).
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address (Emel Rasmi Institusi @upm.edu.my) <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Profwaffy@upm.edu.my"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 font-mono"
                  required
                />
              </div>

              {/* Password with Generator & Visibility */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Password (Kata Laluan Yang Ditetapkan) <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                    title="Jana kata laluan rawak selamat"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Jana Kata Laluan Rawak</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="e.g. EPPT@Pengguna2026"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono font-bold bg-amber-50/30 text-amber-950"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  HQ boleh melihat semua kata laluan dan menyalinnya untuk diberikan kepada pengguna.
                </p>
              </div>

              {/* Department / Organization (optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Department / Organization (Jabatan / Organisasi - Pilihan)
                </label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 font-medium"
                >
                  <option value="Tiada / Belum Ditetapkan">Tiada / Belum Ditetapkan (General / Unassigned)</option>
                  {UPM_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Role (Peranan Sistem)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'applicant' | 'hq')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="applicant">Pemohon Jabatan (Applicant)</option>
                    <option value="hq">Urus Setia HQ (Reviewer / Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Capaian</label>
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-red-700 focus:ring-red-600 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      {formIsActive ? 'Akaun Aktif' : 'Nyahaktifkan'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Cipta & Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
