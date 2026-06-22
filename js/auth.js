/* ══════════════════════════════════════════════════════════════
   ZENITH — auth.js
   Supabase Auth workflows: sign up, sign in, sign out.
   Handles student and parent registration with role metadata.
══════════════════════════════════════════════════════════════ */

'use strict';

// ── UI HELPERS ─────────────────────────────────────────────────

function showAuthNotification(containerId, type, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.className = `auth-notification ${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
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
  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');

  clearAuthNotification('auth-notification');
  clearAuthNotification('auth-notification-reg');

  if (tab === 'login') {
    loginForm.style.display    = '';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = '';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

// ── PARENT FIELD TOGGLE ────────────────────────────────────────

function toggleParentField() {
  const roleInputs = document.querySelectorAll('input[name="user-role"]');
  let selected = 'student';
  roleInputs.forEach(r => { if (r.checked) selected = r.value; });

  const field = document.getElementById('parent-student-field');
  if (field) {
    field.style.display = selected === 'parent' ? '' : 'none';
  }
}

// ── SHOW AUTH VIEW ─────────────────────────────────────────────

function showAuthView(tab) {
  navigateToView('auth');
  // Small defer to ensure the view is visible before switching tab
  setTimeout(() => switchAuthTab(tab || 'login'), 60);
}

// ── SIGN IN ────────────────────────────────────────────────────

async function handleLogin() {
  const email    = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const notifId  = 'auth-notification';

  clearAuthNotification(notifId);

  if (!email || !password) {
    showAuthNotification(notifId, 'error', 'Please enter your email and password.');
    return;
  }

  setButtonLoading('btn-login', true, 'Sign In');

  const { data, error } = await window.ZENITH_DB.auth.signInWithPassword({ email, password });

  setButtonLoading('btn-login', false, 'Sign In');

  if (error) {
    let msg = error.message;
    if (msg.includes('Invalid login')) msg = 'Incorrect email or password. Please try again.';
    if (msg.includes('Email not confirmed')) msg = 'Please verify your email address before signing in. Check your inbox.';
    showAuthNotification(notifId, 'error', msg);
    return;
  }

  // Successful sign-in — onAuthStateChange will handle routing
  showAuthNotification(notifId, 'success', 'Signed in. Loading your portal…');
}

// ── SIGN UP ────────────────────────────────────────────────────

async function handleRegister() {
  const name     = document.getElementById('reg-name')?.value?.trim();
  const email    = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-password')?.value;
  const notifId  = 'auth-notification-reg';

  // Determine selected role
  const roleInputs = document.querySelectorAll('input[name="user-role"]');
  let role = 'student';
  roleInputs.forEach(r => { if (r.checked) role = r.value; });

  const studentEmail = role === 'parent'
    ? document.getElementById('reg-student-email')?.value?.trim()
    : null;

  clearAuthNotification(notifId);

  // ── VALIDATION ───────────────────────────────────────────────
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

  setButtonLoading('btn-register', true, 'Create Account');

  // Build metadata payload
  const metadata = {
    full_name: name,
    role: role,
  };
  if (role === 'parent' && studentEmail) {
    metadata.student_email = studentEmail.toLowerCase();
  }

  const { data, error } = await window.ZENITH_DB.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  setButtonLoading('btn-register', false, 'Create Account');

  if (error) {
    let msg = error.message;
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      msg = 'An account with this email already exists. Please sign in instead.';
    }
    if (msg.includes('Password should be')) {
      msg = 'Password must be at least 8 characters and include a mix of letters and numbers.';
    }
    showAuthNotification(notifId, 'error', msg);
    return;
  }

  // Supabase may auto-confirm or require email verification depending on project settings
  if (data?.user && !data?.session) {
    // Email confirmation required
    showAuthNotification(
      notifId,
      'success',
      'Account created! Please check your email inbox and click the verification link to activate your account.'
    );
  } else if (data?.session) {
    // Auto-confirmed — onAuthStateChange will route
    showAuthNotification(notifId, 'success', 'Account created and verified. Loading your portal…');
  }
}

// ── SIGN OUT ───────────────────────────────────────────────────

async function handleSignOut() {
  const { error } = await window.ZENITH_DB.auth.signOut();
  if (error) {
    console.error('[ZENITH:Auth] Sign out error:', error.message);
  }
  // onAuthStateChange will fire SIGNED_OUT → app.js routes to marketing page
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
