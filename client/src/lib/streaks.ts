import type { DailyActivity } from './db';
import dayjs from 'dayjs';

/**
 * Calculates the current streak purely client-side
 * Never trust the server for streak display.
 */
export function calculateStreak(activityData: DailyActivity[]): number {
    if (!activityData || activityData.length === 0) return 0;

    let streak = 0;
    let current = dayjs();

    // Create map for O(1) lookups
    const activityMap = new Map(activityData.map(a => [a.date, a]));

    // Check if today is solved
    const todayStr = current.format("YYYY-MM-DD");
    if (activityMap.has(todayStr) && activityMap.get(todayStr)!.solved) {
        streak++;
    } else {
        // If today is not solved, see if yesterday was. 
        // If yes, the streak is still alive but pending today's action.
        current = current.subtract(1, "day");
        const yesterdayStr = current.format("YYYY-MM-DD");

        if (!activityMap.has(yesterdayStr) || !activityMap.get(yesterdayStr)!.solved) {
            return 0; // Streak broken
        }
    }

    // Count backwards continuously
    current = current.subtract(1, "day");

    while (true) {
        const dateStr = current.format("YYYY-MM-DD");
        if (activityMap.has(dateStr) && activityMap.get(dateStr)!.solved) {
            streak++;
            current = current.subtract(1, "day");
        } else {
            break;
        }
    }

    return streak;
}
