/**
 * HSAAS Procurement Management System (Sistem e-PPT HSAAS)
 * Main Application Hub
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ProcurementApplication,
  LoginRecord,
  HQDecision,
  AnnualBudgets,
} from './types';
import { INITIAL_APPLICATIONS, INITIAL_LOGIN_LOGS, INITIAL_ANNUAL_BUDGETS } from './data/mockData';

import { Navbar } from './components/Navbar';
import { FooterBar } from './components/FooterBar';
import { LoginModal } from './components/LoginModal';
import { DepartmentVerificationModal } from './components/DepartmentVerificationModal';
import { LoginHistoryModal } from './components/LoginHistoryModal';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { HQReviewActionModal } from './components/HQReviewActionModal';
import { HQBudgetModal } from './components/HQBudgetModal';
import { DepartmentApplicationsList } from './components/DepartmentApplicationsList';
import { HQReviewPanel } from './components/HQReviewPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

const STORAGE_KEY_USER = 'upm_eppt_user_profile';
const STORAGE_KEY_APPS = 'upm_eppt_applications';
const STORAGE_KEY_LOGS = 'upm_eppt_login_logs';
const STORAGE_KEY_BUDGETS = 'upm_eppt_annual_budgets';

export default function App() {
  // Load initial persistent user or set default
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'hq' && (parsed.email === 'bursar.hq@upm.edu.my' || parsed.name.includes('Bursar'))) {
          parsed.name = 'Perolehan_hsaas';
          parsed.email = 'perolehan_hsaas@upm.edu.my';
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(parsed));
        }
        return parsed;
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
    return {
      name: 'Abdul Waffy',
      email: 'abdulwaffy@upm.edu.my',
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

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'applicant' | 'hq' | 'analytics'>('applicant');

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

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
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
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers for Login & Identity
  const handleLoginSuccess = (updatedUser: UserProfile, newRecord: LoginRecord) => {
    setUser(updatedUser);
    setLoginLogs((prev) => [newRecord, ...prev]);
    setIsLoggedIn(true);
    sessionStorage.setItem('upm_eppt_logged_in', 'true');
    setIsLoginModalOpen(false);

    // Auto navigate tab if HQ role
    if (updatedUser.role === 'hq') {
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
    setUser(updatedUser);
    if (updatedUser.role === 'hq') {
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

  const handleDeleteApplication = (id: string) => {
    const targetApp = applications.find((a) => a.id === id);
    if (targetApp) {
      const isOwner =
        (targetApp.applicantEmail && targetApp.applicantEmail.toLowerCase() === user.email.toLowerCase()) ||
        (!targetApp.applicantEmail && targetApp.applicantName && targetApp.applicantName.toLowerCase() === user.name.toLowerCase()) ||
        (!targetApp.applicantEmail && !targetApp.applicantName);

      if (!isOwner) {
        alert(`Akses Dibataskan: Anda hanya boleh memadam permohonan milik anda sendiri (${user.name}). Permohonan ini milik ${targetApp.applicantName}.`);
        return;
      }
    }
    if (window.confirm('Adakah anda pasti mahu memadam permohonan perolehan ini?')) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
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
    }
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            status: 'Submitted',
            updatedAt: new Date().toISOString(),
          };
        }
        return app;
      })
    );
  };

  // HQ Review Decision Handler
  const handleHQDecision = (id: string, decision: HQDecision) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            status: decision.status,
            hqDecision: decision,
            updatedAt: decision.decisionDate,
          };
        }
        return app;
      })
    );

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col pb-16">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onOpenVerification={() => setIsVerificationModalOpen(true)}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
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
          />
        )}

        {activeTab === 'hq' && (
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
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            applications={applications}
            user={user}
            annualBudgets={annualBudgets}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}
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
        onLoginSuccess={handleLoginSuccess}
        initialUser={user}
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
        user={user}
        onClearLogs={() => setLoginLogs([])}
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
        readOnly={activeTab === 'hq' || activeTab === 'analytics'}
        onEdit={(app) => {
          setEditingApplication(app);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteApplication}
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
        onSaveBudgets={(newBudgets) => setAnnualBudgets(newBudgets)}
      />
    </div>
  );
}
