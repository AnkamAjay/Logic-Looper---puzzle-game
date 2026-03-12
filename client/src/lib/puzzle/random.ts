import CryptoJS from 'crypto-js';

// The secret key ensures the random sequence is unique to Bluestock Logic Looper
const PUZZLE_SECRET = "BLUESTOCK_LOGIC_LOOPER_SECRET_2026";

/**
 * Generates a deterministic number between 0 and 1 based on a date seed.
 * 
 * @param date - The date string in YYYY-MM-DD format
 * @param variation - An optional string to generate a different seed for the same date (e.g. for different puzzle parts)
 * @returns A pseudo-random float between 0 and 1
 */
export function getDeterministicSeed(date: string, variation: string = ''): number {
    const hash = CryptoJS.HmacSHA256(`${date}-${variation}`, PUZZLE_SECRET).toString();

    // Convert first 8 hex characters to an integer
    const hexSubstring = hash.substring(0, 8);
    const intVal = parseInt(hexSubstring, 16);

    // Normalize to 0-1
    return intVal / 0xffffffff;
}

/**
 * Generates a deterministic integer between min and max (inclusive)
 */
export function getRandomInt(seed: number, min: number, max: number): number {
    return Math.floor(seed * (max - min + 1)) + min;
}

/**
 * Deterministically shuffles an array based on a seed
 */
export function shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    // Simple LCG (Linear Congruential Generator) for generating multiple numbers from one seed
    let currentSeed = seed * 0xffffffff;

    for (let i = shuffled.length - 1; i > 0; i--) {
        currentSeed = (currentSeed * 1664525 + 1013904223) % 0xffffffff;
        const j = Math.floor((currentSeed / 0xffffffff) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
