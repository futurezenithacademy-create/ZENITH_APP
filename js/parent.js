function renderParentLayout() {
    const parentContainer = document.getElementById('parent-portal');
    parentContainer.innerHTML = `
        <header class="bg-[#0C1A2E] text-white px-6 py-4 flex justify-between items-center shadow-md">
            <div class="flex items-center space-x-3">
                <span class="text-xl font-bold font-['Cormorant_Garamond'] tracking-tight">ZENITH<span class="text-[#1A56DB]">.</span>Observer</span>
                <span class="bg-emerald-950/40 text-emerald-400 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-800/50 font-semibold">Parent Matrix</span>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-400 font-mono" id="parent-user-email">${currentUser ? currentUser.email : 'parent@zenith.edu'}</span>
                <button onclick="handleSignOut()" class="text-xs font-semibold tracking-wide uppercase bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition">
                    Sign Out
                </button>
            </div>
        </header>

        <main class="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
            <div class="bg-white rounded-2xl p-8 hero-card border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Student Diagnostics Overview</h2>
                    <p class="text-sm text-gray-400 mt-1">Monitoring connection channel for: <span class="font-mono text-xs font-semibold text-gray-600" id="tracked-student-id">Syncing student token...</span></p>
                </div>
                <div class="flex gap-4">
                    <div class="bg-[#F7F9FC] px-6 py-4 rounded-xl border border-gray-100 min-w-[140px]">
                        <span class="block text-2xl font-bold tracking-tight text-[#0C1A2E]" id="parent-stat-score">--</span>
                        <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Live SAT Score</span>
                    </div>
                    <div class="bg-[#F7F9FC] px-6 py-4 rounded-xl border border-gray-100 min-w-[140px]">
                        <span class="block text-2xl font-bold tracking-tight text-[#0C1A2E]" id="parent-stat-total">0</span>
                        <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Items Completed</span>
                    </div>
                </div>
            </div>

            <!-- Activity Logs Tracker -->
            <div class="bg-white rounded-2xl p-8 hero-card border border-gray-100 space-y-4">
                <h3 class="text-lg font-bold tracking-tight">Real-Time Performance Logs</h3>
                <div class="overflow-x-auto rounded-xl border border-gray-200/60">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr class="bg-[#F7F9FC] text-gray-500 border-b border-gray-200 text-xs uppercase font-bold tracking-wider">
                                <th class="p-4">Item UUID</th>
                                <th class="p-4">Selected Choice</th>
                                <th class="p-4">Diagnostic Result</th>
                                <th class="p-4">Timestamp (UTC)</th>
                            </tr>
                        </thead>
                        <tbody id="parent-activity-rows" class="divide-y divide-gray-100 text-gray-600">
                            <tr>
                                <td colspan="4" class="p-8 text-center text-gray-400 italic">Waiting for initial student practice interaction pipelines...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    `;
    fetchStudentProgressLogs();
}

async function fetchStudentProgressLogs() {
    if (!window.supabase || !currentUser) return;

    // Get linked student email from meta properties profile claims
    const studentEmail = currentUser.user_metadata?.parent_email || 'student@zenith.edu';
    document.getElementById('tracked-student-id').innerText = studentEmail;

    const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('student_email', studentEmail)
        .order('timestamp', { ascending: false });

    if (error || !data || data.length === 0) return;

    // Process metric states
    document.getElementById('parent-stat-total').innerText = data.length;
    
    // Calculate simple mock tracker projected analytics bounds based on data responses
    let calcScore = 1050 + (data.filter(d => d.is_correct).length * 10) - (data.filter(d => !d.is_correct).length * 5);
    if (calcScore > 1600) calcScore = 1600;
    if (calcScore < 400) calcScore = 400;
    document.getElementById('parent-stat-score').innerText = calcScore;

    // Paint historical row elements
    const tbody = document.getElementById('parent-activity-rows');
    tbody.innerHTML = '';
    
    data.forEach(log => {
        const date = new Date(log.timestamp).toLocaleTimeString();
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4 font-mono text-xs font-semibold text-gray-400">${log.question_id}</td>
                <td class="p-4 font-medium text-[#0C1A2E]">${log.chosen_answer}</td>
                <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${log.is_correct ? 'bg-green-50 text-[#0F7B4E]' : 'bg-red-50 text-red-700'}">
                        ${log.is_correct ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                </td>
                <td class="p-4 text-xs font-medium text-gray-400">${date}</td>
            </tr>
        `;
    });
}
