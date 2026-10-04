'use strict';

// ===================
// Practice Engine
// ===================
// Centraal systeem voor adaptief leren, flow-zone targeting,
// review queue en hint management

const PracticeEngine = {
    // Configuration
    config: {
        targetAccuracy: 0.80,        // Doel: 75-85% correct
        targetAccuracyMin: 0.75,
        targetAccuracyMax: 0.85,
        questionsPerSession: 10,
        reviewQueuePercentage: 0.25, // 25% van vragen uit review
        minAttemptsForLevelUp: 20,
        levelUpThreshold: 0.90,
        levelDownThreshold: 0.60,
        consecutiveWrongForSupport: 3,
        maxSkillLevel: 5,
        recentQuestionLimit: 8,      // Vermijd herhaling van recente sommen
        generateUniqueAttempts: 20   // Max pogingen om een nieuwe som te trekken
    },
    
    // Current session state
    session: {
        mode: null,           // 'adventure' | 'skill'
        skillId: null,        // Voor skill mode
        levelId: null,        // Voor adventure mode
        questions: [],        // Beantwoorde vragen deze sessie
        recentDisplays: [],   // Recent getoonde sommen (anti-herhaling)
        currentQuestion: null,
        consecutiveWrong: 0,
        consecutiveCorrect: 0,
        hintLevel: 0,         // 0 = geen hint getoond
        hintsUsed: 0,         // Totaal hints gebruikt deze sessie
        startTime: null,
        questionStartTime: null
    },
    
    // ===================
    // Session Management
    // ===================
    
    startSession(mode, options = {}) {
        this.session = {
            mode: mode,
            skillId: options.skillId || null,
            levelId: options.levelId || null,
            questions: [],
            recentDisplays: [],
            currentQuestion: null,
            consecutiveWrong: 0,
            consecutiveCorrect: 0,
            hintLevel: 0,
            hintsUsed: 0,
            startTime: Date.now(),
            questionStartTime: null
        };
        
        console.log('Practice session started:', mode, options);
        return this.getNextQuestion();
    },
    
    endSession() {
        const summary = this.getSessionSummary();
        this.session = {
            mode: null,
            skillId: null,
            levelId: null,
            questions: [],
            recentDisplays: [],
            currentQuestion: null,
            consecutiveWrong: 0,
            consecutiveCorrect: 0,
            hintLevel: 0,
            hintsUsed: 0,
            startTime: null,
            questionStartTime: null
        };
        return summary;
    },
    
    getSessionSummary() {
        const q = this.session.questions;
        const correct = q.filter(x => x.correct).length;
        const total = q.length;
        const accuracy = total > 0 ? correct / total : 0;
        const startTime = this.session.startTime || Date.now();
        
        return {
            mode: this.session.mode,
            skillId: this.session.skillId,
            total: total,
            correct: correct,
            wrong: total - correct,
            accuracy: Math.round(accuracy * 100),
            duration: Date.now() - startTime,
            questions: q
        };
    },
    
    // ===================
    // Question Generation
    // ===================
    
    getNextQuestion() {
        const profile = getCurrentProfile();
        if (!profile) return null;
        
        // Ensure skillProgress exists
        if (!profile.skillProgress) {
            profile.skillProgress = {};
        }
        
        this.session.hintLevel = 0;
        this.session.questionStartTime = Date.now();
        
        let question;
        
        if (this.session.mode === 'skill') {
            question = this._getSkillQuestion(profile);
        } else {
            // Adventure mode uses existing level system
            question = this._getAdventureQuestion(profile);
        }
        
        if (question) {
            this._rememberQuestion(question);
        }
        
        this.session.currentQuestion = question;
        return question;
    },
    
    _getSkillQuestion(profile) {
        const skillId = this.session.skillId;
        const skill = getSkillById(skillId);
        if (!skill) return null;
        
        // Initialize skill progress if needed
        if (!profile.skillProgress[skillId]) {
            profile.skillProgress[skillId] = this._createSkillProgress();
            saveProfiles();
        }
        
        const sp = profile.skillProgress[skillId];
        
        // Check if we should pull from review queue (25% chance)
        if (sp.reviewQueue.length > 0 && Math.random() < this.config.reviewQueuePercentage) {
            const reviewItem = this._getReviewItem(sp);
            if (reviewItem) {
                return reviewItem;
            }
        }
        
        // Adaptive difficulty: check recent performance
        let effectiveLevel = sp.level;
        
        // Adjust for session start (easier questions first)
        if (this.session.questions.length < 2) {
            effectiveLevel = Math.max(1, effectiveLevel - 1);
        }
        
        // Adjust for consecutive wrong
        if (this.session.consecutiveWrong >= 2) {
            effectiveLevel = Math.max(1, effectiveLevel - 1);
        }
        
        // Generate question at appropriate level, avoid recent repeats
        return this._generateUniqueQuestion(() => skill.generator(effectiveLevel));
    },
    
    _getAdventureQuestion(profile) {
        // Use existing level system for adventure mode
        const levelId = this.session.levelId;
        const level = getLevelById(levelId);
        if (!level) return null;
        
        const question = this._generateUniqueQuestion(() => {
            const q = level.generator();
            if (q) {
                q.skillId = this._inferSkillId(q);
            }
            return q;
        });
        return question;
    },
    
    _inferSkillId(question) {
        // Infer skill from question display
        const display = question.display;
        if (display.includes('×')) return 'multiplication';
        if (display.includes('÷')) return 'division';
        if (display.includes('+')) return 'addition';
        if (display.includes('−') || display.includes('-')) return 'subtraction';
        return 'unknown';
    },
    
    _questionKey(question) {
        if (!question || !question.display) return '';
        // Normaliseer zodat "3 × 2" en "2 × 3" als verschillend blijven
        // (beide zijn nuttig), maar whitespace/minustekens wel gelijk zijn
        return String(question.display)
            .replace(/\s+/g, ' ')
            .replace(/-/g, '−')
            .trim();
    },
    
    _isRecentQuestion(question) {
        const key = this._questionKey(question);
        if (!key) return false;
        return this.session.recentDisplays.includes(key);
    },
    
    _rememberQuestion(question) {
        const key = this._questionKey(question);
        if (!key) return;
        
        this.session.recentDisplays.push(key);
        const limit = this.config.recentQuestionLimit;
        if (this.session.recentDisplays.length > limit) {
            this.session.recentDisplays.splice(0, this.session.recentDisplays.length - limit);
        }
    },
    
    _generateUniqueQuestion(generateFn) {
        let question = null;
        let unique = null;
        
        for (let i = 0; i < this.config.generateUniqueAttempts; i++) {
            question = generateFn();
            if (!question) return null;
            
            if (!this._isRecentQuestion(question)) {
                unique = question;
                break;
            }
            
            // Bij kleine pools (bijv. tafel ×1-5): verklein recent-lijst
            // zodat we niet eindeloos dezelfde som terugkrijgen
            if (i === 10 && this.session.recentDisplays.length > 2) {
                this.session.recentDisplays = this.session.recentDisplays.slice(-2);
            }
        }
        
        // Fallback: laatste gegenereerde som als pool te klein is
        return unique || question;
    },
    
    _getReviewItem(sp) {
        const now = Date.now();
        const dueItems = sp.reviewQueue.filter(item => {
            if (item.nextReview > now) return false;
            // Skip review als dezelfde som net gevraagd is
            return !this._isRecentQuestion(item.question);
        });
        
        if (dueItems.length === 0) return null;
        
        // Pick random due item
        const item = dueItems[Math.floor(Math.random() * dueItems.length)];
        
        // Remove from queue (will be re-added if wrong again)
        sp.reviewQueue = sp.reviewQueue.filter(x => x.id !== item.id);
        
        return {
            ...item.question,
            isReview: true,
            reviewItemId: item.id
        };
    },
    
    // ===================
    // Answer Processing
    // ===================
    
    submitAnswer(answer) {
        const question = this.session.currentQuestion;
        if (!question) return null;
        
        const correct = Number(answer) === question.answer;
        const responseTime = Date.now() - this.session.questionStartTime;
        
        // Record result
        const result = {
            question: question,
            userAnswer: answer,
            correct: correct,
            responseTime: responseTime,
            hintLevel: this.session.hintLevel,
            timestamp: Date.now()
        };
        
        this.session.questions.push(result);
        
        // Update consecutive counts
        if (correct) {
            this.session.consecutiveCorrect++;
            this.session.consecutiveWrong = 0;
        } else {
            this.session.consecutiveWrong++;
            this.session.consecutiveCorrect = 0;
        }
        
        // Update profile progress
        this._updateProgress(result);
        
        // Check for support needed
        const needsSupport = !correct && this.session.consecutiveWrong >= this.config.consecutiveWrongForSupport;
        
        return {
            correct: correct,
            correctAnswer: question.answer,
            needsSupport: needsSupport,
            consecutiveWrong: this.session.consecutiveWrong,
            consecutiveCorrect: this.session.consecutiveCorrect,
            sessionProgress: {
                answered: this.session.questions.length,
                total: this.config.questionsPerSession,
                correct: this.session.questions.filter(q => q.correct).length
            }
        };
    },
    
    _updateProgress(result) {
        const profile = getCurrentProfile();
        if (!profile) return;
        
        if (this.session.mode === 'skill') {
            this._updateSkillProgress(profile, result);
        } else {
            // Adventure mode: use existing progress system
            this._updateAdventureProgress(profile, result);
        }
        
        saveProfiles();
    },
    
    _updateSkillProgress(profile, result) {
        const skillId = this.session.skillId;
        if (!profile.skillProgress) profile.skillProgress = {};
        if (!profile.skillProgress[skillId]) {
            profile.skillProgress[skillId] = this._createSkillProgress();
        }
        
        const sp = profile.skillProgress[skillId];
        
        // Add to rolling stats
        sp.lastResults.push({
            correct: result.correct,
            responseTime: result.responseTime,
            hintLevel: result.hintLevel,
            timestamp: result.timestamp
        });
        
        // Keep only last 20
        if (sp.lastResults.length > 20) {
            sp.lastResults.shift();
        }
        
        // Update totals
        if (result.correct) {
            sp.totalCorrect++;
        } else {
            sp.totalWrong++;
            
            // Add to review queue
            this._addToReviewQueue(sp, result.question);
        }
        
        // Update stars
        sp.stars = this._calculateSkillStars(sp);
        
        // Check for level up/down
        this._checkLevelChange(sp);
        
        // Update mastery state
        sp.masteryState = this._calculateMasteryState(sp);
    },
    
    _updateAdventureProgress(profile, result) {
        const levelId = this.session.levelId;
        if (!profile.progress) profile.progress = {};
        if (!profile.progress[levelId]) {
            profile.progress[levelId] = { correct: 0, wrong: 0 };
        }
        
        if (result.correct) {
            profile.progress[levelId].correct++;
        } else {
            profile.progress[levelId].wrong++;
        }
    },
    
    // ===================
    // Review Queue
    // ===================
    
    _addToReviewQueue(sp, question) {
        const now = Date.now();
        const id = `${question.display}_${now}`;
        
        // Check if similar question already in queue
        const existing = sp.reviewQueue.find(x => 
            x.question.display === question.display
        );
        
        if (existing) {
            // Reset review time — niet te snel herhalen binnen dezelfde sessie
            existing.nextReview = now + 120000; // 2 min
            existing.reviewCount++;
            return;
        }
        
        sp.reviewQueue.push({
            id: id,
            question: question,
            addedAt: now,
            nextReview: now + 120000, // Review again in 2 min
            reviewCount: 0
        });
        
        // Limit queue size
        if (sp.reviewQueue.length > 20) {
            sp.reviewQueue.shift();
        }
    },
    
    // ===================
    // Hint System
    // ===================
    
    requestHint() {
        if (!this.session.currentQuestion) return null;
        
        this.session.hintLevel = Math.min(4, this.session.hintLevel + 1);
        this.session.hintsUsed++; // Track totaal hints gebruikt
        
        const hint = getHintForQuestion(
            this.session.currentQuestion, 
            this.session.hintLevel
        );
        
        return {
            level: this.session.hintLevel,
            text: hint,
            isLastHint: this.session.hintLevel >= 4
        };
    },
    
    // ===================
    // Level Management
    // ===================
    
    _checkLevelChange(sp) {
        const recent = sp.lastResults.slice(-10);
        if (recent.length < 10) return;
        
        const accuracy = recent.filter(r => r.correct).length / recent.length;
        
        // Level up: 90%+ correct over last 10, minimum 20 total attempts
        if (accuracy >= this.config.levelUpThreshold && 
            sp.totalCorrect + sp.totalWrong >= this.config.minAttemptsForLevelUp &&
            sp.level < this.config.maxSkillLevel) {
            sp.level++;
            sp.lastLevelChange = Date.now();
            console.log(`Level up! Skill ${this.session.skillId} now level ${sp.level}`);
        }
        
        // Level down: <60% correct over last 10
        if (accuracy < this.config.levelDownThreshold && sp.level > 1) {
            sp.level--;
            sp.lastLevelChange = Date.now();
            console.log(`Level down. Skill ${this.session.skillId} now level ${sp.level}`);
        }
    },
    
    _calculateMasteryState(sp) {
        const total = sp.totalCorrect + sp.totalWrong;
        if (total < 10) return 'learning';
        
        const accuracy = sp.totalCorrect / total;
        
        if (sp.level >= this.config.maxSkillLevel && accuracy >= 0.95) {
            return 'mastered';
        }
        if (accuracy >= 0.85) {
            return 'stable';
        }
        return 'learning';
    },
    
    _calculateSkillStars(sp) {
        const total = sp.totalCorrect + sp.totalWrong;
        if (total < 10) return 0;
        
        const accuracy = sp.totalCorrect / total;
        
        if (accuracy >= 0.95) return 3;
        if (accuracy >= 0.85) return 2;
        if (accuracy >= 0.70) return 1;
        return 0;
    },
    
    // ===================
    // Progress Helpers
    // ===================
    
    _createSkillProgress() {
        return {
            level: 1,
            stars: 0,
            totalCorrect: 0,
            totalWrong: 0,
            lastResults: [],      // Rolling window of last 20 results
            reviewQueue: [],      // Questions to review
            masteryState: 'learning',
            lastPracticed: null,
            lastLevelChange: null
        };
    },
    
    _getRecentAccuracy(sp) {
        const recent = sp.lastResults.slice(-10);
        if (recent.length === 0) return 0.5;
        return recent.filter(r => r.correct).length / recent.length;
    },
    
    // ===================
    // Public Helpers
    // ===================
    
    getSkillProgress(skillId) {
        const profile = getCurrentProfile();
        if (!profile || !profile.skillProgress) return null;
        return profile.skillProgress[skillId] || null;
    },
    
    getAllSkillProgress() {
        const profile = getCurrentProfile();
        if (!profile) return {};
        return profile.skillProgress || {};
    },
    
    isSessionComplete() {
        return this.session.questions.length >= this.config.questionsPerSession;
    },
    
    getSessionStats() {
        const total = this.session.questions.length;
        const correct = this.session.questions.filter(q => q.correct).length;
        return {
            total,
            correct,
            wrong: total - correct,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
            remaining: Math.max(0, this.config.questionsPerSession - total),
            hintsUsed: this.session.hintsUsed || 0
        };
    }
};
