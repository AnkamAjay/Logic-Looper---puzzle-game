import type { AnyPuzzle } from './types'
import { generateNumberMatrixPuzzle } from './generators/matrix'
import { generateSequencePuzzle } from './generators/sequence'
import { getDeterministicSeed, getRandomInt } from './random'
import dayjs from 'dayjs'

/**
 * Returns the deterministic puzzle for the given date.
 * If no date is given, it uses today.
 */
export function getDailyPuzzle(dateStr?: string): AnyPuzzle {
    const date = dateStr || dayjs().format('YYYY-MM-DD');

    // Determine puzzle type deterministically for the day
    // 1 = Matrix, 2 = Sequence
    const typeSeed = getDeterministicSeed(date, 'type');
    const typeSelection = getRandomInt(typeSeed, 1, 2);

    // Determine difficulty (1 = Easy, 2 = Med, 3 = Hard) based on day of week or random
    const dayOfWeek = dayjs(date).day();
    let difficulty = 1; // Mon, Tue
    if (dayOfWeek === 3 || dayOfWeek === 4) difficulty = 2; // Wed, Thu
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) difficulty = 3; // Fri, Sat, Sun

    if (typeSelection === 1) {
        return generateNumberMatrixPuzzle(date, difficulty);
    } else {
        return generateSequencePuzzle(date, difficulty);
    }
}

/**
 * Validates a user's solution against the puzzle's expected solution
 */
export function validateSolution(puzzle: AnyPuzzle, userSolution: any): boolean {
    if (puzzle.type === 'NumberMatrix') {
        const typedPuzzle = puzzle as import('./types').NumberMatrixPuzzle;
        const grid = userSolution as number[][];

        // Check if every cell matches
        for (let r = 0; r < typedPuzzle.data.size; r++) {
            for (let c = 0; c < typedPuzzle.data.size; c++) {
                if (grid[r][c] !== typedPuzzle.data.solution[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }

    if (puzzle.type === 'SequenceSolver') {
        const typedPuzzle = puzzle as import('./types').SequencePuzzle;
        const ans = userSolution as number[];

        if (ans.length !== typedPuzzle.data.solution.length) return false;

        for (let i = 0; i < ans.length; i++) {
            if (ans[i] !== typedPuzzle.data.solution[i]) {
                return false;
            }
        }
        return true;
    }

    return false;
}
