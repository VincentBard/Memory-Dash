import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  score: number;
  highScore: number;
  currentNumber: number;
  totalNumbers: number;
  timeElapsed: number;
  level: string;
  isPlaying: boolean;
  isShowingSequence?: boolean;
  sequenceTimeLeft?: number;
}

export const ScoreBoard = ({
  score,
  highScore,
  currentNumber,
  totalNumbers,
  timeElapsed,
  level,
  isPlaying,
  isShowingSequence = false,
  sequenceTimeLeft,
}: ScoreBoardProps) => {
  const progress =
    totalNumbers > 0 ? Math.round((currentNumber / totalNumbers) * 100) : 0;
  const formatTime = (ms: number) => (ms / 1000).toFixed(1);

  return (
    <div className="bg-game-bg/80 backdrop-blur-sm border border-game-accent/30 rounded-xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-game-accent animate-score-pop">
            {score}
          </div>
          <div className="text-sm text-game-primary font-medium">SCORE</div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-game-secondary">
            {highScore}
          </div>
          <div className="text-sm text-game-primary font-medium">BEST</div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {currentNumber}/{totalNumbers}
          </div>
          <div className="text-sm text-game-primary font-medium">PROGRESS</div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {formatTime(timeElapsed)}s
          </div>
          <div className="text-sm text-game-primary font-medium">TIME</div>
        </div>
      </div>

      {/* Progress Bar */}
      {isPlaying && totalNumbers > 0 && (
        <div className="mt-4">
          <div className="w-full bg-game-bg/40 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-game-accent to-game-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-xs text-game-primary/80 mt-1">
            {progress}% Complete
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-game-accent/20">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                {
                  "bg-green-500/20 text-green-400": level === "easy",
                  "bg-yellow-500/20 text-yellow-400": level === "medium",
                  "bg-orange-500/20 text-orange-400": level === "hard",
                  "bg-red-500/20 text-red-400": level === "expert",
                },
              )}
            >
              {level}
            </span>

            {isShowingSequence && sequenceTimeLeft !== undefined && (
              <span className="text-game-warning font-mono text-lg font-bold animate-pulse">
                Memorize: {Math.ceil(sequenceTimeLeft / 1000)}s
              </span>
            )}
          </div>

          <div className="text-right">
            {isShowingSequence && (
              <div className="text-game-warning font-medium">
                📝 Study the sequence!
              </div>
            )}
            {isPlaying && !isShowingSequence && (
              <div className="text-game-accent font-medium">
                🎯 Click in order!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
