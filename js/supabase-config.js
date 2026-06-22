/* ══════════════════════════════════════════════════════════════
   ZENITH — supabase-config.js
   Production Supabase client initialization.
   Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with
   your actual project credentials from https://supabase.com/dashboard
══════════════════════════════════════════════════════════════ */

'use strict';

// ── CREDENTIALS ────────────────────────────────────────────────
// Prefer runtime-injected environment variables (e.g. from Vercel),
// fall back to literal placeholder strings that operators replace.
const supabaseUrl  = window.ENV_SUPABASE_URL  || 'YOUR_SUPABASE_URL';
const supabaseKey  = window.ENV_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Guard: if the operator forgot to set credentials, warn loudly.
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    '[ZENITH] Supabase credentials are not configured. ' +
    'Set ENV_SUPABASE_URL and ENV_SUPABASE_ANON_KEY on your Vercel project, ' +
    'or replace the placeholder strings in js/supabase-config.js.'
  );
}

// ── CLIENT INITIALIZATION ───────────────────────────────────────
// supabase is exposed on window by the CDN script loaded in index.html
// The SDK v2 API: supabase.createClient(url, key)
const { createClient } = supabase;
window.ZENITH_DB = createClient(supabaseUrl, supabaseKey);

// ── AUTH STATE OBSERVER ────────────────────────────────────────
// Fires on every auth change: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT,
// TOKEN_REFRESHED, USER_UPDATED. Routes users to their respective portal
// once app.js has registered the handler via window.onZenithAuthChange.
window.ZENITH_DB.auth.onAuthStateChange((event, session) => {
  console.log('[ZENITH:Auth]', event, session?.user?.email ?? 'no user');

  // Defer until app.js has mounted its handler
  if (typeof window.onZenithAuthChange === 'function') {
    window.onZenithAuthChange(event, session);
  } else {
    // Queue the event so app.js can replay it once ready
    window.__zenithPendingAuthEvent = { event, session };
  }
});

// ── HELPERS ────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user object, or null.
 */
async function getCurrentUser() {
  const { data: { user }, error } = await window.ZENITH_DB.auth.getUser();
  if (error) {
    console.error('[ZENITH:Auth] getUser error:', error.message);
    return null;
  }
  return user;
}

/**
 * Returns the current session, or null.
 */
async function getCurrentSession() {
  const { data: { session }, error } = await window.ZENITH_DB.auth.getSession();
  if (error) {
    console.error('[ZENITH:Auth] getSession error:', error.message);
    return null;
  }
  return session;
}

/**
 * Returns the role string ('student' | 'parent') from user metadata.
 * Defaults to 'student' if no role is present.
 */
function getUserRole(user) {
  if (!user) return null;
  return user.user_metadata?.role || 'student';
}

/**
 * Returns the linked student email for parent accounts.
 */
function getLinkedStudentEmail(user) {
  if (!user) return null;
  return user.user_metadata?.student_email || null;
}

// ── EXPORTS ────────────────────────────────────────────────────
// Attach utilities to global namespace for cross-module access
window.ZenithAuth = {
  getCurrentUser,
  getCurrentSession,
  getUserRole,
  getLinkedStudentEmail,
};
