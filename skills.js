'use strict';

// ===================
// Skills Registry
// ===================
// Centrale definitie van alle oefenbare onderwerpen
// Skills zijn gekoppeld aan bestaande level generators

const SKILLS = {
    // === Optellen ===
    additionWithin10: {
        id: 'additionWithin10',
        name: 'Optellen tot 10',
        icon: '➕',
        category: 'addition',
        description: 'Sommen zoals 3 + 5',
        levelRange: [1, 4], // Welke levels dit skill omvat
        difficulty: 1,
        generator: (skillLevel) => generateAdditionWithin10(skillLevel)
    },
    additionCrossTen: {
        id: 'additionCrossTen',
        name: 'Over het tiental',
        icon: '🔟',
        category: 'addition',
        description: 'Sommen zoals 8 + 5',
        levelRange: [6, 7],
        difficulty: 2,
        generator: (skillLevel) => generateAdditionCrossTen(skillLevel)
    },
    additionTo100: {
        id: 'additionTo100',
        name: 'Optellen tot 100',
        icon: '💯',
        category: 'addition',
        description: 'Sommen zoals 34 + 25',
        levelRange: [11, 13],
        difficulty: 3,
        generator: (skillLevel) => generateAdditionTo100(skillLevel)
    },
    
    // === Aftrekken ===
    subtractionWithin10: {
        id: 'subtractionWithin10',
        name: 'Aftrekken tot 10',
        icon: '➖',
        category: 'subtraction',
        description: 'Sommen zoals 9 - 4',
        levelRange: [1, 4],
        difficulty: 1,
        generator: (skillLevel) => generateSubtractionWithin10(skillLevel)
    },
    subtractionCrossTen: {
        id: 'subtractionCrossTen',
        name: 'Terug over tiental',
        icon: '⬇️',
        category: 'subtraction',
        description: 'Sommen zoals 15 - 7',
        levelRange: [8, 9],
        difficulty: 2,
        generator: (skillLevel) => generateSubtractionCrossTen(skillLevel)
    },
    subtractionTo100: {
        id: 'subtractionTo100',
        name: 'Aftrekken tot 100',
        icon: '📉',
        category: 'subtraction',
        description: 'Sommen zoals 83 - 47',
        levelRange: [11, 13],
        difficulty: 3,
        generator: (skillLevel) => generateSubtractionTo100(skillLevel)
    },
    
    // === Tafels ===
    tables2: {
        id: 'tables2',
        name: 'Tafel van 2',
        icon: '2️⃣',
        category: 'multiplication',
        description: '2 × 1 tot 2 × 10',
        levelRange: [16, 16],
        difficulty: 1,
        generator: (skillLevel) => generateTable(2, skillLevel)
    },
    tables3: {
        id: 'tables3',
        name: 'Tafel van 3',
        icon: '3️⃣',
        category: 'multiplication',
        description: '3 × 1 tot 3 × 10',
        levelRange: [17, 17],
        difficulty: 2,
        generator: (skillLevel) => generateTable(3, skillLevel)
    },
    tables4: {
        id: 'tables4',
        name: 'Tafel van 4',
        icon: '4️⃣',
        category: 'multiplication',
        description: '4 × 1 tot 4 × 10',
        levelRange: [17, 17],
        difficulty: 2,
        generator: (skillLevel) => generateTable(4, skillLevel)
    },
    tables5: {
        id: 'tables5',
        name: 'Tafel van 5',
        icon: '5️⃣',
        category: 'multiplication',
        description: '5 × 1 tot 5 × 10',
        levelRange: [16, 16],
        difficulty: 1,
        generator: (skillLevel) => generateTable(5, skillLevel)
    },
    tables6: {
        id: 'tables6',
        name: 'Tafel van 6',
        icon: '6️⃣',
        category: 'multiplication',
        description: '6 × 1 tot 6 × 10',
        levelRange: [18, 18],
        difficulty: 3,
        generator: (skillLevel) => generateTable(6, skillLevel)
    },
    tables7: {
        id: 'tables7',
        name: 'Tafel van 7',
        icon: '7️⃣',
        category: 'multiplication',
        description: '7 × 1 tot 7 × 10',
        levelRange: [18, 18],
        difficulty: 3,
        generator: (skillLevel) => generateTable(7, skillLevel)
    },
    tables8: {
        id: 'tables8',
        name: 'Tafel van 8',
        icon: '8️⃣',
        category: 'multiplication',
        description: '8 × 1 tot 8 × 10',
        levelRange: [18, 18],
        difficulty: 3,
        generator: (skillLevel) => generateTable(8, skillLevel)
    },
    tables9: {
        id: 'tables9',
        name: 'Tafel van 9',
        icon: '9️⃣',
        category: 'multiplication',
        description: '9 × 1 tot 9 × 10',
        levelRange: [18, 18],
        difficulty: 3,
        generator: (skillLevel) => generateTable(9, skillLevel)
    },
    tables10: {
        id: 'tables10',
        name: 'Tafel van 10',
        icon: '🔟',
        category: 'multiplication',
        description: '10 × 1 tot 10 × 10',
        levelRange: [16, 16],
        difficulty: 1,
        generator: (skillLevel) => generateTable(10, skillLevel)
    },
    
    // === Splitsen (ontbrekende getallen) ===
    splitting: {
        id: 'splitting',
        name: 'Splitsen',
        icon: '❓',
        category: 'splitting',
        description: 'Welk getal ontbreekt?',
        levelRange: [5, 9, 14],
        difficulty: 2,
        generator: (skillLevel) => generateSplitting(skillLevel)
    },
    
    // === Delen ===
    divisionEasy: {
        id: 'divisionEasy',
        name: 'Delen 2, 5, 10',
        icon: '➗',
        category: 'division',
        description: 'Sommen zoals 30 ÷ 5',
        levelRange: [20, 21],
        difficulty: 1,
        generator: (skillLevel) => generateDivision([2, 5, 10], skillLevel, 'divisionEasy')
    },
    divisionMedium: {
        id: 'divisionMedium',
        name: 'Delen 3, 4, 6',
        icon: '➗',
        category: 'division',
        description: 'Sommen zoals 24 ÷ 4',
        levelRange: [22, 22],
        difficulty: 2,
        generator: (skillLevel) => generateDivision([3, 4, 6], skillLevel, 'divisionMedium')
    },
    divisionHard: {
        id: 'divisionHard',
        name: 'Delen 7, 8, 9',
        icon: '➗',
        category: 'division',
        description: 'Sommen zoals 56 ÷ 7',
        levelRange: [23, 23],
        difficulty: 3,
        generator: (skillLevel) => generateDivision([7, 8, 9], skillLevel, 'divisionHard')
    },
    divisionMix: {
        id: 'divisionMix',
        name: 'Delen mix',
        icon: '🎯',
        category: 'division',
        description: 'Alle deelsommen door elkaar',
        levelRange: [24, 24],
        difficulty: 3,
        generator: (skillLevel) => generateDivision([2, 3, 4, 5, 6, 7, 8, 9, 10], skillLevel, 'divisionMix')
    }
};

// Skill categorieën voor UI
const SKILL_CATEGORIES = [
    { id: 'addition', name: 'Optellen', icon: '➕' },
    { id: 'subtraction', name: 'Aftrekken', icon: '➖' },
    { id: 'multiplication', name: 'Tafels', icon: '✖️' },
    { id: 'division', name: 'Delen', icon: '➗' },
    { id: 'splitting', name: 'Splitsen', icon: '❓' }
];

// ===================
// Skill Generators
// ===================
// Adaptieve generators die rekening houden met skillLevel (1-5)

function generateAdditionWithin10(skillLevel) {
    // Level 1: alleen +1, +2
    // Level 2: +1 tot +3
    // Level 3: +1 tot +5
    // Level 4-5: alle combinaties tot 10
    
    let maxAdd = 2;
    if (skillLevel >= 2) maxAdd = 3;
    if (skillLevel >= 3) maxAdd = 5;
    if (skillLevel >= 4) maxAdd = 9;
    
    const a = random(1, 10 - maxAdd);
    const b = random(1, Math.min(maxAdd, 10 - a));
    
    return {
        display: `${a} + ${b}`,
        answer: a + b,
        type: 'standard',
        skillId: 'additionWithin10',
        params: { a, b, op: '+' }
    };
}

function generateAdditionCrossTen(skillLevel) {
    // Sommen die door de 10 gaan
    // Level 1-2: 8+3, 9+2 etc (kleine overschrijding)
    // Level 3-5: 7+5, 6+8 etc (grotere overschrijding)
    
    let minA = skillLevel <= 2 ? 8 : 6;
    const a = random(minA, 9);
    const minB = 10 - a + 1;
    const maxB = skillLevel <= 2 ? 10 - a + 3 : 9;
    const b = random(minB, Math.min(maxB, 10));
    
    return {
        display: `${a} + ${b}`,
        answer: a + b,
        type: 'standard',
        skillId: 'additionCrossTen',
        params: { a, b, op: '+' }
    };
}

function generateAdditionTo100(skillLevel) {
    // Level 1: alleen tientallen (30+40)
    // Level 2: zonder overschrijding (34+25)
    // Level 3-5: met overschrijding (36+67)
    
    if (skillLevel <= 1) {
        const a = random(1, 8) * 10;
        const b = random(1, Math.floor((100 - a) / 10)) * 10;
        return {
            display: `${a} + ${b}`,
            answer: a + b,
            type: 'standard',
            skillId: 'additionTo100',
            params: { a, b, op: '+' }
        };
    }
    
    if (skillLevel <= 2) {
        // Zonder overschrijding
        const a1 = random(1, 7);
        const a2 = random(1, 8);
        const b1 = random(1, 8 - a1);
        const b2 = random(1, 9 - a2);
        const a = a1 * 10 + a2;
        const b = b1 * 10 + b2;
        return {
            display: `${a} + ${b}`,
            answer: a + b,
            type: 'standard',
            skillId: 'additionTo100',
            params: { a, b, op: '+' }
        };
    }
    
    // Met overschrijding
    let a, b;
    do {
        a = random(15, 85);
        b = random(15, 99 - a);
    } while ((a % 10) + (b % 10) < 10);
    
    return {
        display: `${a} + ${b}`,
        answer: a + b,
        type: 'standard',
        skillId: 'additionTo100',
        params: { a, b, op: '+' }
    };
}

function generateSubtractionWithin10(skillLevel) {
    let maxSub = 2;
    if (skillLevel >= 2) maxSub = 3;
    if (skillLevel >= 3) maxSub = 5;
    if (skillLevel >= 4) maxSub = 9;
    
    const a = random(maxSub + 1, 10);
    const b = random(1, Math.min(maxSub, a - 1));
    
    return {
        display: `${a} − ${b}`,
        answer: a - b,
        type: 'standard',
        skillId: 'subtractionWithin10',
        params: { a, b, op: '-' }
    };
}

function generateSubtractionCrossTen(skillLevel) {
    // Aftrekken waarbij je door de 10 gaat
    // Level 1-2: 12-3, 13-4 etc
    // Level 3-5: 15-7, 18-9 etc
    
    const a = random(11, 20);
    const minB = skillLevel <= 2 ? 1 : Math.max(1, a - 10);
    const maxB = skillLevel <= 2 ? Math.min(a - 10 + 2, a - 1) : a - 1;
    const b = random(minB, maxB);
    
    return {
        display: `${a} − ${b}`,
        answer: a - b,
        type: 'standard',
        skillId: 'subtractionCrossTen',
        params: { a, b, op: '-' }
    };
}

function generateSubtractionTo100(skillLevel) {
    if (skillLevel <= 1) {
        // Alleen tientallen
        const a = random(3, 10) * 10;
        const b = random(1, Math.floor(a / 10) - 1) * 10;
        return {
            display: `${a} − ${b}`,
            answer: a - b,
            type: 'standard',
            skillId: 'subtractionTo100',
            params: { a, b, op: '-' }
        };
    }
    
    if (skillLevel <= 2) {
        // Zonder lenen
        const a1 = random(3, 9);
        const a2 = random(3, 9);
        const b1 = random(1, a1 - 1);
        const b2 = random(1, a2 - 1);
        const a = a1 * 10 + a2;
        const b = b1 * 10 + b2;
        return {
            display: `${a} − ${b}`,
            answer: a - b,
            type: 'standard',
            skillId: 'subtractionTo100',
            params: { a, b, op: '-' }
        };
    }
    
    // Met lenen
    let a, b;
    do {
        a = random(25, 99);
        b = random(15, a - 10);
    } while ((a % 10) >= (b % 10));
    
    return {
        display: `${a} − ${b}`,
        answer: a - b,
        type: 'standard',
        skillId: 'subtractionTo100',
        params: { a, b, op: '-' }
    };
}

function generateTable(tableNum, skillLevel) {
    // Level 1: × 1 tot × 5
    // Level 2: × 1 tot × 7
    // Level 3: × 1 tot × 10
    // Level 4-5: ook omgekeerd (? × 6 = 42)
    
    let maxMultiplier = 5;
    if (skillLevel >= 2) maxMultiplier = 7;
    if (skillLevel >= 3) maxMultiplier = 10;
    
    const b = random(1, maxMultiplier);
    const answer = tableNum * b;
    
    // Level 4-5: 30% kans op omgekeerde vraag
    if (skillLevel >= 4 && Math.random() < 0.3) {
        const variant = Math.random();
        if (variant < 0.5) {
            return {
                display: `? × ${b} = ${answer}`,
                answer: tableNum,
                type: 'missing_first',
                skillId: `tables${tableNum}`,
                params: { a: tableNum, b, op: '×' }
            };
        } else {
            return {
                display: `${tableNum} × ? = ${answer}`,
                answer: b,
                type: 'missing_second',
                skillId: `tables${tableNum}`,
                params: { a: tableNum, b, op: '×' }
            };
        }
    }
    
    // Standaard vraag, soms omgedraaid
    if (Math.random() < 0.3) {
        return {
            display: `${b} × ${tableNum}`,
            answer: answer,
            type: 'standard',
            skillId: `tables${tableNum}`,
            params: { a: b, b: tableNum, op: '×' }
        };
    }
    
    return {
        display: `${tableNum} × ${b}`,
        answer: answer,
        type: 'standard',
        skillId: `tables${tableNum}`,
        params: { a: tableNum, b, op: '×' }
    };
}

function generateSplitting(skillLevel) {
    // Level 1: splitsen tot 10
    // Level 2-3: splitsen tot 20
    // Level 4-5: splitsen tot 100
    
    let maxTotal = 10;
    if (skillLevel >= 2) maxTotal = 20;
    if (skillLevel >= 4) maxTotal = 100;
    
    const minTotal = skillLevel >= 4 ? 20 : (skillLevel >= 2 ? 11 : 3);
    const total = random(minTotal, maxTotal);
    const a = random(Math.max(1, Math.floor(total * 0.2)), Math.floor(total * 0.8));
    const b = total - a;
    
    const variant = Math.random();
    
    if (variant < 0.33) {
        return {
            display: `? + ${b} = ${total}`,
            answer: a,
            type: 'missing_first',
            skillId: 'splitting',
            params: { a, b, total }
        };
    } else if (variant < 0.66) {
        return {
            display: `${a} + ? = ${total}`,
            answer: b,
            type: 'missing_second',
            skillId: 'splitting',
            params: { a, b, total }
        };
    } else {
        return {
            display: `${total} − ? = ${a}`,
            answer: b,
            type: 'missing_second',
            skillId: 'splitting',
            params: { a, b, total }
        };
    }
}

function generateDivision(divisors, skillLevel, skillId) {
    // Level 1: quotiënt 1-5
    // Level 2-3: quotiënt 1-7
    // Level 4-5: quotiënt 1-10 + soms ontbrekend getal
    let maxQuotient = 5;
    if (skillLevel >= 2) maxQuotient = 7;
    if (skillLevel >= 3) maxQuotient = 10;
    
    const b = divisors[random(0, divisors.length - 1)];
    const a = random(1, maxQuotient);
    const result = a * b;
    
    if (skillLevel >= 4 && Math.random() < 0.35) {
        const variant = Math.random();
        if (variant < 0.5) {
            return {
                display: `? × ${b} = ${result}`,
                answer: a,
                type: 'missing_first',
                skillId: skillId,
                params: { a, b, result, op: '÷' }
            };
        }
        return {
            display: `${result} ÷ ? = ${a}`,
            answer: b,
            type: 'missing_second',
            skillId: skillId,
            params: { a, b, result, op: '÷' }
        };
    }
    
    return {
        display: `${result} ÷ ${b}`,
        answer: a,
        type: 'standard',
        skillId: skillId,
        params: { a, b, result, op: '÷' }
    };
}

// ===================
// Hint Generators
// ===================
// 4-staps hint ladder per skill type

const HINT_STRATEGIES = {
    addition: [
        (q) => `Tel op vanaf het grootste getal`,
        (q) => `Gebruik je vingers of een getallenlijn`,
        (q) => {
            const { a, b } = q.params;
            if (a + b > 10) {
                const toTen = 10 - Math.max(a, b);
                return `Maak eerst 10: ${Math.max(a,b)} + ${toTen} = 10, dan nog ${Math.min(a,b) - toTen} erbij`;
            }
            return `${a} + ${b} = tel ${b} stapjes verder vanaf ${a}`;
        },
        (q) => `Het antwoord is ${q.answer}. Probeer nu: ${q.params.a + 1} + ${q.params.b}`
    ],
    subtraction: [
        (q) => `Tel terug vanaf het eerste getal`,
        (q) => `Gebruik je vingers of een getallenlijn`,
        (q) => {
            const { a, b } = q.params;
            return `${a} - ${b}: begin bij ${a}, tel ${b} stapjes terug`;
        },
        (q) => {
            const nextB = Math.max(1, q.params.b - 1);
            return `Het antwoord is ${q.answer}. Probeer nu: ${q.params.a} - ${nextB}`;
        }
    ],
    multiplication: [
        (q) => `Vermenigvuldigen = steeds hetzelfde erbij tellen`,
        (q) => {
            const { a, b } = q.params;
            return `${a} × ${b} = ${a} + ${a} + ... (${b} keer)`;
        },
        (q) => {
            const { a, b } = q.params;
            const steps = [];
            let sum = 0;
            for (let i = 1; i <= Math.min(b, 5); i++) {
                sum += a;
                steps.push(sum);
            }
            return `Tel: ${steps.join(', ')}...`;
        },
        (q) => `Het antwoord is ${q.answer}. Onthoud: ${q.params.a} × ${q.params.b} = ${q.answer}`
    ],
    division: [
        (q) => `Delen = omgekeerd van de tafel`,
        (q) => {
            const { a, b, result } = q.params;
            return `${result} ÷ ${b}: hoeveel keer past ${b} in ${result}?`;
        },
        (q) => {
            const { a, b, result } = q.params;
            return `Denk aan de tafel: ${b} × ? = ${result}`;
        },
        (q) => `Het antwoord is ${q.answer}. Want ${q.params.b} × ${q.answer} = ${q.params.result}`
    ],
    splitting: [
        (q) => `Welk getal mist er om het totaal te maken?`,
        (q) => `Tel op vanaf wat je al weet`,
        (q) => {
            const { a, b, total } = q.params;
            // Adapt hint based on question type
            if (q.display.startsWith('?')) {
                return `? + ${b} = ${total}, dus ? = ${total} - ${b}`;
            } else if (q.display.includes('+ ?')) {
                return `${a} + ? = ${total}, dus ? = ${total} - ${a}`;
            } else {
                return `${total} - ? = ${a}, dus ? = ${total} - ${a}`;
            }
        },
        (q) => `Het antwoord is ${q.answer}`
    ]
};

function getHintForQuestion(question, hintLevel) {
    // Handle questions without skillId (e.g., from adventure mode)
    if (!question || !question.skillId) {
        return getGenericHint(question, hintLevel);
    }
    
    const skill = SKILLS[question.skillId];
    if (!skill) {
        return getGenericHint(question, hintLevel);
    }
    
    const category = skill.category;
    const hints = HINT_STRATEGIES[category];
    
    if (!hints || hintLevel < 1 || hintLevel > 4) return 'Denk goed na...';
    
    // Safety check: ensure params exists for hint functions
    if (!question.params) {
        return getGenericHint(question, hintLevel);
    }
    
    try {
        const hintFn = hints[hintLevel - 1];
        return typeof hintFn === 'function' ? hintFn(question) : hintFn;
    } catch (e) {
        return getGenericHint(question, hintLevel);
    }
}

function getGenericHint(question, hintLevel) {
    const genericHints = [
        'Neem de tijd en denk rustig na.',
        'Probeer het op te splitsen in kleinere stappen.',
        'Gebruik je vingers of een getallenlijn om te helpen.',
        question ? `Het antwoord is ${question.answer}.` : 'Probeer het opnieuw.'
    ];
    
    if (hintLevel < 1 || hintLevel > 4) return 'Denk goed na...';
    return genericHints[hintLevel - 1];
}

// ===================
// Helper Functions
// ===================

function getSkillById(skillId) {
    return SKILLS[skillId] || null;
}

function getSkillsByCategory(category) {
    return Object.values(SKILLS).filter(s => s.category === category);
}

function getAllSkills() {
    return Object.values(SKILLS);
}

function getSkillCategories() {
    return SKILL_CATEGORIES;
}
