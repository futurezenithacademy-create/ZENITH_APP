/* ══════════════════════════════════════════════════════════════
   ZENITH — auth.js
   Supabase Auth workflows: sign up, sign in, sign out.
   Handles student and parent registration with role metadata.
   ══════════════════════════════════════════════════════════════ */
'use strict';

// Resolve global Supabase client instance securely across code namespaces
const getSupabase = () => window.supabase || window.ZENITH_DB || (window.ZenithDB ? window.ZenithDB.client : null);

// ── UI HELPERS ─────────────────────────────────────────────────
function showAuthNotification(containerId, type, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.className = `auth-notification ${type}`;
    el.textContent = message;
    el.classList.remove('hidden');
    
    // Fallback: If styling styles.css classes aren't built yet, use quick innerHTML painting
    if (type === 'success') {
        el.style.backgroundColor = '#ECFDF5';
        el.style.color = '#0F7B4E';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';
    } else if (type === 'error') {
        el.style.backgroundColor = '#FEF2F2';
        el.style.color = '#991B1B';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';
    }
}

function clearAuthNotification(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.className = 'auth-notification hidden';
    el.textContent = '';
}

function setButtonLoading(btnId, loading, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : defaultText;
}

// ── TAB SWITCHING ──────────────────────────────────────────────
function switchAuthTab(tab) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    clearAuthNotification('auth-notification');
    clearAuthNotification('auth-notification-reg');

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = '';
        if (registerForm) registerForm.style.display = 'none';
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = '';
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabRegister) tabRegister.classList.add('active');
    }
}

// ── PARENT FIELD TOGGLE ────────────────────────────────────────
function toggleParentField() {
    const roleInputs = document.querySelectorAll('input[name="user-role"]');
    let selected = 'student';
    roleInputs.forEach(r => {
        if (r.checked) selected = r.value;
    });

    const field = document.getElementById('parent-student-field');
    if (field) {
        field.style.display = selected === 'parent' ? '' : 'none';
    }
}

// ── SHOW AUTH VIEW ─────────────────────────────────────────────
function showAuthView(tab) {
    if (typeof navigateToView === 'function') {
        navigateToView('auth');
    } else {
        showAuthScreen(tab);
    }
    setTimeout(() => switchAuthTab(tab || 'login'), 60);
}

// ── SIGN IN ────────────────────────────────────────────────────
async function handleLogin() {
    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value;
    const notifId = 'auth-notification';
    clearAuthNotification(notifId);

    if (!email || !password) {
        showAuthNotification(notifId, 'error', 'Please enter your email and password.');
        return;
    }

    const client = getSupabase();
    if (!client) {
        showAuthNotification(notifId, 'error', 'ZENITH System Connection is currently initializing. Please try again in 5 seconds.');
        return;
    }

    setButtonLoading('btn-login', true, 'Sign In');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    setButtonLoading('btn-login', false, 'Sign In');

    if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login')) msg = 'Incorrect email or password. Please try again.';
        if (msg.includes('Email not confirmed')) msg = 'Please verify your email address before signing in. Check your inbox.';
        showAuthNotification(notifId, 'error', msg);
        return;
    }

    // Success Handoff Logic
    showAuthNotification(notifId, 'success', 'Signed in. Loading your portal…');
    currentUser = data.user;
    
    setTimeout(() => {
        if (typeof hideAuthScreen === 'function') hideAuthScreen();
        const role = data.user?.user_metadata?.role || 'student';
        if (typeof navigateToView === 'function') {
            navigateToView(role === 'parent' ? 'parent-portal' : 'portal');
        }
    }, 1000);
}

// ── SIGN UP ────────────────────────────────────────────────────
async function handleRegister() {
    const name = document.getElementById('reg-name')?.value?.trim();
    const email = document.getElementById('reg-email')?.value?.trim();
    const password = document.getElementById('reg-password')?.value;
    const notifId = 'auth-notification-reg';

    const roleInputs = document.querySelectorAll('input[name="user-role"]');
    let role = 'student';
    roleInputs.forEach(r => {
        if (r.checked) role = r.value;
    });

    const studentEmail = role === 'parent' ? document.getElementById('reg-student-email')?.value?.trim() : null;
    clearAuthNotification(notifId);

    if (!name) {
        showAuthNotification(notifId, 'error', 'Please enter your full name.');
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthNotification(notifId, 'error', 'Please enter a valid email address.');
        return;
    }
    if (!password || password.length < 8) {
        showAuthNotification(notifId, 'error', 'Password must be at least 8 characters.');
        return;
    }

    if (role === 'parent') {
        if (!studentEmail) {
            showAuthNotification(notifId, 'error', 'Please enter the student email address you wish to monitor.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
            showAuthNotification(notifId, 'error', 'Please enter a valid student email address.');
            return;
        }
        if (studentEmail.toLowerCase() === email.toLowerCase()) {
            showAuthNotification(notifId, 'error', 'The student email must differ from your own email address.');
            return;
        }
    }

    const client = getSupabase();
    if (!client) {
        showAuthNotification(notifId, 'error', 'Database cluster unreachable. Re-syncing framework parameters...');
        return;
    }

    setButtonLoading('btn-register', true, 'Create Account');

    const metadata = {
        full_name: name,
        role: role,
    };
    if (role === 'parent' && studentEmail) {
        metadata.student_email = studentEmail.toLowerCase();
        metadata.parent_email = studentEmail.toLowerCase(); // Map standard string fallback variables
    }

    const { data, error } = await client.auth.signUp({
        email: email,
        password: password,
        options: { data: metadata },
    });

    setButtonLoading('btn-register', false, 'Create Account');

    if (error) {
        let msg = error.message;
        if (msg.includes('already registered') || msg.includes('already been registered')) {
            msg = 'An account with this email already exists. Please sign in instead.';
        }
        showAuthNotification(notifId, 'error', msg);
        return;
    }

    currentUser = data.user;

    if (data?.user && !data?.session) {
        showAuthNotification(notifId, 'success', 'Account created! Please check your email inbox and click the verification link to activate your account.');
    } else {
        showAuthNotification(notifId, 'success', 'Account created and verified. Loading your portal…');
        setTimeout(() => {
            if (typeof hideAuthScreen === 'function') hideAuthScreen();
            if (typeof navigateToView === 'function') {
                navigateToView(role === 'parent' ? 'parent-portal' : 'portal');
            }
        }, 1200);
    }
}

// ── SIGN OUT ───────────────────────────────────────────────────
async function handleSignOut() {
    const client = getSupabase();
    if (client) {
        await client.auth.signOut();
    }
    currentUser = null;
    if (typeof navigateToView === 'function') {
        navigateToView('marketing-page');
    } else {
        window.location.reload();
    }
}

// ── EXPORTS ───────────────────────────────────────────────────
window.ZenithAuthUI = {
    showAuthView,
    switchAuthTab,
    toggleParentField,
    handleLogin,
    handleRegister,
    handleSignOut,
};
