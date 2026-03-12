import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import type { DailyActivity } from '../../lib/db';

interface HeatmapProps {
    activityData: DailyActivity[];
    year?: number;
}

const INTENSITY_MAP: Record<number, string> = {
    0: 'bg-gray-200',
    1: 'bg-light-blue',
    2: 'bg-primary-blue/60',
    3: 'bg-primary-blue',
    4: 'bg-deep-purple',
};

// Memoized single cell
const HeatmapCell: React.FC<{ date: string; level: number; delay: number }> = React.memo(({ date, level, delay }) => {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay * 0.001, duration: 0.2 }}
            className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[level]} hover:ring-2 hover:ring-accent-orange cursor-pointer transition-colors relative group`}
            title={`${dayjs(date).format('MMM D, YYYY')} - Level ${level}`}
        />
    );
});

export const Heatmap: React.FC<HeatmapProps> = ({ activityData, year }) => {
    // Memoize the grid generation to avoid recalculating 365 cells on every render
    const grid = useMemo(() => {
        const targetYear = year || dayjs().year();
        const startOfYear = dayjs(`${targetYear}-01-01`);
        const daysInYear = dayjs(`${targetYear}-12-31`).diff(startOfYear, 'day') + 1;

        // Create map for O(1) lookups
        const activityMap = new Map(activityData.map(a => [a.date, a]));

        const weeks: { date: string, level: number }[][] = [];
        let currentWeek: { date: string, level: number }[] = [];

        // Pad the first week to align with Sunday start
        const startObj = startOfYear.day();
        for (let _i = 0; _i < startObj; _i++) {
            currentWeek.push({ date: 'PAD', level: -1 }); // Transparent padding
        }

        for (let i = 0; i < daysInYear; i++) {
            const currentDay = startOfYear.add(i, 'day');
            const dateStr = currentDay.format('YYYY-MM-DD');
            const activity = activityMap.get(dateStr);

            let level = 0;
            if (activity?.solved) {
                // Calculate intensity based on difficulty and score
                if (activity.score === 100) level = 4; // Perfect Score
                else if (activity.difficulty === 3) level = 3; // Hard
                else if (activity.difficulty === 2) level = 2; // Medium
                else level = 1; // Easy
            }

            currentWeek.push({ date: dateStr, level });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ date: 'PAD', level: -1 });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [activityData, year]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-max flex flex-col gap-1">
                {/* Months header */}
                <div className="flex text-[10px] text-gray-400 font-medium mb-1 pl-6">
                    {months.map((m) => (
                        <div key={m} style={{ width: `${(100 / 12) * grid.length}px` }} className="flex-shrink-0">{m}</div>
                    ))}
                </div>

                <div className="flex gap-1">
                    {/* Days of week axis */}
                    <div className="flex flex-col gap-1 pr-2 text-[10px] text-gray-400 font-medium">
                        <div className="h-3 leading-3">S</div>
                        <div className="h-3 leading-3">M</div>
                        <div className="h-3 leading-3">T</div>
                        <div className="h-3 leading-3">W</div>
                        <div className="h-3 leading-3">T</div>
                        <div className="h-3 leading-3">F</div>
                        <div className="h-3 leading-3">S</div>
                    </div>

                    {/* The Grid Array - Weeks are Columns, Days are Rows */}
                    {grid.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((cell, dIndex) => (
                                cell.level === -1 ? (
                                    <div key={`${wIndex}-${dIndex}`} className="w-3 h-3 transparent" />
                                ) : (
                                    <HeatmapCell
                                        key={cell.date}
                                        date={cell.date}
                                        level={cell.level}
                                        delay={(wIndex * 7) + dIndex} // Staggered intro
                                    />
                                )
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend overview */}
                <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] text-gray-400">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-light-blue rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary-blue/60 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary-blue rounded-sm"></div>
                    <div className="w-3 h-3 bg-deep-purple rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};
