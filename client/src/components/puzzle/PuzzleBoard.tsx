import React, { useState } from 'react';
import { validateSolution } from '../../lib/puzzle';
import type { AnyPuzzle } from '../../lib/puzzle/types';
import type { NumberMatrixPuzzle, SequencePuzzle } from '../../lib/puzzle/types';

interface PuzzleBoardProps {
    puzzle: AnyPuzzle;
    onSolve: (score: number) => void;
    isActive: boolean;
    timeTaken: number;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ puzzle, onSolve, isActive, timeTaken }) => {
    // Sequence inputs state
    const [sequenceAnswers, setSequenceAnswers] = useState<(number | '')[]>(
        Array((puzzle?.type === 'SequenceSolver' ? (puzzle as SequencePuzzle).data.missingCount : 0)).fill('')
    );

    // Matrix inputs state
    const [matrixAnswers, setMatrixAnswers] = useState<(number | null)[][]>(
        puzzle?.type === 'NumberMatrix' 
            ? (puzzle as NumberMatrixPuzzle).data.grid.map(row => [...row])
            : []
    );

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isActive) {
        return (
            <div className="w-full aspect-square bg-light-gray rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-dark-gray font-medium">Press Start to Play</p>
            </div>
        )
    }

    // Calculate score based on time and difficulty
    const calculateScore = (): number => {
        const baseScore = 100;
        const difficulty = puzzle.difficulty;
        const difficultyMultiplier = difficulty === 1 ? 1 : difficulty === 2 ? 1.5 : 2;
        
        // Time bonus: up to 50% bonus if solved in under 2 minutes
        const timeMultiplier = Math.max(0.5, Math.min(1.5, (120 - Math.min(timeTaken, 120)) / 120 + 1));
        
        return Math.round(baseScore * difficultyMultiplier * timeMultiplier);
    };

    const handleSequenceChange = (index: number, value: string) => {
        const newAnswers = [...sequenceAnswers];
        newAnswers[index] = value === '' ? '' : parseInt(value);
        setSequenceAnswers(newAnswers);
        setError('');
    };

    const handleMatrixChange = (rIndex: number, cIndex: number, value: string) => {
        const newAnswers = matrixAnswers.map(row => [...row]);
        newAnswers[rIndex][cIndex] = value === '' ? null : parseInt(value);
        setMatrixAnswers(newAnswers);
        setError('');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            let isValid = false;

            if (puzzle.type === 'SequenceSolver') {
                // Check all answers are filled
                if (sequenceAnswers.some(ans => ans === '')) {
                    setError('Please fill in all missing numbers');
                    setIsSubmitting(false);
                    return;
                }
                isValid = validateSolution(puzzle, sequenceAnswers);
            } else if (puzzle.type === 'NumberMatrix') {
                // Check all empty cells are filled
                const hasEmpty = matrixAnswers.some(row => 
                    row.some((cell, idx) => {
                        const originalGrid = (puzzle as NumberMatrixPuzzle).data.grid;
                        const origRow = matrixAnswers.indexOf(row);
                        return originalGrid[origRow][idx] === null && cell === null;
                    })
                );

                if (hasEmpty) {
                    setError('Please fill in all empty cells');
                    setIsSubmitting(false);
                    return;
                }

                isValid = validateSolution(puzzle, matrixAnswers);
            }

            if (isValid) {
                const score = calculateScore();
                onSolve(score);
            } else {
                setError('❌ Incorrect solution. Try again!');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-dark-gray mb-2">
                {puzzle.type === 'NumberMatrix' && (puzzle as NumberMatrixPuzzle).data.rules[0]}
                {puzzle.type === 'SequenceSolver' && (puzzle as SequencePuzzle).data.ruleDescription}
            </div>

            {puzzle.type === 'SequenceSolver' && (
                <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {(puzzle as SequencePuzzle).data.sequence.map((num, i) => (
                            <div key={i} className="w-12 h-12 flex items-center justify-center bg-light-blue text-primary-dark font-bold rounded-lg text-lg">
                                {num}
                            </div>
                        ))}
                        {sequenceAnswers.map((_, i) => (
                            <input
                                key={`missing-${i}`}
                                type="number"
                                value={sequenceAnswers[i] === '' ? '' : sequenceAnswers[i]}
                                onChange={(e) => handleSequenceChange(i, e.target.value)}
                                className="w-12 h-12 flex items-center justify-center bg-white border-2 border-primary-blue text-primary-dark font-bold rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-accent-orange"
                                placeholder="?"
                            />
                        ))}
                    </div>
                </div>
            )}

            {puzzle.type === 'NumberMatrix' && (
                <div
                    className="w-full bg-white p-2 rounded-xl shadow-sm border border-gray-100 grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${(puzzle as NumberMatrixPuzzle).data.size}, minmax(0, 1fr))`
                    }}
                >
                    {matrixAnswers.map((row, rIndex) =>
                        row.map((cell, cIndex) => {
                            const originalCell = (puzzle as NumberMatrixPuzzle).data.grid[rIndex][cIndex];
                            return (
                                <div key={`${rIndex}-${cIndex}`} className="aspect-square relative">
                                    {originalCell !== null ? (
                                        <div className="w-full h-full flex items-center justify-center bg-light-gray text-primary-dark font-bold rounded-md text-lg sm:text-2xl">
                                            {originalCell}
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={cell === null ? '' : cell}
                                            onChange={(e) => handleMatrixChange(rIndex, cIndex, e.target.value)}
                                            className="w-full h-full flex items-center justify-center bg-white border border-gray-300 text-primary-blue font-bold rounded-md text-lg sm:text-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {error && (
                <div className="w-full p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-primary-blue text-white rounded-xl font-bold font-heading hover:bg-bright-blue transition-colors shadow-md hover:shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Checking...' : 'Check Solution'}
            </button>
        </div>
    );
};
