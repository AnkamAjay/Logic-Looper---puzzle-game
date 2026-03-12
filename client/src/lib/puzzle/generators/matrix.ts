import type { NumberMatrixPuzzle } from '../types'
import { getDeterministicSeed, getRandomInt } from '../random'

export function generateNumberMatrixPuzzle(date: string, difficulty: number): NumberMatrixPuzzle {
    const seed = getDeterministicSeed(date, 'matrix');
    const size = difficulty === 1 ? 3 : (difficulty === 2 ? 4 : 5);

    // Generating a completely filled valid grid (Simplified for demo)
    // In a real Sudoku-like grid, we'd need a backtracking solver
    // For 'Logic Looper', we'll create a magic-square-lite or deterministic pattern

    const solution: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
    const grid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

    const baseNumber = getRandomInt(seed, 1, 5);
    let currentVal = baseNumber;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Deterministically fill a valid solution (e.g. sum patterns or sequence)
            solution[r][c] = currentVal + (r * size) + c;
        }
    }

    // Remove numbers based on difficulty to create the puzzle
    const cellsToRemove = Math.floor((size * size) * (0.3 + (difficulty * 0.15)));

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            grid[r][c] = solution[r][c]; // Copy solution
        }
    }

    // Deterministically punch holes
    let removed = 0;
    let attempts = 0;
    while (removed < cellsToRemove && attempts < 100) {
        const rInt = getRandomInt(getDeterministicSeed(date, `r_${attempts}`), 0, size - 1);
        const cInt = getRandomInt(getDeterministicSeed(date, `c_${attempts}`), 0, size - 1);

        if (grid[rInt][cInt] !== null) {
            grid[rInt][cInt] = null;
            removed++;
        }
        attempts++;
    }

    return {
        id: date,
        type: 'NumberMatrix',
        difficulty,
        seed,
        data: {
            size,
            grid,
            solution,
            rules: ['Fill the grid so every row and column follows the logic sequence given the visible numbers.']
        }
    };
}
