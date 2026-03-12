// Puzzle Types
export type PuzzleType =
    | 'NumberMatrix'
    | 'PatternLogic'
    | 'SequenceSolver'
    | 'DeductionGrid'
    | 'BinaryLogic';

// Base Puzzle Definition
export interface BasePuzzle {
    id: string; // The generated date string e.g., "YYYY-MM-DD"
    type: PuzzleType;
    difficulty: number; // 1 (Easy), 2 (Medium), 3 (Hard)
    seed: number; // The deterministic seed used for this puzzle
}

// Logic for Number Matrix (Sudoku-like variations)
export interface NumberMatrixPuzzle extends BasePuzzle {
    type: 'NumberMatrix';
    data: {
        grid: (number | null)[][]; // The initial grid (null means empty)
        solution: number[][]; // The solved grid
        size: number; // e.g., 4, 6, 9
        rules: string[]; // Specific rules for this instance
    };
}

// Logic for Sequence Solver
export interface SequencePuzzle extends BasePuzzle {
    type: 'SequenceSolver';
    data: {
        sequence: number[]; // The sequence with missing numbers at the end
        missingCount: number;
        solution: number[]; // The correct missing numbers
        ruleDescription: string;
    };
}

export type AnyPuzzle = NumberMatrixPuzzle | SequencePuzzle; // + others to be added
