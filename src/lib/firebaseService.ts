import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';
import { ProcurementApplication, AnnualBudgets, LoginRecord, UserProfile, DeletionAuditLog, WhitelistUser } from '../types';
import { INITIAL_APPLICATIONS, INITIAL_ANNUAL_BUDGETS, INITIAL_LOGIN_LOGS } from '../data/mockData';

// Sanitizer to eliminate undefined values that cause Firestore setDoc/updateDoc to throw
function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

// Ensure user is authenticated in Firebase Auth for Firestore compliance across all devices
export async function authenticateWithFirebase(email?: string, password = 'Password123!'): Promise<FirebaseUser | null> {
  // If already authenticated, reuse session
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (!email || !email.includes('@')) {
    try {
      const anon = await signInAnonymously(auth);
      console.log('Signed in anonymously to Firebase for device access:', anon.user.uid);
      return anon.user;
    } catch (e) {
      console.warn('Anonymous auth fallback error:', e);
      return null;
    }
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return credential.user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        return newCred.user;
      } catch (createErr) {
        console.warn('Could not create Firebase user, trying fallback:', createErr);
      }
    }
    // Fallback attempt anonymous or return current user if logged in
    if (auth.currentUser) {
      return auth.currentUser;
    }
    try {
      const anon = await signInAnonymously(auth);
      return anon.user;
    } catch {
      return null;
    }
  }
}

// Initialize anonymous auth immediately on module load to guarantee cross-device access
if (typeof window !== 'undefined') {
  authenticateWithFirebase().catch((err) => {
    console.log('Initial background auth initialized', err);
  });
}

// Track Auth State
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ==================== APPLICATIONS SYNC ====================

export function subscribeToApplications(onUpdate: (apps: ProcurementApplication[]) => void) {
  const appsRef = collection(db, 'applications');

  const unsubscribe = onSnapshot(
    appsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const appsList: ProcurementApplication[] = [];
        snapshot.forEach((docSnap) => {
          appsList.push(docSnap.data() as ProcurementApplication);
        });
        // Sort by updatedAt or createdAt desc
        appsList.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        onUpdate(appsList);
      }
    },
    (error) => {
      console.error('Firestore applications subscription error:', error);
      const local = localStorage.getItem('upm_eppt_applications');
      if (local) {
        try { onUpdate(JSON.parse(local)); } catch { onUpdate([]); }
      } else {
        onUpdate([]);
      }
    }
  );

  return unsubscribe;
}

export async function clearAllApplicationsFromFirestore() {
  try {
    const appsRef = collection(db, 'applications');
    const snap = await getDocs(appsRef);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log('Successfully cleared all applications from Firestore');
    }
  } catch (err) {
    console.error('Failed to clear all applications from Firestore:', err);
    throw err;
  }
}

export async function saveApplicationToFirestore(app: ProcurementApplication) {
  try {
    const docRef = doc(db, 'applications', app.id);
    const cleanData = sanitizeForFirestore(app);
    await setDoc(docRef, cleanData, { merge: true });
    console.log('Successfully saved application to Firestore cloud:', app.id, app.status);
  } catch (err) {
    console.error('Failed to save application to Firestore:', err);
    throw err;
  }
}

export async function deleteApplicationFromFirestore(id: string) {
  try {
    const docRef = doc(db, 'applications', id);
    await deleteDoc(docRef);
    console.log('Successfully deleted application from Firestore:', id);
  } catch (err) {
    console.error('Failed to delete application from Firestore:', err);
    throw err;
  }
}

export async function batchDeleteApplicationsFromFirestore(ids: string[]) {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      const docRef = doc(db, 'applications', id);
      batch.delete(docRef);
    });
    await batch.commit();
    console.log(`Successfully batch deleted ${ids.length} applications from Firestore`);
  } catch (err) {
    console.error('Failed to batch delete applications from Firestore:', err);
    throw err;
  }
}

// ==================== ANNUAL BUDGETS SYNC ====================

export function subscribeToAnnualBudgets(onUpdate: (budgets: AnnualBudgets) => void) {
  const budgetDocRef = doc(db, 'annual_budgets', 'main');

  const unsubscribe = onSnapshot(
    budgetDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.budgets) {
          onUpdate(data.budgets as AnnualBudgets);
        }
      } else {
        seedAnnualBudgets();
        onUpdate(INITIAL_ANNUAL_BUDGETS);
      }
    },
    (error) => {
      console.error('Firestore budgets subscription error:', error);
      onUpdate(INITIAL_ANNUAL_BUDGETS);
    }
  );

  return unsubscribe;
}

async function seedAnnualBudgets() {
  try {
    const budgetDocRef = doc(db, 'annual_budgets', 'main');
    await setDoc(budgetDocRef, { budgets: sanitizeForFirestore(INITIAL_ANNUAL_BUDGETS) });
  } catch (err) {
    console.warn('Failed to seed annual budgets:', err);
  }
}

export async function saveAnnualBudgetsToFirestore(budgets: AnnualBudgets) {
  try {
    const budgetDocRef = doc(db, 'annual_budgets', 'main');
    await setDoc(budgetDocRef, { budgets: sanitizeForFirestore(budgets) }, { merge: true });
    console.log('Successfully saved annual budgets to Firestore');
  } catch (err) {
    console.error('Failed to save annual budgets to Firestore:', err);
    throw err;
  }
}

// ==================== LOGIN LOGS SYNC ====================

export function subscribeToLoginLogs(onUpdate: (logs: LoginRecord[]) => void) {
  const logsRef = collection(db, 'login_logs');

  const unsubscribe = onSnapshot(
    logsRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedLoginLogs();
        onUpdate(INITIAL_LOGIN_LOGS);
      } else {
        const logsList: LoginRecord[] = [];
        snapshot.forEach((docSnap) => {
          logsList.push(docSnap.data() as LoginRecord);
        });
        logsList.sort((a, b) => new Date(b.loginTimestamp).getTime() - new Date(a.loginTimestamp).getTime());
        onUpdate(logsList);
      }
    },
    (error) => {
      console.error('Firestore login logs error:', error);
      onUpdate(INITIAL_LOGIN_LOGS);
    }
  );

  return unsubscribe;
}

async function seedLoginLogs() {
  try {
    const logsRef = collection(db, 'login_logs');
    const snap = await getDocs(logsRef);
    if (snap.empty) {
      const batch = writeBatch(db);
      INITIAL_LOGIN_LOGS.forEach((record) => {
        const docRef = doc(db, 'login_logs', record.id);
        batch.set(docRef, sanitizeForFirestore(record));
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Failed to seed login logs:', err);
  }
}

export async function addLoginLogToFirestore(record: LoginRecord) {
  try {
    const docRef = doc(db, 'login_logs', record.id);
    await setDoc(docRef, sanitizeForFirestore(record));
  } catch (err) {
    console.error('Failed to add login log to Firestore:', err);
  }
}

// ==================== USER PROFILE SYNC ====================

export async function saveUserProfileToFirestore(user: UserProfile) {
  try {
    // Sanitize document ID using sanitized email
    const docId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, 'user_profiles', docId);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
  }
}

// ==================== SYSTEM AUDIT LOGS SYNC ====================

export function subscribeToAuditLogs(onUpdate: (logs: DeletionAuditLog[]) => void) {
  const auditLogsRef = collection(db, 'audit_logs');

  const unsubscribe = onSnapshot(
    auditLogsRef,
    (snapshot) => {
      const logsList: DeletionAuditLog[] = [];
      snapshot.forEach((docSnap) => {
        logsList.push(docSnap.data() as DeletionAuditLog);
      });
      // Sort newest first
      logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logsList);
    },
    (error) => {
      console.error('Firestore audit logs subscription error:', error);
    }
  );

  return unsubscribe;
}

export async function addAuditLogToFirestore(record: DeletionAuditLog) {
  try {
    const docRef = doc(db, 'audit_logs', record.id);
    await setDoc(docRef, sanitizeForFirestore(record));
    console.log('Successfully added deletion audit log to Firestore:', record.id, record.applicationRef.referenceNo);
  } catch (err) {
    console.error('Failed to add audit log to Firestore:', err);
  }
}

export async function clearAuditLogsFromFirestore() {
  try {
    const auditLogsRef = collection(db, 'audit_logs');
    const snap = await getDocs(auditLogsRef);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      console.log('Successfully cleared audit logs from Firestore');
    }
  } catch (err) {
    console.error('Failed to clear audit logs from Firestore:', err);
  }
}

// ==================== WHITELIST USERS SYNC ====================

export function subscribeToWhitelistUsers(onUpdate: (users: WhitelistUser[]) => void) {
  const whitelistRef = collection(db, 'whitelist_users');

  const unsubscribe = onSnapshot(
    whitelistRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const usersList: WhitelistUser[] = [];
        snapshot.forEach((docSnap) => {
          usersList.push(docSnap.data() as WhitelistUser);
        });
        usersList.sort((a, b) => a.name.localeCompare(b.name));
        onUpdate(usersList);
      }
    },
    (error) => {
      console.error('Firestore whitelist users subscription error:', error);
    }
  );

  return unsubscribe;
}

export async function saveWhitelistUserToFirestore(user: WhitelistUser) {
  try {
    const docRef = doc(db, 'whitelist_users', user.id);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
    console.log('Successfully saved whitelist user to Firestore:', user.email);
  } catch (err) {
    console.error('Failed to save whitelist user to Firestore:', err);
  }
}

export async function deleteWhitelistUserFromFirestore(userId: string) {
  try {
    const docRef = doc(db, 'whitelist_users', userId);
    await deleteDoc(docRef);
    console.log('Successfully deleted whitelist user from Firestore:', userId);
  } catch (err) {
    console.error('Failed to delete whitelist user from Firestore:', err);
  }
}

export async function seedInitialWhitelistUsersToFirestore(users: WhitelistUser[]) {
  try {
    const whitelistRef = collection(db, 'whitelist_users');
    const snap = await getDocs(whitelistRef);
    if (snap.empty) {
      console.log('Seeding initial 32 whitelist users into Firestore...');
      const batch = writeBatch(db);
      users.forEach((u) => {
        const docRef = doc(db, 'whitelist_users', u.id);
        batch.set(docRef, sanitizeForFirestore(u));
      });
      await batch.commit();
      console.log('Successfully seeded initial whitelist users to Firestore.');
    }
  } catch (err) {
    console.warn('Could not seed initial whitelist users to Firestore:', err);
  }
}
