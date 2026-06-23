/* ══════════════════════════════════════════════════════════════
   ZENITH — supabase-config.js
   Production Supabase client initialization.
   ══════════════════════════════════════════════════════════════ */
'use strict';

// Prefer runtime-injected variables from index.html script block
const supabaseUrl = window.ENV_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = window.ENV_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('[ZENITH] Supabase credentials are not configured.');
}

// ── CLIENT INITIALIZATION ───────────────────────────────────────
// Explicitly call the global base window instance from the CDN script
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Standardize references across namespaces so ALL buttons find it
window.supabase = supabaseClient;
window.ZENITH_DB = supabaseClient;

// ── AUTH STATE OBSERVER ────────────────────────────────────────
window.ZENITH_DB.auth.onAuthStateChange((event, session) => {
    console.log('[ZENITH:Auth]', event, session?.user?.email ?? 'no user');
    
    if (session) {
        window.currentUser = session.user;
        // Immediate Routing Fallback for New Users
        const role = session.user.user_metadata?.role || 'student';
        if (typeof navigateToView === 'function') {
            navigateToView(role === 'parent' ? 'parent-portal' : 'portal');
        }
    } else {
        window.currentUser = null;
    }

    if (typeof window.onZenithAuthChange === 'function') {
        window.onZenithAuthChange(event, session);
    } else {
        window.__zenithPendingAuthEvent = { event, session };
    }
});

// ── HELPERS ────────────────────────────────────────────────────
async function getCurrentUser() {
    const { data: { user }, error } = await window.ZENITH_DB.auth.getUser();
    if (error) {
        console.error('[ZENITH:Auth] getUser error:', error.message);
        return null;
    }
    return user;
}

async function getCurrentSession() {
    const { data: { session }, error } = await window.ZENITH_DB.auth.getSession();
    if (error) {
        console.error('[ZENITH:Auth] getSession error:', error.message);
        return null;
    }
    return session;
}

function getUserRole(user) {
    if (!user) return null;
    return user.user_metadata?.role || 'student';
}

function getLinkedStudentEmail(user) {
    if (!user) return null;
    return user.user_metadata?.student_email || null;
}

// ── EXPORTS ────────────────────────────────────────────────────
window.ZenithAuth = {
    getCurrentUser,
    getCurrentSession,
    getUserRole,
    getLinkedStudentEmail,
};
console.log("🚀 [ZENITH:Database] Connection profiles standardized successfully.");
