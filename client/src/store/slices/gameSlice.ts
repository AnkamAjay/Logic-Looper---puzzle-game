import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface GameState {
    currentDate: string;
    isGameLoaded: boolean;
    score: number;
    timeTaken: number;
    difficulty: number;
    hintsRemaining: number;
    synced: boolean;
}

const initialState: GameState = {
    currentDate: '',
    isGameLoaded: false,
    score: 0,
    timeTaken: 0,
    difficulty: 1,
    hintsRemaining: 3,
    synced: false,
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameLoaded: (state, action: PayloadAction<boolean>) => {
            state.isGameLoaded = action.payload;
        },
        setCurrentDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        updateScore: (state, action: PayloadAction<number>) => {
            state.score += action.payload;
        },
        updateTimeTaken: (state, action: PayloadAction<number>) => {
            state.timeTaken = action.payload;
        },
        useHint: (state) => {
            if (state.hintsRemaining > 0) {
                state.hintsRemaining -= 1;
            }
        },
        resetDailyState: (state) => {
            state.score = 0;
            state.timeTaken = 0;
            state.hintsRemaining = 3;
            state.isGameLoaded = false;
            state.synced = false;
        },
    },
});

export const {
    setGameLoaded,
    setCurrentDate,
    updateScore,
    updateTimeTaken,
    useHint,
    resetDailyState,
} = gameSlice.actions;

export default gameSlice.reducer;
