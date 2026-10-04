'use strict';

// ===================
// State Management
// ===================
const state = {
    // Current profile
    currentProfileId: null,
    profiles: {}, // { id: { name, progress, skillProgress, createdAt } }
    
    // Game state
    currentMode: null,    // 'adventure' | 'skill' | 'quick'
    currentLevel: null,
    currentSkillId: null,
    currentQuestion: null,
    answer: '',
    score: 0,
    totalQuestions: 0,
    sessionCorrect: 0,
    sessionWrong: 0,
    wrongQuestions: [],
    isRetryMode: false,
    
    // Timer mode
    timer: null,
    timeLeft: 0,
    timerMode: false
};

// ===================
// DOM Elements
// ===================
const $ = (id) => document.getElementById(id);

// ===================
// Security Helpers
// ===================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================
// Profile Management
// ===================
function generateProfileId() {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function loadProfiles() {
    const saved = localStorage.getItem('rekentrainer_v3');
    if (saved) {
        const data = JSON.parse(saved);
        state.profiles = data.profiles || {};
        state.currentProfileId = data.currentProfileId || null;
    } else {
        // Try to migrate from v2
        const oldSaved = localStorage.getItem('rekentrainer_v2');
        if (oldSaved) {
            const data = JSON.parse(oldSaved);
            state.profiles = data.profiles || {};
            state.currentProfileId = data.currentProfileId || null;
            // Add skillProgress to existing profiles
            Object.values(state.profiles).forEach(p => {
                if (!p.skillProgress) p.skillProgress = {};
            });
            saveProfiles();
        }
    }
}

function saveProfiles() {
    localStorage.setItem('rekentrainer_v3', JSON.stringify({
        profiles: state.profiles,
        currentProfileId: state.currentProfileId
    }));
}

function getCurrentProfile() {
    return state.profiles[state.currentProfileId] || null;
}

function findProfileByName(name) {
    const normalizedName = name.trim().toLowerCase();
    return Object.keys(state.profiles).find(
        id => state.profiles[id].name.toLowerCase() === normalizedName
    );
}

function createProfile(name) {
    const id = generateProfileId();
    state.profiles[id] = {
        name: name.trim(),
        progress: {},        // Legacy level progress
        skillProgress: {},   // New skill-based progress
        createdAt: Date.now()
    };
    state.currentProfileId = id;
    saveProfiles();
    return id;
}

function selectProfile(id) {
    if (state.profiles[id]) {
        state.currentProfileId = id;
        saveProfiles();
        showModeSelect();
    }
}

// ===================
// Code System (Export/Import)
// ===================
function generateFullCode() {
    const profile = getCurrentProfile();
    if (!profile) return '';
    
    const data = {
        n: profile.name,
        p: profile.progress,
        sp: profile.skillProgress,
        v: 3
    };
    
    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const checksum = simpleHash(base64).toString(16).slice(-4).toUpperCase();
    
    return `RT3-${base64}-${checksum}`;
}

function importCode(code) {
    try {
        code = code.trim();
        
        let base64, checksum;
        
        if (code.startsWith('RT3-')) {
            const lastDash = code.lastIndexOf('-');
            checksum = code.substring(lastDash + 1);
            base64 = code.substring(4, lastDash);
        } else if (code.startsWith('RT2-')) {
            const lastDash = code.lastIndexOf('-');
            checksum = code.substring(lastDash + 1);
            base64 = code.substring(4, lastDash);
        } else if (code.startsWith('RT-')) {
            const lastDash = code.lastIndexOf('-');
            checksum = code.substring(lastDash + 1);
            base64 = code.substring(3, lastDash);
        } else {
            return { success: false, error: 'Ongeldige code' };
        }
        
        if (!base64 || !checksum || checksum.length !== 4) {
            return { success: false, error: 'Ongeldige code' };
        }
        
        const expectedChecksum = simpleHash(base64).toString(16).slice(-4).toUpperCase();
        if (checksum !== expectedChecksum) {
            return { success: false, error: 'Code is ongeldig' };
        }
        
        const json = decodeURIComponent(escape(atob(base64)));
        const data = JSON.parse(json);
        
        if (!data.n) {
            return { success: false, error: 'Onbekend formaat' };
        }
        
        const existingId = findProfileByName(data.n);
        
        if (existingId) {
            state.profiles[existingId].progress = data.p || {};
            state.profiles[existingId].skillProgress = data.sp || {};
            state.currentProfileId = existingId;
        } else {
            const id = generateProfileId();
            state.profiles[id] = {
                name: data.n,
                progress: data.p || {},
                skillProgress: data.sp || {},
                createdAt: Date.now()
            };
            state.currentProfileId = id;
        }
        
        saveProfiles();
        return { success: true, name: data.n };
        
    } catch (e) {
        return { success: false, error: 'Kon code niet lezen' };
    }
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ===================
// Screen Navigation
// ===================
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $('endSessionModal').classList.add('hidden');
}

function showProfileSelect() {
    hideAllScreens();
    $('profileSelectScreen').classList.remove('hidden');
    $('nameInput').value = '';
    renderProfileList();
}

function showModeSelect() {
    hideAllScreens();
    $('modeSelectScreen').classList.remove('hidden');
    
    const profile = getCurrentProfile();
    if (!profile) {
        showProfileSelect();
        return;
    }
    
    $('modeWelcome').innerText = profile.name;
    
    // Update stats
    const totalStars = calculateTotalStars(profile.progress);
    const levelsCompleted = Object.keys(profile.progress).filter(id => {
        const p = profile.progress[id];
        return p && (p.correct + p.wrong) >= 10 && (p.correct / (p.correct + p.wrong)) >= 0.8;
    }).length;
    
    $('totalStarsDisplay').innerText = totalStars;
    $('levelsCompletedDisplay').innerText = levelsCompleted;
}

function showLevelSelect() {
    hideAllScreens();
    $('levelSelectScreen').classList.remove('hidden');
    
    const profile = getCurrentProfile();
    if (!profile) {
        showProfileSelect();
        return;
    }
    
    $('levelWelcome').innerText = 'Avontuur';
    renderLevelList();
}

function showSkillSelect() {
    hideAllScreens();
    $('skillSelectScreen').classList.remove('hidden');
    renderSkillCategories();
}

function showGame() {
    hideAllScreens();
    $('game').classList.remove('hidden');
    $('hintArea').classList.add('hidden');
}

// ===================
// Render Functions
// ===================
function renderProfileList() {
    const container = $('profileList');
    const profileIds = Object.keys(state.profiles);
    
    if (profileIds.length === 0) {
        container.innerHTML = '<p class="no-profiles">Typ je naam hieronder om te beginnen!</p>';
        return;
    }
    
    let html = '<p class="profile-hint">Kies je naam:</p>';
    profileIds.forEach(id => {
        const profile = state.profiles[id];
        const totalStars = calculateTotalStars(profile.progress);
        const safeName = escapeHtml(profile.name);
        
        html += `
            <div class="profile-item" data-profile-id="${id}">
                <div class="profile-avatar">${safeName.charAt(0).toUpperCase()}</div>
                <div class="profile-info">
                    <div class="profile-name">${safeName}</div>
                    <div class="profile-score">⭐ ${totalStars} sterren</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', () => {
            selectProfile(item.dataset.profileId);
        });
    });
}

function calculateTotalStars(progress) {
    let total = 0;
    LEVELS.forEach(level => {
        total += getLevelStars(level.id, progress);
    });
    return total;
}

function renderLevelList() {
    const container = $('levelList');
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const phases = getPhases();
    let html = '';
    
    phases.forEach(phase => {
        html += `<div class="phase-section">
            <h3 class="phase-title">${phase.name}</h3>
            <div class="level-grid">`;
        
        phase.levels.forEach(level => {
            const unlocked = isLevelUnlocked(level.id, profile.progress);
            const stars = getLevelStars(level.id, profile.progress);
            const mastery = getLevelMastery(level.id, profile.progress);
            const p = profile.progress[level.id];
            const attempts = p ? p.correct + p.wrong : 0;
            
            const starsHtml = unlocked ? 
                `<div class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>` : 
                '<div class="level-locked">🔒</div>';
            
            html += `
                <div class="level-item ${unlocked ? '' : 'locked'}" data-level-id="${level.id}" data-unlocked="${unlocked}">
                    <div class="level-number">${level.id}</div>
                    <div class="level-info">
                        <div class="level-name">${level.name}</div>
                        <div class="level-desc">${level.description}</div>
                    </div>
                    ${starsHtml}
                    ${unlocked && attempts > 0 ? `<div class="level-mastery">${mastery}%</div>` : ''}
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.level-item[data-unlocked="true"]').forEach(item => {
        item.addEventListener('click', () => {
            startAdventureLevel(parseInt(item.dataset.levelId));
        });
    });
}

function renderSkillCategories() {
    const container = $('skillCategories');
    const profile = getCurrentProfile();
    if (!profile) return;
    
    const categories = getSkillCategories();
    let html = '';
    
    categories.forEach(cat => {
        const skills = getSkillsByCategory(cat.id);
        
        html += `<div class="skill-category">
            <h3 class="category-title">${cat.icon} ${cat.name}</h3>
            <div class="skill-grid">`;
        
        skills.forEach(skill => {
            const sp = profile.skillProgress ? profile.skillProgress[skill.id] : null;
            const level = sp ? sp.level : 1;
            const stars = sp ? sp.stars : 0;
            const masteryState = sp ? sp.masteryState : 'learning';
            
            const stateIcon = masteryState === 'mastered' ? '✓' : 
                              masteryState === 'stable' ? '◉' : '';
            
            html += `
                <div class="skill-item" data-skill-id="${skill.id}">
                    <div class="skill-icon">${skill.icon}</div>
                    <div class="skill-info">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-level">Level ${level} ${stateIcon}</div>
                    </div>
                    <div class="skill-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('click', () => {
            startSkillTraining(item.dataset.skillId);
        });
    });
}

// ===================
// Profile Actions
// ===================
function handleNameSubmit() {
    const nameInput = $('nameInput');
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name) {
        alert('Vul je naam in!');
        return;
    }
    
    const existingId = findProfileByName(name);
    
    if (existingId) {
        selectProfile(existingId);
    } else {
        createProfile(name);
        showModeSelect();
    }
}

function switchProfile() {
    showProfileSelect();
}

function showNewUserScreen() {
    // Go to profile select but clear the current selection
    // and focus on adding a new name
    showProfileSelect();
    $('nameInput').focus();
}

// ===================
// Code Screen
// ===================
function showCodeScreen() {
    hideAllScreens();
    $('codeScreen').classList.remove('hidden');
    $('codeImportSection').classList.add('hidden');
    $('codeExportSection').classList.remove('hidden');
    
    const profile = getCurrentProfile();
    $('codeProfileName').innerText = profile.name;
    $('codeDisplay').innerText = generateFullCode();
    $('codeResult').innerText = '';
}

function showImportCodeScreen() {
    hideAllScreens();
    $('codeScreen').classList.remove('hidden');
    $('codeExportSection').classList.add('hidden');
    $('codeImportSection').classList.remove('hidden');
    $('codeInput').value = '';
    $('codeResult').innerText = '';
}

function handleImportCode() {
    const code = $('codeInput').value.trim();
    if (!code) {
        $('codeResult').innerText = '⚠️ Voer een code in';
        $('codeResult').className = 'code-result error';
        return;
    }
    
    const result = importCode(code);
    if (result.success) {
        $('codeResult').innerText = `✓ "${result.name}" geladen!`;
        $('codeResult').className = 'code-result success';
        setTimeout(() => showModeSelect(), 1000);
    } else {
        $('codeResult').innerText = `✗ ${result.error}`;
        $('codeResult').className = 'code-result error';
    }
}

function copyCode() {
    const code = $('codeDisplay').innerText;
    navigator.clipboard.writeText(code).then(() => {
        $('codeResult').innerText = '✓ Code gekopieerd!';
        $('codeResult').className = 'code-result success';
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        $('codeResult').innerText = '✓ Code gekopieerd!';
        $('codeResult').className = 'code-result success';
    });
}

function closeCodeScreen() {
    showModeSelect();
}

// ===================
// Game Functions
// ===================
function startAdventureLevel(levelId) {
    const level = getLevelById(levelId);
    if (!level) return;
    
    state.currentMode = 'adventure';
    state.currentLevel = level;
    state.timerMode = false;
    
    // Start session with PracticeEngine
    const question = PracticeEngine.startSession('adventure', { levelId: levelId });
    
    resetGameState();
    showGame();
    
    $('levelTitle').innerText = level.name;
    displayQuestion(question);
}

function startSkillTraining(skillId) {
    const skill = getSkillById(skillId);
    if (!skill) return;
    
    state.currentMode = 'skill';
    state.currentSkillId = skillId;
    state.timerMode = false;
    
    // Start session with PracticeEngine
    const question = PracticeEngine.startSession('skill', { skillId: skillId });
    
    resetGameState();
    showGame();
    
    $('levelTitle').innerText = skill.name;
    displayQuestion(question);
}

function startQuickMode() {
    state.currentMode = 'quick';
    state.timerMode = true;
    
    // Start with mix level
    const question = PracticeEngine.startSession('adventure', { levelId: 21 });
    
    resetGameState();
    showGame();
    
    $('levelTitle').innerText = 'Snelle ronde';
    startTimer(60);
    displayQuestion(question);
}

function resetGameState() {
    state.score = 0;
    state.totalQuestions = 0;
    state.sessionCorrect = 0;
    state.sessionWrong = 0;
    state.wrongQuestions = [];
    state.isRetryMode = false;
    state.answer = '';
    
    updateScoreDisplay();
    updateProgressBar();
    $('hintArea').classList.add('hidden');
    $('timer').innerText = '';
    $('timer').classList.remove('warning');
}

function startRetryMode() {
    if (state.wrongQuestions.length === 0) {
        backToModeSelect();
        return;
    }
    
    state.isRetryMode = true;
    state.score = 0;
    state.totalQuestions = 0;
    state.answer = '';
    
    showGame();
    $('levelTitle').innerText = '🔄 Herhaling';
    $('timer').innerText = '';
    
    updateScoreDisplay();
    generateRetryQuestion();
}

function backToModeSelect() {
    clearInterval(state.timer);
    state.timer = null;
    PracticeEngine.endSession();
    showModeSelect();
}

function backToLevelSelect() {
    clearInterval(state.timer);
    state.timer = null;
    PracticeEngine.endSession();
    
    if (state.currentMode === 'skill') {
        showSkillSelect();
    } else {
        showLevelSelect();
    }
}

// ===================
// Question Display & Handling
// ===================
function displayQuestion(question) {
    if (!question) {
        endSession();
        return;
    }
    
    state.currentQuestion = question;
    state.answer = '';
    updateAnswerBox();
    
    $('question').innerText = question.display;
    $('question').classList.remove('correct', 'wrong');
    $('hintArea').classList.add('hidden');
}

function generateRetryQuestion() {
    if (state.wrongQuestions.length === 0) {
        endSession(true);
        return;
    }
    
    const idx = Math.floor(Math.random() * state.wrongQuestions.length);
    const question = state.wrongQuestions[idx];
    state.wrongQuestions.splice(idx, 1);
    
    displayQuestion(question);
}

// ===================
// Answer Handling
// ===================
function press(n) {
    if (state.answer.length < 4) {
        state.answer += n;
        updateAnswerBox();
    }
}

function clearAnswer() {
    state.answer = state.answer.slice(0, -1);
    updateAnswerBox();
}

function updateAnswerBox() {
    const answerBoxEl = $('answerBox');
    answerBoxEl.innerText = state.answer || '?';
    answerBoxEl.classList.remove('correct', 'wrong', 'trying', 'showing-correct');
}

function checkAnswer() {
    if (state.answer === '') return;
    
    state.totalQuestions++;
    
    let isCorrect, result;
    
    if (state.isRetryMode) {
        isCorrect = Number(state.answer) === state.currentQuestion.answer;
        if (isCorrect) {
            state.score++;
            state.sessionCorrect++;
        } else {
            state.sessionWrong++;
        }
    } else {
        // Use PracticeEngine
        result = PracticeEngine.submitAnswer(state.answer);
        isCorrect = result.correct;
        
        if (isCorrect) {
            state.score++;
            state.sessionCorrect++;
        } else {
            state.sessionWrong++;
            state.wrongQuestions.push(state.currentQuestion);
        }
    }
    
    const questionEl = $('question');
    const answerBoxEl = $('answerBox');
    
    if (isCorrect) {
        questionEl.classList.add('correct');
        answerBoxEl.classList.add('correct');
        showFeedback(true);
        playSound('correct');
        
        setTimeout(() => {
            answerBoxEl.classList.remove('correct');
            proceedToNextQuestion();
        }, 400);
    } else {
        // Gentle feedback - no aggressive red styling on the question
        answerBoxEl.classList.add('trying');
        showFeedback(false);
        playSound('tryagain');
        
        // Check if support needed (3 wrong in a row)
        if (result && result.needsSupport) {
            // Auto-show hint with encouraging message
            setTimeout(() => {
                requestHint();
                setTimeout(() => showCorrectAnswer(), 1500);
            }, 500);
        } else {
            // Quickly show the correct answer - learning moment
            setTimeout(() => showCorrectAnswer(), 400);
        }
    }
    
    updateScoreDisplay();
    updateProgressBar();
}

function showCorrectAnswer() {
    const answerBoxEl = $('answerBox');
    
    answerBoxEl.classList.remove('wrong', 'trying');
    answerBoxEl.classList.add('showing-correct');
    answerBoxEl.innerHTML = `<span class="correct-label">Het was</span> ${state.currentQuestion.answer}`;
    
    setTimeout(() => {
        answerBoxEl.classList.remove('showing-correct');
        proceedToNextQuestion();
    }, 1400);
}

function proceedToNextQuestion() {
    // Retry mode
    if (state.isRetryMode) {
        if (state.wrongQuestions.length === 0) {
            endSession(true);
        } else {
            generateRetryQuestion();
        }
        return;
    }
    
    // Check if session complete
    if (PracticeEngine.isSessionComplete()) {
        endSession();
        return;
    }
    
    // Get next question
    const question = PracticeEngine.getNextQuestion();
    displayQuestion(question);
}

function requestHint() {
    const hint = PracticeEngine.requestHint();
    if (!hint) return;
    
    const hintArea = $('hintArea');
    const hintText = $('hintText');
    
    hintText.innerText = hint.text;
    hintArea.classList.remove('hidden');
    
    // Visual indication of hint level
    hintArea.className = `hint-area hint-level-${hint.level}`;
}

function showFeedback(correct) {
    const feedback = $('feedback');
    
    if (correct) {
        // Positive feedback for correct answers
        feedback.innerText = '✓';
        feedback.className = 'feedback correct show';
    } else {
        // Gentle, encouraging feedback for wrong answers
        // No big red X - just a subtle indication
        feedback.innerText = '•';
        feedback.className = 'feedback tryagain show';
    }
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, correct ? 300 : 200);
}

function updateScoreDisplay() {
    $('score').innerText = `⭐ ${state.score}`;
    $('questionCount').innerText = `#${state.totalQuestions}`;
}

function updateProgressBar() {
    let progress = 0;
    
    if (state.isRetryMode) {
        // In retry mode, calculate based on original wrong questions
        const totalRetry = state.totalQuestions + state.wrongQuestions.length;
        progress = totalRetry > 0 ? (state.totalQuestions / totalRetry) * 100 : 0;
    } else if (state.timerMode) {
        // Timer mode: progress based on time (handled separately)
        progress = (state.totalQuestions / 20) * 100; // Approximate
    } else {
        const stats = PracticeEngine.getSessionStats();
        progress = (stats.total / PracticeEngine.config.questionsPerSession) * 100;
    }
    
    $('progressFill').style.width = `${Math.min(100, progress)}%`;
}

// ===================
// Timer Functions
// ===================
function startTimer(seconds) {
    state.timeLeft = seconds;
    updateTimerDisplay();
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            state.timer = null;
            endSession();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = $('timer');
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    
    timerEl.innerText = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (state.timeLeft <= 10) {
        timerEl.classList.add('warning');
    } else {
        timerEl.classList.remove('warning');
    }
}

// ===================
// End Session
// ===================
function endSession(isRetryComplete = false) {
    clearInterval(state.timer);
    state.timer = null;
    
    // End PracticeEngine session (progress is already saved per question)
    PracticeEngine.endSession();
    
    const wrongCount = state.wrongQuestions.length;
    const percentage = state.totalQuestions > 0 ? 
        Math.round((state.sessionCorrect / state.totalQuestions) * 100) : 0;
    
    // Calculate stars
    let stars = 0;
    if (percentage >= 95) stars = 3;
    else if (percentage >= 85) stars = 2;
    else if (percentage >= 70) stars = 1;
    
    // Note: Progress is already saved in PracticeEngine._updateAdventureProgress()
    // No need to update again here to avoid double counting
    
    // Show end modal
    showEndSessionModal({
        isRetryComplete,
        correct: state.sessionCorrect,
        total: state.totalQuestions,
        percentage,
        stars,
        wrongCount,
        isTimerMode: state.timerMode
    });
}

// Growth mindset complimenten - proces-gericht, niet persoons-gericht
const PROCESS_COMPLIMENTS = {
    // Bij doorzetten / veel oefenen
    persistence: [
        "Je bleef doorgaan, ook toen het lastig werd!",
        "Fijn dat je niet opgaf!",
        "Je hebt echt doorgezet!",
        "Knap dat je bleef proberen!"
    ],
    // Bij goede aanpak / strategie
    strategy: [
        "Je pakte het stap voor stap aan.",
        "Ik zag dat je rustig nadacht.",
        "Goede aanpak!",
        "Je nam de tijd om goed te kijken."
    ],
    // Bij verbetering / leren
    improvement: [
        "Je oefening betaalt zich uit!",
        "Elke som leert je iets nieuws.",
        "Je wordt steeds handiger!",
        "Zie je hoe oefenen helpt?"
    ],
    // Bij hints gebruiken (slim hulp vragen)
        usingHelp: [
        "Slim dat je de hint gebruikte!",
        "Hulp vragen is ook slim.",
        "Goed dat je de tip pakte!"
    ],
    // Algemene proces-complimenten
    general: [
        "Lekker geoefend!",
        "Weer een rondje wijzer!",
        "Dat was flink werken!",
        "Goed bezig geweest!"
    ]
};

function getProcessCompliment(data) {
    // Kies compliment op basis van wat er gebeurde in de sessie
    const sessionStats = PracticeEngine.getSessionStats();
    const usedHints = sessionStats.hintsUsed || 0;
    
    // Had het kind het moeilijk maar ging door? (veel fouten maar toch afgemaakt)
    if (data.wrongCount >= 3 && data.total >= 8) {
        return randomFrom(PROCESS_COMPLIMENTS.persistence);
    }
    
    // Gebruikte het kind hints? (slim hulp vragen)
    if (usedHints >= 2) {
        return randomFrom(PROCESS_COMPLIMENTS.usingHelp);
    }
    
    // Hoge score = goede aanpak
    if (data.percentage >= 85) {
        return randomFrom(PROCESS_COMPLIMENTS.strategy);
    }
    
    // Gemiddelde score = verbetering/leren
    if (data.percentage >= 60) {
        return randomFrom(PROCESS_COMPLIMENTS.improvement);
    }
    
    // Default: algemeen proces-compliment
    return randomFrom(PROCESS_COMPLIMENTS.general);
}

function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function showEndSessionModal(data) {
    const modal = $('endSessionModal');
    const title = $('endSessionTitle');
    const stats = $('endSessionStats');
    const starsEl = $('endSessionStars');
    const message = $('endSessionMessage');
    const retryBtn = $('retryWrongBtn');
    
    if (data.isRetryComplete) {
        title.innerText = '✓ Klaar!';
        stats.innerText = `${data.correct} van de ${data.total} goed`;
        starsEl.innerText = '';
        message.innerText = randomFrom(PROCESS_COMPLIMENTS.persistence);
        retryBtn.classList.add('hidden');
    } else if (data.isTimerMode) {
        title.innerText = '⏱️ Tijd is om!';
        stats.innerHTML = `<strong>${data.correct}</strong> goed van de <strong>${data.total}</strong>`;
        starsEl.innerText = data.stars > 0 ? '⭐'.repeat(data.stars) : '';
        message.innerText = getProcessCompliment(data);
        retryBtn.classList.toggle('hidden', data.wrongCount === 0);
    } else {
        // Titel op basis van inzet, niet alleen score
        if (data.wrongCount >= 3 && data.total >= 8) {
            title.innerText = '💪 Doorzetter!';
        } else if (data.percentage >= 80) {
            title.innerText = '✓ Rondje klaar!';
        } else {
            title.innerText = '👍 Goed geoefend!';
        }
        
        stats.innerHTML = `<strong>${data.correct}</strong> goed van de <strong>${data.total}</strong>`;
        starsEl.innerText = data.stars > 0 ? '⭐'.repeat(data.stars) : '';
        message.innerText = getProcessCompliment(data);
        
        retryBtn.classList.toggle('hidden', data.wrongCount === 0);
    }
    
    modal.classList.remove('hidden');
}

function closeEndSessionModal() {
    $('endSessionModal').classList.add('hidden');
    
    if (state.currentMode === 'skill') {
        showSkillSelect();
    } else if (state.currentMode === 'adventure') {
        showLevelSelect();
    } else {
        showModeSelect();
    }
}

// ===================
// Sound Effects
// ===================
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'correct') {
            // Happy, positive sound
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'tryagain') {
            // Soft, neutral "oops" sound - not punishing
            oscillator.frequency.value = 440;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.03; // Very quiet
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.08);
        }
        // No sound for other types - silence is fine
    } catch (e) {}
}

// ===================
// Keyboard Support
// ===================
document.addEventListener('keydown', (e) => {
    if (!$('game').classList.contains('hidden')) {
        if (e.key >= '0' && e.key <= '9') {
            press(parseInt(e.key));
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            clearAnswer();
        } else if (e.key === 'Enter') {
            checkAnswer();
        } else if (e.key === 'Escape') {
            backToModeSelect();
        } else if (e.key === 'h' || e.key === 'H') {
            requestHint();
        }
    }
});

// ===================
// Event Listeners Setup
// ===================
function setupEventListeners() {
    // Profile screen
    const startBtn = $('startBtn');
    if (startBtn) startBtn.addEventListener('click', handleNameSubmit);
    
    const importBtn = $('importBtn');
    if (importBtn) importBtn.addEventListener('click', showImportCodeScreen);
    
    const nameInput = $('nameInput');
    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleNameSubmit();
        });
    }
    
    // Mode select screen
    const modeBackBtn = $('modeBackBtn');
    if (modeBackBtn) modeBackBtn.addEventListener('click', showProfileSelect);
    
    const modeBackupBtn = $('modeBackupBtn');
    if (modeBackupBtn) modeBackupBtn.addEventListener('click', showCodeScreen);
    
    const adventureModeBtn = $('adventureModeBtn');
    if (adventureModeBtn) adventureModeBtn.addEventListener('click', showLevelSelect);
    
    const skillModeBtn = $('skillModeBtn');
    if (skillModeBtn) skillModeBtn.addEventListener('click', showSkillSelect);
    
    const quickModeBtn = $('quickModeBtn');
    if (quickModeBtn) quickModeBtn.addEventListener('click', startQuickMode);
    
    const switchUserBtn = $('switchUserBtn');
    if (switchUserBtn) switchUserBtn.addEventListener('click', showProfileSelect);
    
    const newUserBtn = $('newUserBtn');
    if (newUserBtn) newUserBtn.addEventListener('click', showNewUserScreen);
    
    // Skill select screen
    const skillBackBtn = $('skillBackBtn');
    if (skillBackBtn) skillBackBtn.addEventListener('click', showModeSelect);
    
    // Level select screen
    const switchProfileBtn = $('switchProfileBtn');
    if (switchProfileBtn) switchProfileBtn.addEventListener('click', showModeSelect);
    
    // Code screen
    const loadCodeBtn = $('loadCodeBtn');
    if (loadCodeBtn) loadCodeBtn.addEventListener('click', handleImportCode);
    
    const copyCodeBtn = $('copyCodeBtn');
    if (copyCodeBtn) copyCodeBtn.addEventListener('click', copyCode);
    
    const closeCodeBtn = $('closeCodeBtn');
    if (closeCodeBtn) closeCodeBtn.addEventListener('click', closeCodeScreen);
    
    // Game screen
    const hintBtn = $('hintBtn');
    if (hintBtn) hintBtn.addEventListener('click', requestHint);
    
    const deleteBtn = $('deleteBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', clearAnswer);
    
    const okBtn = $('okBtn');
    if (okBtn) okBtn.addEventListener('click', checkAnswer);
    
    const backToLevelsBtn = $('backToLevelsBtn');
    if (backToLevelsBtn) backToLevelsBtn.addEventListener('click', backToModeSelect);
    
    // Keypad number buttons
    document.querySelectorAll('#keypad button[data-num]').forEach(btn => {
        btn.addEventListener('click', () => press(parseInt(btn.dataset.num)));
    });
    
    // End session modal
    const retryWrongBtn = $('retryWrongBtn');
    if (retryWrongBtn) retryWrongBtn.addEventListener('click', () => {
        $('endSessionModal').classList.add('hidden');
        startRetryMode();
    });
    
    const continueBtn = $('continueBtn');
    if (continueBtn) continueBtn.addEventListener('click', closeEndSessionModal);
}

// ===================
// Initialization
// ===================
function init() {
    setupEventListeners();
    loadProfiles();
    
    const profileCount = Object.keys(state.profiles).length;
    
    if (profileCount === 0) {
        showProfileSelect();
    } else if (state.currentProfileId && state.profiles[state.currentProfileId]) {
        showModeSelect();
    } else {
        showProfileSelect();
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
