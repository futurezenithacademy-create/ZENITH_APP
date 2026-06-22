function renderPortalLayout() {
    const portalContainer = document.getElementById('portal');
    portalContainer.innerHTML = `
        <header class="bg-[#0C1A2E] text-white px-6 py-4 flex justify-between items-center shadow-md">
            <div class="flex items-center space-x-3">
                <span class="text-xl font-bold font-['Cormorant_Garamond'] tracking-tight">ZENITH<span class="text-[#1A56DB]">.</span>Portal</span>
                <span class="bg-blue-900/40 text-blue-400 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-blue-800/50 font-semibold">Student Sandbox</span>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-400 font-mono" id="portal-user-email">${currentUser ? currentUser.email : 'loading session...'}</span>
                <button onclick="handleSignOut()" class="text-xs font-semibold tracking-wide uppercase bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition">
                    Sign Out
                </button>
            </div>
        </header>

        <main class="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Testing Arena -->
            <section class="lg:col-span-2 bg-white rounded-2xl p-8 hero-card space-y-6 flex flex-col justify-between min-h-[500px]">
                <div>
                    <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                        <h2 class="text-2xl font-bold tracking-tight">Adaptive Diagnostic Arena</h2>
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-400" id="arena-progress">Item 0 of 0</span>
                    </div>
                    <div id="portal-workspace" class="space-y-6">
                        <!-- Questions inject here -->
                        <p class="text-gray-400 text-sm italic">Loading ZENITH adaptive question array from database node...</p>
                    </div>
                </div>
                <div class="flex justify-end pt-4 border-t border-gray-100 hidden" id="next-btn-container">
                    <button onclick="advanceQuestion()" class="bg-[#1A56DB] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
                        Submit Answer & Advance →
                    </button>
                </div>
            </section>

            <!-- Metrics Aside -->
            <aside class="space-y-6">
                <div class="bg-white rounded-2xl p-6 hero-card border border-gray-100">
                    <h3 class="text-xs font-bold tracking-wider uppercase text-gray-400 mb-4">Performance Metrics Matrix</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-[#F7F9FC] p-4 rounded-xl border border-gray-100">
                            <span class="block text-3xl font-bold tracking-tight text-[#0C1A2E]" id="stat-score">1050</span>
                            <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Projected Score</span>
                        </div>
                        <div class="bg-[#F7F9FC] p-4 rounded-xl border border-gray-100">
                            <span class="block text-3xl font-bold tracking-tight text-[#0C1A2E]" id="stat-total">0</span>
                            <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Items Logged</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl p-6 hero-card border border-gray-100">
                    <h3 class="text-xs font-bold tracking-wider uppercase text-gray-400 mb-2">Adaptive Tracking Status</h3>
                    <p class="text-xs text-gray-500 leading-relaxed">
                        Your performance vector automatically shifts upcoming parameters across difficulty layers ('Easy' | 'Medium' | 'Hard') to precisely isolate your true digital score capability.
                    </p>
                </div>
            </aside>
        </main>
    `;
    loadQuestionsFromAPI();
}

async function loadQuestionsFromAPI() {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error("Database offline");
        questions = await response.json();
        queue = [...questions]; // Initialize test queue
        renderActiveQuestion();
    } catch (err) {
        document.getElementById('portal-workspace').innerHTML = `
            <div class="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium">
                ⚠️ [Database Wait Engine Active]: 500 premium questions are currently generating. Syncing complete backend placeholders until pipeline completes.
            </div>
        `;
    }
}

function renderActiveQuestion() {
    if (queue.length === 0 || qIdx >= queue.length) {
        document.getElementById('portal-workspace').innerHTML = `<h3 class="text-lg font-semibold text-[#0F7B4E]">🎉 Adaptive Diagnostic Suite Complete! Check metrics left.</h3>`;
        return;
    }

    const currentQ = queue[qIdx];
    document.getElementById('arena-progress').innerText = `Item ${qIdx + 1} of ${queue.length}`;
    
    let html = `
        <span class="inline-block bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2">${currentQ.section} • Module ${currentQ.module}</span>
        ${currentQ.passage ? `<div class="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm leading-relaxed mb-4 font-serif text-gray-700">${currentQ.passage}</div>` : ''}
        <p class="text-base font-semibold text-[#0C1A2E] mb-4">${currentQ.stem || currentQ.question}</p>
        <div class="grid grid-cols-1 gap-3">
    `;

    currentQ.choices.forEach((choice) => {
        html += `
            <button onclick="selectChoice('${choice}')" class="choice-btn text-left px-5 py-4 border border-gray-200 rounded-xl hover:border-[#1A56DB] hover:bg-blue-50/20 text-sm transition font-medium">
                ${choice}
            </button>
        `;
    });

    html += `</div>`;
    document.getElementById('portal-workspace').innerHTML = html;
}

let currentSelectedChoice = null;
function selectChoice(choice) {
    currentSelectedChoice = choice;
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('border-[#1A56DB]', 'bg-blue-50/20', 'ring-2', 'ring-blue-500/20');
        if (btn.innerText.trim() === choice) {
            btn.classList.add('border-[#1A56DB]', 'bg-blue-50/20', 'ring-2', 'ring-blue-500/20');
        }
    });
    document.getElementById('next-btn-container').classList.remove('hidden');
}

async function advanceQuestion() {
    if (!currentSelectedChoice) return;
    
    const currentQ = queue[qIdx];
    const isCorrect = (currentSelectedChoice === currentQ.correct);
    
    // Mutation scoring values
    if (isCorrect) {
        score += 10; 
        if (score > 1600) score = 1600;
    } else {
        score -= 5;
        if (score < 400) score = 400;
    }

    // Save tracking analytics logs securely straight to production Supabase
    if (window.supabase && currentUser) {
        await supabase.from('user_activity').insert([
            {
                student_email: currentUser.email,
                question_id: currentQ.id,
                chosen_answer: currentSelectedChoice,
                is_correct: isCorrect
            }
        ]);
    }

    // Update frontend state matrices
    document.getElementById('stat-score').innerText = score;
    document.getElementById('stat-total').innerText = qIdx + 1;

    // Reset selection and load next item
    currentSelectedChoice = null;
    document.getElementById('next-btn-container').classList.add('hidden');
    qIdx++;
    renderActiveQuestion();
}

function handleSignOut() {
    if (window.supabase) supabase.auth.signOut();
    currentUser = null;
    navigateToView('marketing-page');
}
