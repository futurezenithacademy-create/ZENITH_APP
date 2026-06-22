function navigateToView(viewId) {
    document.querySelectorAll('.mpage').forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        targetView.classList.add('active-view');
    }

    if (viewId === 'portal') {
        renderPortalLayout();
    } else if (viewId === 'parent-portal') {
        renderParentLayout();
    }
}

function showAuthScreen(tab = 'login') {
    authTab = tab;
    const authModal = document.getElementById('auth');
    if (authModal) {
        authModal.classList.remove('hidden-view');
        authModal.classList.add('active-view');
        renderAuthCard();
    }
}

function hideAuthScreen() {
    const authModal = document.getElementById('auth');
    if (authModal) {
        authModal.classList.remove('active-view');
        authModal.classList.add('hidden-view');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const marketingShell = document.getElementById('marketing-content');
    if (marketingShell) {
        marketingShell.innerHTML = `
            <section class="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <div class="lg:col-span-7 space-y-8 animate-fade-in">
                    <span class="inline-flex items-center gap-2 bg-blue-50 text-[#1A56DB] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-100">
                        ✨ Production Platform Live
                    </span>
                    <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-[#0C1A2E] leading-[1.05]">
                        Master the SAT with <span class="italic font-normal font-['Cormorant_Garamond'] text-[#1A56DB]">editorial precision</span>.
                    </h1>
                    <p class="text-gray-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                        High-contrast testing parameters engineered to match authentic digital testing environments. Built for absolute diagnostic growth.
                    </p>
                    <div class="flex flex-wrap gap-4 pt-2">
                        <button onclick="showAuthScreen('signup')" class="bg-[#1A56DB] text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10">
                            Establish Student Account
                        </button>
                        <button onclick="showAuthScreen('signup')" class="bg-white border border-gray-200 hover:border-gray-300 text-[#0C1A2E] text-sm font-semibold px-6 py-3.5 rounded-xl transition">
                            Parent Observer Registration
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-5 bg-white p-8 rounded-3xl hero-card border border-gray-100/80 relative">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-xs font-bold tracking-widest text-[#1A56DB] uppercase">Active Matrix Projection</span>
                        <span class="text-xs font-mono bg-green-50 text-[#0F7B4E] px-2 py-0.5 rounded border border-green-100 font-medium">99.4% Verified</span>
                    </div>
                    <div class="text-6xl font-bold tracking-tight text-[#0C1A2E] mb-3">1540</div>
                    <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6">
                        <div class="bg-[#1A56DB] h-full w-[88%] rounded-full"></div>
                    </div>
                    <div class="space-y-3 pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium font-mono uppercase tracking-wider">
                        <div>// Target parameters initialized</div>
                        <div>// Framework monitoring active</div>
                    </div>
                </div>
            </section>
        `;
    }
});
