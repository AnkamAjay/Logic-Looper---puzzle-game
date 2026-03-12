import type { SequencePuzzle } from '../types'
import { getDeterministicSeed, getRandomInt } from '../random'

/**
 * Generates a deterministically seeded sequence solving puzzle for a given date
 */
export function generateSequencePuzzle(date: string, difficulty: number): SequencePuzzle {
    const seed = getDeterministicSeed(date, 'sequence');

    let puzzleLength = 5;
    let missingCount = 1;

    if (difficulty === 2) {
        puzzleLength = 6;
        missingCount = 2;
    } else if (difficulty >= 3) {
        puzzleLength = 7;
        missingCount = 2;
    }

    // 1 = arithmetic, 2 = geometric, 3 = fibonacci-like
    const patternType = getRandomInt(seed, 1, Math.min(difficulty, 3));

    let sequence: number[] = [];
    let ruleDescription = '';

    if (patternType === 1) {
        // Arithmetic progression (e.g., +2, +5, -3)
        const seed2 = getDeterministicSeed(date, 'seq_arithmetic');
        const step = getRandomInt(seed2, 1, 10 + (difficulty * 5));
        const startVal = getRandomInt(seed, 1, 50);

        for (let i = 0; i < puzzleLength; i++) {
            sequence.push(startVal + (i * step));
        }
        ruleDescription = `Identify the arithmetic sequence progression (+${step})`;
    } else if (patternType === 2) {
        // Geometric progression (e.g., *2, *3)
        const seed2 = getDeterministicSeed(date, 'seq_geometric');
        const factor = getRandomInt(seed2, 2, 3 + (difficulty === 3 ? 1 : 0));
        const startVal = getRandomInt(seed, 1, 5);

        for (let i = 0; i < puzzleLength; i++) {
            sequence.push(startVal * Math.pow(factor, i));
        }
        ruleDescription = `Identify the geometric sequence progression (*${factor})`;
    } else {
        // Fibonacci style
        const start1 = getRandomInt(seed, 1, 10);
        const start2 = getRandomInt(getDeterministicSeed(date, 'seq_fib'), 1, 10);

        sequence.push(start1);
        sequence.push(start2);

        for (let i = 2; i < puzzleLength; i++) {
            sequence.push(sequence[i - 1] + sequence[i - 2]);
        }
        ruleDescription = 'Identify the sum-based sequence progression';
    }

    // Extract the solutions from the end
    const solution = sequence.slice(sequence.length - missingCount);

    // Replace missing spots with null equivalent (we just slice the array)
    sequence = sequence.slice(0, sequence.length - missingCount);

    return {
        id: date,
        type: 'SequenceSolver',
        difficulty,
        seed,
        data: {
            sequence,
            missingCount,
            solution,
            ruleDescription
        }
    }
}
