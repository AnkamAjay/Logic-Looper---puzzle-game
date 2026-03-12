import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateTimeTaken } from '../../store/slices/gameSlice';
import { Clock } from 'lucide-react';

interface TimerProps {
    isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ isActive }) => {
    const [seconds, setSeconds] = useState(0);
    const dispatch = useAppDispatch();
    const timeTaken = useAppSelector(state => state.game.timeTaken);

    // Initialize from store if already playing
    useEffect(() => {
        if (timeTaken > 0 && seconds === 0) {
            setSeconds(timeTaken);
        }
    }, [timeTaken, seconds]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (isActive) {
            interval = setInterval(() => {
                setSeconds(prev => {
                    const newTime = prev + 1;
                    // Update store frequently to ensure accuracy
                    dispatch(updateTimeTaken(newTime));
                    return newTime;
                });
            }, 1000);
        } else {
            // When timer stops, sync the final time to store
            if (seconds > 0) {
                dispatch(updateTimeTaken(seconds));
            }
        }

        return () => clearInterval(interval);
    }, [isActive, dispatch, seconds]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-1 text-dark-gray font-sans font-medium">
            <Clock size={16} className="text-primary-blue" />
            <div className="w-16 tabular-nums text-right">
                {formatTime(seconds)}
            </div>
        </div>
    );
};
