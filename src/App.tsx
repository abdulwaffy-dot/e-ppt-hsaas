/**
 * HSAAS Procurement Management System (Sistem e-PPT HSAAS)
 * Main Application Hub
 */

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import {
  UserProfile,
  ProcurementApplication,
  LoginRecord,
  HQDecision,
  AnnualBudgets,
  DeletionAuditLog,
  DeletionReasonCategory,
  AmountAdjustment,
  WhitelistUser,
} from './types';
import { INITIAL_APPLICATIONS, INITIAL_LOGIN_LOGS, INITIAL_ANNUAL_BUDGETS } from './data/mockData';
import { INITIAL_WHITELIST_USERS, STORAGE_KEY_WHITELIST } from './data/whitelistUsers';
import {
  subscribeToApplications,
  subscribeToAnnualBudgets,
  subscribeToLoginLogs,
  subscribeToAuditLogs,
  subscribeToWhitelistUsers,
  saveApplicationToFirestore,
  deleteApplicationFromFirestore,
  batchDeleteApplicationsFromFirestore,
  clearAllApplicationsFromFirestore,
  saveAnnualBudgetsToFirestore,
  addLoginLogToFirestore,
  addAuditLogToFirestore,
  clearAuditLogsFromFirestore,
  authenticateWithFirebase,
  saveUserProfileToFirestore,
  saveWhitelistUserToFirestore,
  deleteWhitelistUserFromFirestore,
  seedInitialWhitelistUsersToFirestore,
} from './lib/firebaseService';

import { Navbar } from './components/Navbar';
import { FooterBar } from './components/FooterBar';
import { LoginModal } from './components/LoginModal';
import { DepartmentVerificationModal } from './components/DepartmentVerificationModal';
import { LoginHistoryModal } from './components/LoginHistoryModal';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { HQReviewActionModal } from './components/HQReviewActionModal';
import { HQAmountAdjustModal } from './components/HQAmountAdjustModal';
import { HQBudgetModal } from './components/HQBudgetModal';
import { HQDeleteConfirmationModal } from './components/HQDeleteConfirmationModal';
import { DepartmentApplicationsList } from './components/DepartmentApplicationsList';
import { HQReviewPanel } from './components/HQReviewPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WhitelistLoginScreen } from './components/WhitelistLoginScreen';
import { WhitelistManagementModal } from './components/WhitelistManagementModal';

const STORAGE_KEY_USER = 'upm_eppt_user_profile';
const STORAGE_KEY_APPS = 'upm_eppt_applications';
const STORAGE_KEY_LOGS = 'upm_eppt_login_logs';
const STORAGE_KEY_BUDGETS = 'upm_eppt_annual_budgets';
const STORAGE_KEY_AUDIT_LOGS = 'upm_eppt_audit_logs';

export default function App() {
  // Load whitelist users directory
  const [whitelistUsers, setWhitelistUsers] = useState<WhitelistUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WHITELIST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved whitelist users:', e);
      }
    }
    return INITIAL_WHITELIST_USERS;
  });

  // Load initial persistent user or set default approved user
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'hq') {
          parsed.name = 'PEROLEHAN HSAAS (SYSTEM ADMINISTRATOR)';
          parsed.email = 'perolehan_hsaas@upm.edu.my';
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(parsed));
          return parsed;
        } else if (parsed.role === 'applicant' && parsed.email) {
          const isApproved = INITIAL_WHITELIST_USERS.some(
            (u) => u.email.toLowerCase() === parsed.email.toLowerCase()
          );
          if (isApproved) {
            parsed.name = (parsed.name || '').toUpperCase();
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    // Default to first approved whitelist user
    return {
      name: 'WAN ZUL HAIKAL HAFIZ BIN WAN ZUKIMAN',
      email: 'zulhaikal@upm.edu.my',
      department: 'Information Technology Department',
      loginDate: formattedTimestamp,
      updateDate: formattedTimestamp,
      role: 'applicant',
    };
  });

  // Load applications list
  const [applications, setApplications] = useState<ProcurementApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved apps:', e);
      }
    }
    return INITIAL_APPLICATIONS;
  });

  // Load login history logs
  const [loginLogs, setLoginLogs] = useState<LoginRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs:', e);
      }
    }
    return INITIAL_LOGIN_LOGS;
  });

  // Load HQ Annual Budgets
  const [annualBudgets, setAnnualBudgets] = useState<AnnualBudgets>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved budgets:', e);
      }
    }
    return INITIAL_ANNUAL_BUDGETS;
  });

  // Load Deletion Audit Logs
  const [auditLogs, setAuditLogs] = useState<DeletionAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved audit logs:', e);
      }
    }
    return [];
  });

  // HQ Deletion Modal state
  const [isHQDeleteModalOpen, setIsHQDeleteModalOpen] = useState(false);
  const [appsToDelete, setAppsToDelete] = useState<ProcurementApplication[]>([]);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'applicant' | 'hq' | 'analytics'>('applicant');

  // Safe tab switcher enforcing HQ lock for applicant/department users
  const handleSelectTab = (tab: 'applicant' | 'hq' | 'analytics') => {
    if (tab !== 'applicant' && user.role !== 'hq') {
      alert(
        'Akses Terhad: Modul HQ Approval & Analytics dikunci untuk pengguna Department PPT Application. Hanya Urus Setia HQ Perolehan HSAAS sahaja berhak mengakses modul ini.'
      );
      setActiveTab('applicant');
      return;
    }
    setActiveTab(tab);
  };

  // Enforce tab locking if user role changes away from HQ
  useEffect(() => {
    if (user.role !== 'hq' && (activeTab === 'hq' || activeTab === 'analytics')) {
      setActiveTab('applicant');
    }
  }, [user.role, activeTab]);

  // Clear all applications from HQ review panel & Firestore
  const handleClearAllApplications = async () => {
    if (
      window.confirm(
        'Adakah anda pasti mahu memadam SEMUA permohonan daripada HQ Approval dan pangkalan data? Semua permohonan akan dikosongkan untuk pendaftaran permohonan baru.'
      )
    ) {
      setApplications([]);
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify([]));
      try {
        await clearAllApplicationsFromFirestore();
        alert('Semua permohonan dalam pangkalan data telah berjaya dipadamkan.');
      } catch (err) {
        console.error('Failed to clear applications from Firestore:', err);
      }
    }
  };

  // Authentication session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('upm_eppt_logged_in') === 'true';
  });

  // Modal visibility states - Force login modal open when user is not logged in
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!isLoggedIn);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isLoginHistoryOpen, setIsLoginHistoryOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Selected item states
  const [editingApplication, setEditingApplication] = useState<ProcurementApplication | null>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<ProcurementApplication | null>(null);
  const [actionApp, setActionApp] = useState<ProcurementApplication | null>(null);
  const [actionDecisionType, setActionDecisionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [appToAdjust, setAppToAdjust] = useState<ProcurementApplication | null>(null);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (user.email) {
      authenticateWithFirebase(user.email);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(loginLogs));
  }, [loginLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(annualBudgets));
  }, [annualBudgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(whitelistUsers));
  }, [whitelistUsers]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    // Seed initial whitelist into Firestore if not present
    seedInitialWhitelistUsersToFirestore(INITIAL_WHITELIST_USERS);

    const unsubApps = subscribeToApplications((firestoreApps) => {
      setApplications(firestoreApps);
    });

    const unsubBudgets = subscribeToAnnualBudgets((firestoreBudgets) => {
      setAnnualBudgets(firestoreBudgets);
    });

    const unsubLogs = subscribeToLoginLogs((firestoreLogs) => {
      setLoginLogs(firestoreLogs);
    });

    const unsubAuditLogs = subscribeToAuditLogs((firestoreAuditLogs) => {
      setAuditLogs(firestoreAuditLogs);
    });

    const unsubWhitelist = subscribeToWhitelistUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setWhitelistUsers(firestoreUsers);
      }
    });

    return () => {
      unsubApps();
      unsubBudgets();
      unsubLogs();
      unsubAuditLogs();
      unsubWhitelist();
    };
  }, []);

  // Sync state across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_APPS && e.newValue) {
        try {
          const syncedApps = JSON.parse(e.newValue);
          setApplications(syncedApps);
        } catch (err) {
          console.error('Failed to sync applications from storage event:', err);
        }
      }
      if (e.key === STORAGE_KEY_USER && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync user from storage event:', err);
        }
      }
      if (e.key === STORAGE_KEY_BUDGETS && e.newValue) {
        try {
          setAnnualBudgets(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync budgets from storage event:', err);
        }
      }
      if (e.key === STORAGE_KEY_AUDIT_LOGS && e.newValue) {
        try {
          setAuditLogs(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync audit logs from storage event:', err);
        }
      }
      if (e.key === STORAGE_KEY_WHITELIST && e.newValue) {
        try {
          setWhitelistUsers(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to sync whitelist from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers for Whitelist User Management (System Administrator Only)
  const handleSaveWhitelistUser = (updatedUser: WhitelistUser) => {
    setWhitelistUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === updatedUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedUser;
        return copy;
      }
      return [updatedUser, ...prev];
    });
    saveWhitelistUserToFirestore(updatedUser);
  };

  const handleDeleteWhitelistUser = (userId: string) => {
    setWhitelistUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteWhitelistUserFromFirestore(userId);
  };

  // Handlers for Login & Identity
  const handleLoginSuccess = (updatedUser: UserProfile, newRecord: LoginRecord) => {
    const finalUser: UserProfile = {
      ...updatedUser,
      name: updatedUser.role === 'applicant' ? updatedUser.name.trim().toUpperCase() : updatedUser.name,
    };
    const finalRecord: LoginRecord = {
      ...newRecord,
      name: updatedUser.role === 'applicant' ? newRecord.name.trim().toUpperCase() : newRecord.name,
    };

    setUser(finalUser);
    setLoginLogs((prev) => [finalRecord, ...prev]);
    addLoginLogToFirestore(finalRecord);
    setIsLoggedIn(true);
    sessionStorage.setItem('upm_eppt_logged_in', 'true');
    setIsLoginModalOpen(false);

    // Auto navigate tab if HQ role
    if (finalUser.role === 'hq') {
      setActiveTab('hq');
    } else {
      setActiveTab('applicant');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('upm_eppt_logged_in');
    setIsLoginModalOpen(true);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    const finalUser: UserProfile = {
      ...updatedUser,
      name: updatedUser.role === 'applicant' ? updatedUser.name.trim().toUpperCase() : updatedUser.name,
    };
    setUser(finalUser);
    saveUserProfileToFirestore(finalUser);
    if (finalUser.role === 'hq') {
      setActiveTab('hq');
    }
  };

  // Handlers for Applications
  const handleSaveApplication = (app: ProcurementApplication) => {
    setApplications((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === app.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = app;
        return updated;
      }
      return [app, ...prev];
    });

    saveApplicationToFirestore(app);

    // Update key in update timestamp for footer display
    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setUser((prev) => ({
      ...prev,
      updateDate: formattedTimestamp,
    }));
  };

  // Open HQ Deletion Modal with selected application(s)
  const handleOpenHQDeleteModal = (apps: ProcurementApplication[]) => {
    if (user.role !== 'hq') {
      alert(
        'Akses Terhad: Fungsi pelupusan rekod ini hanya dibenarkan kepada Urus Setia HQ yang diberi kuasa.'
      );
      return;
    }
    if (apps.length === 0) return;
    setAppsToDelete(apps);
    setIsHQDeleteModalOpen(true);
  };

  // Perform confirmed deletion by HQ user with audit logging
  const handleConfirmHQDelete = async (
    apps: ProcurementApplication[],
    reasonCategory: DeletionReasonCategory,
    reasonText: string
  ) => {
    if (user.role !== 'hq') {
      alert(
        'Akses Terhad: Hanya Urus Setia HQ yang diberi kuasa dibenarkan memadam rekod permohonan.'
      );
      return;
    }

    const idsToDelete = apps.map((a) => a.id);

    // 1. Remove from local applications state immediately
    setApplications((prev) => prev.filter((a) => !idsToDelete.includes(a.id)));

    // 2. Remove permanently from Firestore
    try {
      await batchDeleteApplicationsFromFirestore(idsToDelete);
    } catch (err) {
      console.error('Error in batch deleting from Firestore:', err);
    }

    // 3. Generate system audit log records
    const now = new Date();
    const nowIso = now.toISOString();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newLogs: DeletionAuditLog[] = apps.map((app) => ({
      id: `audit-del-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      action: apps.length > 1 ? 'BATCH_DELETE_PPT_RECORDS' : 'DELETE_PPT_RECORD',
      actionLabel: `Pelupusan Rekod Permohonan PPT (${app.referenceNo})`,
      timestamp: nowIso,
      dateFormatted: formattedDate,
      timeFormatted: formattedTime,
      hqUser: {
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        staffId: user.staffId || 'perolehan_hsaas',
      },
      applicationRef: {
        id: app.id,
        referenceNo: app.referenceNo,
        title: app.title,
        department: app.department,
        estimatedCost: app.estimatedCost,
        year: app.year,
        serviceType: app.serviceType,
        status: app.status,
        applicantName: app.applicantName,
        applicantEmail: app.applicantEmail,
      },
      reasonCategory,
      reason: reasonText,
      ipAddress: '10.221.113.18',
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'HSAAS Workstation',
    }));

    // 4. Save audit log records to Firestore and state
    newLogs.forEach((record) => {
      addAuditLogToFirestore(record);
    });
    setAuditLogs((prev) => [...newLogs, ...prev]);

    // 5. Update last updated timestamp
    setUser((prev) => ({
      ...prev,
      updateDate: `${formattedDate} ${formattedTime}`,
    }));
  };

  const handleClearAuditLogs = () => {
    if (user.role !== 'hq') {
      alert('Akses Terhad: Hanya Urus Setia HQ dibenarkan menguruskan rekod audit.');
      return;
    }
    if (window.confirm('Adakah anda pasti mahu mengosongkan rekod Log Audit Pelupusan Sistem? Tindakan ini tidak boleh dikembalikan.')) {
      setAuditLogs([]);
      clearAuditLogsFromFirestore();
    }
  };

  const handleDeleteApplication = (id: string) => {
    const targetApp = applications.find((a) => a.id === id);
    if (!targetApp) return;

    if (user.role !== 'hq') {
      alert(
        'Akses Terhad: Fungsi pemadaman permohonan telah dikeluarkan daripada akses pemohon. Sila hubungi Urus Setia HQ untuk permohonan pelupusan rekod.'
      );
      return;
    }

    // HQ User: Trigger the official confirmation modal with reason and audit trail
    handleOpenHQDeleteModal([targetApp]);
  };

  // Open HQ Amount Adjustment Modal
  const handleOpenAdjustModal = (app: ProcurementApplication) => {
    if (user.role !== 'hq') {
      alert('Akses Terhad: Penyelarasan amaun permohonan hanya dibenarkan kepada Urus Setia HQ yang diberi kuasa.');
      return;
    }
    setAppToAdjust(app);
    setIsAdjustModalOpen(true);
  };

  // Confirm HQ Amount Adjustment with full audit trail
  const handleConfirmAdjustment = (
    applicationId: string,
    newAmount: number,
    justification: string
  ) => {
    if (user.role !== 'hq') {
      alert('Akses Terhad: Hanya Urus Setia HQ yang dibenarkan melaraskan amaun permohonan.');
      return;
    }

    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const originalCost = targetApp.originalEstimatedCost ?? targetApp.estimatedCost;
    const diff = Math.round((newAmount - originalCost) * 100) / 100;
    const percentage = originalCost > 0 ? (diff / originalCost) * 100 : 0;
    const direction: 'increased' | 'reduced' | 'unchanged' =
      diff < -0.01 ? 'reduced' : diff > 0.01 ? 'increased' : 'unchanged';

    const now = new Date();
    const nowIso = now.toISOString();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newAdjustmentRecord: AmountAdjustment = {
      id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      originalAmount: originalCost,
      adjustedAmount: newAmount,
      differenceAmount: diff,
      percentageChange: percentage,
      direction,
      adjustmentDate: nowIso,
      dateFormatted: formattedDate,
      timeFormatted: formattedTime,
      adjustedBy: user.name,
      adjustedByEmail: user.email,
      adjustedByRole: user.role,
      justification: justification.trim(),
    };

    const updatedApp: ProcurementApplication = {
      ...targetApp,
      estimatedCost: newAmount,
      originalEstimatedCost: originalCost,
      isAmountAdjusted: true,
      adjustedAmount: newAmount,
      adjustmentDifference: diff,
      adjustmentPercentage: percentage,
      adjustmentDirection: direction,
      lastAdjustedAt: nowIso,
      lastAdjustedBy: user.name,
      amountAdjustments: [newAdjustmentRecord, ...(targetApp.amountAdjustments || [])],
      updatedAt: nowIso,
    };

    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? updatedApp : app))
    );
    saveApplicationToFirestore(updatedApp);

    // Record in system audit log
    const auditRecord: DeletionAuditLog = {
      id: `audit-adj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      action: 'ADJUST_REQUESTED_AMOUNT',
      actionLabel: `Penyelarasan Amaun PPT (${targetApp.referenceNo}): ${direction === 'reduced' ? 'Diturunkan' : 'Dinaikkan'} kepada RM ${newAmount.toLocaleString()}`,
      timestamp: nowIso,
      dateFormatted: formattedDate,
      timeFormatted: formattedTime,
      hqUser: {
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        staffId: user.staffId || 'perolehan_hsaas',
      },
      applicationRef: {
        id: targetApp.id,
        referenceNo: targetApp.referenceNo,
        title: targetApp.title,
        department: targetApp.department,
        estimatedCost: newAmount,
        originalCost: originalCost,
        adjustedCost: newAmount,
        differenceCost: diff,
        year: targetApp.year,
        serviceType: targetApp.serviceType,
        status: targetApp.status,
        applicantName: targetApp.applicantName,
        applicantEmail: targetApp.applicantEmail,
      },
      reason: justification.trim(),
      adjustmentDetail: {
        originalAmount: originalCost,
        adjustedAmount: newAmount,
        differenceAmount: diff,
        percentageChange: percentage,
        direction,
      },
      ipAddress: '10.221.113.18',
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'HSAAS Workstation',
    };

    addAuditLogToFirestore(auditRecord);
    setAuditLogs((prev) => [auditRecord, ...prev]);

    setUser((prev) => ({
      ...prev,
      updateDate: `${formattedDate} ${formattedTime}`,
    }));
  };

  const handleSubmitDraft = (id: string) => {
    const targetApp = applications.find((a) => a.id === id);
    if (targetApp) {
      const isOwner =
        (targetApp.applicantEmail && targetApp.applicantEmail.toLowerCase() === user.email.toLowerCase()) ||
        (!targetApp.applicantEmail && targetApp.applicantName && targetApp.applicantName.toLowerCase() === user.name.toLowerCase()) ||
        (!targetApp.applicantEmail && !targetApp.applicantName);

      if (!isOwner) {
        alert(`Akses Dibataskan: Anda hanya boleh menghantar draf permohonan milik anda sendiri (${user.name}).`);
        return;
      }

      const updatedApp: ProcurementApplication = {
        ...targetApp,
        status: 'Submitted',
        updatedAt: new Date().toISOString(),
      };

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updatedApp : app))
      );
      saveApplicationToFirestore(updatedApp);
    }
  };

  // HQ Review Decision Handler with Amount Adjustment support
  const handleHQDecision = (
    id: string,
    decision: HQDecision,
    adjustedAmount?: number,
    adjustmentNote?: string
  ) => {
    const targetApp = applications.find((a) => a.id === id);
    if (!targetApp) return;

    let updatedApp: ProcurementApplication = {
      ...targetApp,
      status: decision.status,
      hqDecision: decision,
      updatedAt: decision.decisionDate,
    };

    if (
      adjustedAmount !== undefined &&
      adjustedAmount > 0 &&
      Math.abs(adjustedAmount - (targetApp.originalEstimatedCost ?? targetApp.estimatedCost)) > 0.01
    ) {
      const originalCost = targetApp.originalEstimatedCost ?? targetApp.estimatedCost;
      const diff = Math.round((adjustedAmount - originalCost) * 100) / 100;
      const percentage = originalCost > 0 ? (diff / originalCost) * 100 : 0;
      const direction: 'increased' | 'reduced' | 'unchanged' =
        diff < -0.01 ? 'reduced' : diff > 0.01 ? 'increased' : 'unchanged';

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const formattedTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const newAdj: AmountAdjustment = {
        id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        originalAmount: originalCost,
        adjustedAmount: adjustedAmount,
        differenceAmount: diff,
        percentageChange: percentage,
        direction,
        adjustmentDate: decision.decisionDate,
        dateFormatted: formattedDate,
        timeFormatted: formattedTime,
        adjustedBy: user.name,
        adjustedByEmail: user.email,
        adjustedByRole: user.role,
        justification: adjustmentNote || decision.justification,
      };

      updatedApp = {
        ...updatedApp,
        estimatedCost: adjustedAmount,
        originalEstimatedCost: originalCost,
        isAmountAdjusted: true,
        adjustedAmount: adjustedAmount,
        adjustmentDifference: diff,
        adjustmentPercentage: percentage,
        adjustmentDirection: direction,
        lastAdjustedAt: decision.decisionDate,
        lastAdjustedBy: user.name,
        amountAdjustments: [newAdj, ...(targetApp.amountAdjustments || [])],
      };

      // Also record system audit log
      const auditRecord: DeletionAuditLog = {
        id: `audit-adj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        action: 'ADJUST_REQUESTED_AMOUNT',
        actionLabel: `Penyelarasan Amaun Semasa Kelulusan PPT (${targetApp.referenceNo}): ${direction === 'reduced' ? 'Diturunkan' : 'Dinaikkan'} kepada RM ${adjustedAmount.toLocaleString()}`,
        timestamp: decision.decisionDate,
        dateFormatted: formattedDate,
        timeFormatted: formattedTime,
        hqUser: {
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.role,
          staffId: user.staffId || 'perolehan_hsaas',
        },
        applicationRef: {
          id: targetApp.id,
          referenceNo: targetApp.referenceNo,
          title: targetApp.title,
          department: targetApp.department,
          estimatedCost: adjustedAmount,
          originalCost: originalCost,
          adjustedCost: adjustedAmount,
          differenceCost: diff,
          year: targetApp.year,
          serviceType: targetApp.serviceType,
          status: decision.status,
          applicantName: targetApp.applicantName,
          applicantEmail: targetApp.applicantEmail,
        },
        reason: adjustmentNote || decision.justification,
        adjustmentDetail: {
          originalAmount: originalCost,
          adjustedAmount: adjustedAmount,
          differenceAmount: diff,
          percentageChange: percentage,
          direction,
        },
        ipAddress: '10.221.113.18',
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'HSAAS Workstation',
      };
      addAuditLogToFirestore(auditRecord);
      setAuditLogs((prev) => [auditRecord, ...prev]);
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? updatedApp : app))
    );
    saveApplicationToFirestore(updatedApp);

    const formattedTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setUser((prev) => ({
      ...prev,
      updateDate: formattedTimestamp,
    }));
  };

  const pendingHQCount = applications.filter((a) => a.status === 'Submitted').length;

  // Whitelist-Based Access Control: Unauthorized users cannot access any module, menu, or page
  if (!isLoggedIn) {
    return (
      <WhitelistLoginScreen
        whitelistUsers={whitelistUsers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col pb-16">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        user={user}
        onOpenVerification={() => setIsVerificationModalOpen(true)}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
        onOpenWhitelist={() => setIsWhitelistModalOpen(true)}
        onLogout={handleLogout}
        pendingHQCount={pendingHQCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {activeTab === 'applicant' && (
          <DepartmentApplicationsList
            applications={applications}
            user={user}
            onOpenNewForm={() => {
              setEditingApplication(null);
              setIsFormModalOpen(true);
            }}
            onOpenEditForm={(app) => {
              setEditingApplication(app);
              setIsFormModalOpen(true);
            }}
            onOpenDetailModal={(app) => {
              setSelectedDetailApp(app);
              setIsDetailModalOpen(true);
            }}
            onDeleteApplication={handleDeleteApplication}
            onSubmitDraft={handleSubmitDraft}
            onHQDeleteRequest={handleOpenHQDeleteModal}
            onOpenAuditLogModal={() => setIsLoginHistoryOpen(true)}
            auditLogsCount={auditLogs.length}
            onOpenAdjustAmount={handleOpenAdjustModal}
          />
        )}

        {activeTab === 'hq' &&
          (user.role === 'hq' ? (
            <HQReviewPanel
              applications={applications}
              user={user}
              annualBudgets={annualBudgets}
              onOpenActionModal={(app, decision) => {
                setActionApp(app);
                setActionDecisionType(decision);
                setIsActionModalOpen(true);
              }}
              onOpenDetailModal={(app) => {
                setSelectedDetailApp(app);
                setIsDetailModalOpen(true);
              }}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onClearAllApplications={handleClearAllApplications}
              onDeleteApplication={handleDeleteApplication}
              onOpenAdjustAmount={handleOpenAdjustModal}
              onOpenWhitelist={() => setIsWhitelistModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md text-center max-w-xl mx-auto space-y-4 my-10">
              <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Akses Terhad - HQ Approval</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda sedang log masuk sebagai <strong>{user.name} ({user.department})</strong>. Modul HQ Approval dikunci untuk pengguna Department PPT Application.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setActiveTab('applicant')}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition shadow-sm"
                >
                  Kembali ke Department PPT Application
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition shadow-sm"
                >
                  Log Masuk Urus Setia HQ
                </button>
              </div>
            </div>
          ))}

        {activeTab === 'analytics' &&
          (user.role === 'hq' ? (
            <AnalyticsDashboard
              applications={applications}
              user={user}
              annualBudgets={annualBudgets}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md text-center max-w-xl mx-auto space-y-4 my-10">
              <div className="w-14 h-14 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Akses Terhad - Analytics</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda sedang log masuk sebagai <strong>{user.name} ({user.department})</strong>. Modul Analytics dikunci untuk pengguna Department PPT Application.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setActiveTab('applicant')}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition shadow-sm"
                >
                  Kembali ke Department PPT Application
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition shadow-sm"
                >
                  Log Masuk Urus Setia HQ
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* Fixed Footer Bar with Section 01 Required Info */}
      <FooterBar
        user={user}
        onOpenProfile={() => setIsVerificationModalOpen(true)}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
      />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialUser={user}
        whitelistUsers={whitelistUsers}
      />

      <WhitelistManagementModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        currentUser={user}
        whitelistUsers={whitelistUsers}
        onSaveUser={handleSaveWhitelistUser}
        onDeleteUser={handleDeleteWhitelistUser}
      />

      <DepartmentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      <LoginHistoryModal
        isOpen={isLoginHistoryOpen}
        onClose={() => setIsLoginHistoryOpen(false)}
        logs={loginLogs}
        auditLogs={auditLogs}
        user={user}
        onClearLogs={() => setLoginLogs([])}
        onClearAuditLogs={handleClearAuditLogs}
        defaultTab={user.role === 'hq' ? 'adjustment' : 'login'}
      />

      <HQDeleteConfirmationModal
        isOpen={isHQDeleteModalOpen}
        onClose={() => {
          setIsHQDeleteModalOpen(false);
          setAppsToDelete([]);
        }}
        applicationsToDelete={appsToDelete}
        hqUser={user}
        onConfirmDelete={handleConfirmHQDelete}
      />

      <HQAmountAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setAppToAdjust(null);
        }}
        application={appToAdjust}
        user={user}
        onConfirmAdjustment={handleConfirmAdjustment}
      />

      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        user={user}
        onSubmitApplication={handleSaveApplication}
        editingApplication={editingApplication}
      />

      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        application={selectedDetailApp}
        user={user}
        readOnly={activeTab === 'analytics'}
        onEdit={(app) => {
          setEditingApplication(app);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteApplication}
        onOpenAdjustAmount={handleOpenAdjustModal}
      />

      <HQReviewActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        application={actionApp}
        decisionType={actionDecisionType}
        user={user}
        onSubmitDecision={handleHQDecision}
      />

      <HQBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        annualBudgets={annualBudgets}
        applications={applications}
        user={user}
        onSaveBudgets={(newBudgets) => {
          setAnnualBudgets(newBudgets);
          saveAnnualBudgetsToFirestore(newBudgets);
        }}
      />
    </div>
  );
}
