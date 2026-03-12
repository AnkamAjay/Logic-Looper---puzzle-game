import { useState, useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { SplashScreen } from './components/ui/SplashScreen'
import { PuzzleBoard } from './components/puzzle/PuzzleBoard'
import { Timer } from './components/puzzle/Timer'
import { Heatmap } from './components/gamification/Heatmap'
import { getDailyPuzzle } from './lib/puzzle'
import { calculateStreak } from './lib/streaks'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { setCurrentDate, setGameLoaded, updateScore, useHint } from './store/slices/gameSlice'
import { idbService } from './lib/db'
import type { DailyActivity } from './lib/db'
import type { SequencePuzzle, NumberMatrixPuzzle } from './lib/puzzle/types'
import dayjs from 'dayjs'
import { Lightbulb, Trophy } from 'lucide-react'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const dispatch = useAppDispatch();
  const { isGameLoaded, score, timeTaken, hintsRemaining } = useAppSelector(state => state.game);

  const [activityData, setActivityData] = useState<DailyActivity[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const initGame = async () => {
      const today = dayjs().format('YYYY-MM-DD');
      dispatch(setCurrentDate(today));

      // Find existing progress
      const activity = await idbService.getActivity(today);
      if (activity && activity.solved) {
        setIsSolved(true);
        dispatch(updateScore(activity.score));
      }

      const allActivity = await idbService.getAllActivity();
      setActivityData(allActivity);
      setStreak(calculateStreak(allActivity));

      const todayPuzzle = getDailyPuzzle(today);
      setPuzzle(todayPuzzle);
      dispatch(setGameLoaded(true));
    }

    initGame();
  }, [dispatch]);

  const handleStart = () => {
    setIsPlaying(true);
  }

  const handleSolve = async (earnedScore: number) => {
    setIsPlaying(false);
    setIsSolved(true);
    dispatch(updateScore(earnedScore));

    // Save to Local DB
    await idbService.saveActivity({
      date: dayjs().format('YYYY-MM-DD'),
      solved: true,
      score: earnedScore,
      timeTaken: timeTaken,
      difficulty: puzzle.difficulty,
      synced: false
    });

    // Update activity data for heatmap
    const updated = await idbService.getAllActivity();
    setActivityData(updated);
    setStreak(calculateStreak(updated));
  }

  const handleHint = () => {
    if (hintsRemaining > 0) {
      dispatch(useHint());
      setShowHint(true);
      setTimeout(() => setShowHint(false), 4000);
    }
  }

  const getHintText = (): string => {
    if (!puzzle) return '';
    
    if (puzzle.type === 'SequenceSolver') {
      const seq = puzzle as SequencePuzzle;
      return `Pattern: ${seq.data.ruleDescription}`;
    } else if (puzzle.type === 'NumberMatrix') {
      const matrix = puzzle as NumberMatrixPuzzle;
      return `Rule: ${matrix.data.rules[0]}`;
    }
    return '';
  }

  return (
    <>
      <SplashScreen onComplete={() => setShowSplash(false)} />

      {!showSplash && isGameLoaded && (
        <Layout>
          <div className="py-6 flex flex-col items-center justify-start min-h-[60vh]">

            {/* Top Bar for Game Stats */}
            <div className="w-full flex justify-between items-center mb-6 px-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                <Trophy size={16} className="text-accent-orange" />
                <span className="text-sm font-bold">{score} pts</span>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                <Timer isActive={isPlaying} />
              </div>

              <button 
                onClick={handleHint}
                disabled={hintsRemaining === 0 || !isPlaying}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-light-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb size={16} className={hintsRemaining > 0 ? "text-primary-blue" : "text-gray-400"} />
                <span className="text-sm font-bold">{hintsRemaining}</span>
              </button>
            </div>

            {/* Hint Display */}
            {showHint && (
              <div className="w-full mb-4 p-4 bg-accent-orange/10 border border-accent-orange rounded-xl animate-pulse">
                <p className="text-sm font-medium text-accent-orange">💡 Hint: {getHintText()}</p>
              </div>
            )}

            <div className="bg-white p-5 rounded-3xl shadow-sm w-full outline outline-1 outline-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-accent-orange tracking-wider uppercase mb-1">
                    {dayjs().format('MMMM D, YYYY')}
                  </span>
                  <h2 className="text-xl font-heading font-bold leading-tight">
                    {puzzle?.type === 'NumberMatrix' ? 'Number Grid' : 'Sequence Logic'}
                  </h2>
                  <div className="flex mt-2 gap-1">
                    {/* Difficulty blocks */}
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={`w-8 h-1.5 rounded-full ${level <= puzzle?.difficulty ? 'bg-primary-blue' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {isSolved ? (
                <div className="w-full py-8 flex flex-col items-center justify-center bg-light-blue rounded-2xl border-2 border-primary-blue/20">
                  <div className="w-16 h-16 rounded-full bg-primary-blue flex items-center justify-center mb-4 shadow-lg shadow-primary-blue/30">
                    <Trophy className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-primary-dark">Solved!</h3>
                  <p className="text-sm text-dark-gray mt-1">Come back tomorrow for a new puzzle.</p>

                  <div className="flex gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-blue">{score}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Points</div>
                    </div>
                    <div className="w-px h-10 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-dark">{timeTaken}s</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Time</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!isPlaying ? (
                    <button
                      onClick={handleStart}
                      className="w-full py-4 mt-4 bg-primary-blue text-white rounded-xl font-bold font-heading hover:bg-bright-blue transition-colors shadow-lg shadow-primary-blue/20 active:scale-95 transform"
                    >
                      Start Challenge
                    </button>
                  ) : (
                    <PuzzleBoard 
                      puzzle={puzzle}
                      onSolve={handleSolve}
                      isActive={isPlaying}
                      timeTaken={timeTaken}
                    />
                  )}
                </>
              )}
            </div>

            {!isPlaying && !isSolved && (
              <p className="text-center text-xs text-dark-gray mt-6 max-w-[200px]">
                Timer starts when you press start. You have {hintsRemaining} hints available.
              </p>
            )}

            {!isPlaying && (
              <div className="w-full mt-8 bg-white p-5 rounded-3xl shadow-sm outline outline-1 outline-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heading font-bold text-primary-dark">Your Activity</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-accent-orange to-primary-blue rounded-full text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    <span className="text-lg font-heading font-bold ml-1">{streak}</span>
                    <span className="text-xs">🔥</span>
                  </div>
                </div>

                <Heatmap activityData={activityData} />
              </div>
            )}

          </div>
        </Layout>
      )}
    </>
  )
}

export default App
