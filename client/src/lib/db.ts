import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'logic-looper-db';
const DB_VERSION = 1;

export interface DailyActivity {
    date: string; // YYYY-MM-DD
    solved: boolean;
    score: number;
    timeTaken: number;
    difficulty: number;
    synced: boolean;
    puzzleContent?: any; // Compressed or raw puzzle state
}

export interface Achievement {
    id: string;
    unlockedAt: string;
}

interface LogicLooperDB {
    dailyActivity: {
        key: string;
        value: DailyActivity;
        indexes: { 'by-synced': boolean };
    };
    achievements: {
        key: string;
        value: Achievement;
    };
}

let dbPromise: Promise<IDBPDatabase<LogicLooperDB>>;

const getDB = async () => {
    if (!dbPromise) {
        dbPromise = openDB<LogicLooperDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('dailyActivity')) {
                    const activityStore = db.createObjectStore('dailyActivity', { keyPath: 'date' });
                    activityStore.createIndex('by-synced', 'synced');
                }
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
};

export const idbService = {
    async saveActivity(activity: DailyActivity) {
        const db = await getDB();
        await db.put('dailyActivity', activity);
    },

    async getActivity(date: string): Promise<DailyActivity | undefined> {
        const db = await getDB();
        return db.get('dailyActivity', date);
    },

    async getAllActivity(): Promise<DailyActivity[]> {
        const db = await getDB();
        return db.getAll('dailyActivity');
    },

    async getUnsyncedActivity(): Promise<DailyActivity[]> {
        const db = await getDB();
        const allActivity = await db.getAll('dailyActivity');
        return allActivity.filter(a => !a.synced);
    },

    async markAsSynced(dates: string[]) {
        const db = await getDB();
        const tx = db.transaction('dailyActivity', 'readwrite');
        for (const date of dates) {
            const activity = await tx.store.get(date);
            if (activity) {
                activity.synced = true;
                await tx.store.put(activity);
            }
        }
        await tx.done;
    },

    async saveAchievement(achievement: Achievement) {
        const db = await getDB();
        await db.put('achievements', achievement);
    },

    async getAchievements(): Promise<Achievement[]> {
        const db = await getDB();
        return db.getAll('achievements');
    }
};
