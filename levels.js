'use strict';

// ===================
// Level Definitions
// ===================
const LEVELS = [
    // ========== FASE 1: Tot 10 ==========
    {
        id: 1,
        name: "+1 en -1",
        description: "Buurgetallen",
        phase: 1,
        phaseName: "Tot 10",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            let a, b, answer;
            if (op === '+') {
                a = random(1, 9);
                b = 1;
                answer = a + b;
            } else {
                a = random(2, 10);
                b = 1;
                answer = a - b;
            }
            return { display: `${a} ${op} ${b}`, answer, type: 'standard' };
        }
    },
    {
        id: 2,
        name: "+2 en -2",
        description: "Twee erbij of eraf",
        phase: 1,
        phaseName: "Tot 10",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            let a, b, answer;
            if (op === '+') {
                a = random(1, 8);
                b = 2;
                answer = a + b;
            } else {
                a = random(3, 10);
                b = 2;
                answer = a - b;
            }
            return { display: `${a} ${op} ${b}`, answer, type: 'standard' };
        }
    },
    {
        id: 3,
        name: "Verdubbelen",
        description: "1+1, 2+2, 3+3...",
        phase: 1,
        phaseName: "Tot 10",
        generator: () => {
            const a = random(1, 5);
            return { display: `${a} + ${a}`, answer: a + a, type: 'standard' };
        }
    },
    {
        id: 4,
        name: "Sommen tot 10",
        description: "Alle sommen tot 10",
        phase: 1,
        phaseName: "Tot 10",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            let a, b, answer;
            if (op === '+') {
                a = random(1, 9);
                b = random(1, 10 - a);
                answer = a + b;
            } else {
                a = random(2, 10);
                b = random(1, a - 1);
                answer = a - b;
            }
            return { display: `${a} ${op} ${b}`, answer, type: 'standard' };
        }
    },
    {
        id: 5,
        name: "Splitsen tot 10",
        description: "Welk getal ontbreekt?",
        phase: 1,
        phaseName: "Tot 10",
        generator: () => {
            const total = random(3, 10);
            const a = random(1, total - 1);
            const b = total - a;
            const variant = Math.random();
            
            if (variant < 0.33) {
                // ? + b = total
                return { display: `? + ${b} = ${total}`, answer: a, type: 'missing_first' };
            } else if (variant < 0.66) {
                // a + ? = total
                return { display: `${a} + ? = ${total}`, answer: b, type: 'missing_second' };
            } else {
                // total - ? = a
                return { display: `${total} − ? = ${a}`, answer: b, type: 'missing_second' };
            }
        }
    },
    
    // ========== FASE 2: Tot 20 ==========
    {
        id: 6,
        name: "10 + getal",
        description: "Tien plus een getal",
        phase: 2,
        phaseName: "Tot 20",
        generator: () => {
            const b = random(1, 10);
            const op = Math.random() < 0.7 ? '+' : '-';
            if (op === '+') {
                return { display: `10 + ${b}`, answer: 10 + b, type: 'standard' };
            } else {
                const a = random(11, 20);
                return { display: `${a} − 10`, answer: a - 10, type: 'standard' };
            }
        }
    },
    {
        id: 7,
        name: "Door de 10",
        description: "8+5, 9+4, etc.",
        phase: 2,
        phaseName: "Tot 20",
        generator: () => {
            // Sommen die door de 10 gaan
            const a = random(6, 9);
            const b = random(10 - a + 2, 9); // Zorgt dat resultaat > 10
            return { display: `${a} + ${b}`, answer: a + b, type: 'standard' };
        }
    },
    {
        id: 8,
        name: "Aftrekken tot 20",
        description: "15-7, 18-9, etc.",
        phase: 2,
        phaseName: "Tot 20",
        generator: () => {
            const a = random(11, 20);
            const b = random(Math.max(1, a - 10), a - 1);
            return { display: `${a} − ${b}`, answer: a - b, type: 'standard' };
        }
    },
    {
        id: 9,
        name: "Splitsen tot 20",
        description: "Welk getal ontbreekt?",
        phase: 2,
        phaseName: "Tot 20",
        generator: () => {
            const total = random(11, 20);
            const a = random(1, total - 1);
            const b = total - a;
            const variant = Math.random();
            
            if (variant < 0.33) {
                return { display: `? + ${b} = ${total}`, answer: a, type: 'missing_first' };
            } else if (variant < 0.66) {
                return { display: `${a} + ? = ${total}`, answer: b, type: 'missing_second' };
            } else {
                return { display: `${total} − ? = ${a}`, answer: b, type: 'missing_second' };
            }
        }
    },
    {
        id: 10,
        name: "Mix tot 20",
        description: "Alles door elkaar",
        phase: 2,
        phaseName: "Tot 20",
        generator: () => {
            // Mix van niveau 6-9
            const level = LEVELS[random(5, 8)];
            return level.generator();
        }
    },
    
    // ========== FASE 3: Tot 100 ==========
    {
        id: 11,
        name: "Tientallen",
        description: "30+40, 70-20, etc.",
        phase: 3,
        phaseName: "Tot 100",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            if (op === '+') {
                const a = random(1, 8) * 10;
                const b = random(1, (100 - a) / 10) * 10;
                return { display: `${a} + ${b}`, answer: a + b, type: 'standard' };
            } else {
                const a = random(3, 10) * 10;
                const b = random(1, a / 10 - 1) * 10;
                return { display: `${a} − ${b}`, answer: a - b, type: 'standard' };
            }
        }
    },
    {
        id: 12,
        name: "Zonder overschrijding",
        description: "34+25, 67-43, etc.",
        phase: 3,
        phaseName: "Tot 100",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            if (op === '+') {
                // Zorg dat eenheden niet over 10 gaan
                const a1 = random(1, 8); // tientallen
                const a2 = random(1, 8); // eenheden
                const b1 = random(1, 9 - a1); // tientallen
                const b2 = random(1, 9 - a2); // eenheden
                const a = a1 * 10 + a2;
                const b = b1 * 10 + b2;
                return { display: `${a} + ${b}`, answer: a + b, type: 'standard' };
            } else {
                const a1 = random(3, 9);
                const a2 = random(3, 9);
                const b1 = random(1, a1 - 1);
                const b2 = random(1, a2 - 1);
                const a = a1 * 10 + a2;
                const b = b1 * 10 + b2;
                return { display: `${a} − ${b}`, answer: a - b, type: 'standard' };
            }
        }
    },
    {
        id: 13,
        name: "Met overschrijding",
        description: "36+67, 83-47, etc.",
        phase: 3,
        phaseName: "Tot 100",
        generator: () => {
            const op = Math.random() < 0.5 ? '+' : '-';
            if (op === '+') {
                // Zorg dat eenheden WEL over 10 gaan
                let a, b;
                do {
                    a = random(15, 85);
                    b = random(15, 99 - a);
                } while ((a % 10) + (b % 10) < 10); // Moet door de 10
                return { display: `${a} + ${b}`, answer: a + b, type: 'standard' };
            } else {
                let a, b;
                do {
                    a = random(25, 99);
                    b = random(15, a - 10);
                } while ((a % 10) >= (b % 10)); // Eenheden moeten "lenen"
                return { display: `${a} − ${b}`, answer: a - b, type: 'standard' };
            }
        }
    },
    {
        id: 14,
        name: "Splitsen tot 100",
        description: "Welk getal ontbreekt?",
        phase: 3,
        phaseName: "Tot 100",
        generator: () => {
            const total = random(20, 100);
            const a = random(10, total - 10);
            const b = total - a;
            const variant = Math.random();
            
            if (variant < 0.5) {
                return { display: `${a} + ? = ${total}`, answer: b, type: 'missing_second' };
            } else {
                return { display: `${total} − ? = ${a}`, answer: b, type: 'missing_second' };
            }
        }
    },
    {
        id: 15,
        name: "Mix tot 100",
        description: "Alles door elkaar",
        phase: 3,
        phaseName: "Tot 100",
        generator: () => {
            const level = LEVELS[random(10, 13)];
            return level.generator();
        }
    },
    
    // ========== FASE 4: Tafels ==========
    {
        id: 16,
        name: "Tafel 1, 2, 5, 10",
        description: "Makkelijke tafels",
        phase: 4,
        phaseName: "Tafels",
        generator: () => {
            const tables = [1, 2, 5, 10];
            const a = tables[random(0, 3)];
            const b = random(1, 10);
            return { display: `${a} × ${b}`, answer: a * b, type: 'standard' };
        }
    },
    {
        id: 17,
        name: "Tafel 3 en 4",
        description: "Tafel van 3 en 4",
        phase: 4,
        phaseName: "Tafels",
        generator: () => {
            const a = Math.random() < 0.5 ? 3 : 4;
            const b = random(1, 10);
            return { display: `${a} × ${b}`, answer: a * b, type: 'standard' };
        }
    },
    {
        id: 18,
        name: "Tafel 6, 7, 8, 9",
        description: "Moeilijke tafels",
        phase: 4,
        phaseName: "Tafels",
        generator: () => {
            const a = random(6, 9);
            const b = random(1, 10);
            return { display: `${a} × ${b}`, answer: a * b, type: 'standard' };
        }
    },
    {
        id: 19,
        name: "Alle tafels",
        description: "Door elkaar",
        phase: 4,
        phaseName: "Tafels",
        generator: () => {
            const a = random(1, 10);
            const b = random(1, 10);
            return { display: `${a} × ${b}`, answer: a * b, type: 'standard' };
        }
    },
    {
        id: 20,
        name: "Delen",
        description: "? × 4 = 20",
        phase: 4,
        phaseName: "Tafels",
        generator: () => {
            const a = random(1, 10);
            const b = random(2, 10);
            const result = a * b;
            const variant = Math.random();
            
            if (variant < 0.33) {
                return { display: `? × ${b} = ${result}`, answer: a, type: 'missing_first' };
            } else if (variant < 0.66) {
                return { display: `${a} × ? = ${result}`, answer: b, type: 'missing_second' };
            } else {
                return { display: `${result} ÷ ${b} = ?`, answer: a, type: 'standard' };
            }
        }
    },
    
    // ========== FASE 5: Expert ==========
    {
        id: 21,
        name: "Snelle mix",
        description: "Alles door elkaar!",
        phase: 5,
        phaseName: "Expert",
        generator: () => {
            // Random niveau van 4 t/m 19
            const level = LEVELS[random(3, 18)];
            return level.generator();
        }
    }
];

// Helper function
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get level by ID
function getLevelById(id) {
    return LEVELS.find(l => l.id === id);
}

// Get all phases
function getPhases() {
    const phases = {};
    LEVELS.forEach(level => {
        if (!phases[level.phase]) {
            phases[level.phase] = {
                id: level.phase,
                name: level.phaseName,
                levels: []
            };
        }
        phases[level.phase].levels.push(level);
    });
    return Object.values(phases);
}

// Check if level is unlocked
function isLevelUnlocked(levelId, progress) {
    if (levelId === 1) return true;
    
    // Previous level must be mastered (80%+ with at least 10 attempts)
    const prevProgress = progress[levelId - 1];
    if (!prevProgress) return false;
    
    const total = prevProgress.correct + prevProgress.wrong;
    if (total < 10) return false;
    
    const successRate = prevProgress.correct / total;
    return successRate >= 0.8;
}

// Get mastery percentage for a level
function getLevelMastery(levelId, progress) {
    const p = progress[levelId];
    if (!p) return 0;
    
    const total = p.correct + p.wrong;
    if (total === 0) return 0;
    
    return Math.round((p.correct / total) * 100);
}

// Get stars (0-3) based on mastery
function getLevelStars(levelId, progress) {
    const mastery = getLevelMastery(levelId, progress);
    const p = progress[levelId];
    const total = p ? p.correct + p.wrong : 0;
    
    if (total < 10) return 0;
    if (mastery >= 95) return 3;
    if (mastery >= 85) return 2;
    if (mastery >= 70) return 1;
    return 0;
}
