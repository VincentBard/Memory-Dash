import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  score: number;
  highScore: number;
  hits: number;
  misses: number;
  averageReactionTime: number;
  level: string;
  timeLeft?: number;
  isPlaying: boolean;
}

export const ScoreBoard = ({
  score,
  highScore,
  hits,
  misses,
  averageReactionTime,
  level,
  timeLeft,
  isPlaying,
}: ScoreBoardProps) => {
  const accuracy =
    hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

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
          <div className="text-2xl font-bold text-white">{accuracy}%</div>
          <div className="text-sm text-game-primary font-medium">ACCURACY</div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {averageReactionTime > 0 ? `${averageReactionTime}ms` : "-"}
          </div>
          <div className="text-sm text-game-primary font-medium">AVG TIME</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-game-accent/20">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <span className="text-game-success">
              <span className="font-bold">{hits}</span> Hits
            </span>
            <span className="text-game-danger">
              <span className="font-bold">{misses}</span> Misses
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                {
                  "bg-green-500/20 text-green-400": level === "easy",
                  "bg-yellow-500/20 text-yellow-400": level === "medium",
                  "bg-red-500/20 text-red-400": level === "hard",
                },
              )}
            >
              {level}
            </span>

            {isPlaying && timeLeft !== undefined && (
              <span
                className={cn("font-mono text-lg font-bold", {
                  "text-game-accent": timeLeft > 10,
                  "text-game-warning": timeLeft <= 10 && timeLeft > 5,
                  "text-game-danger animate-pulse": timeLeft <= 5,
                })}
              >
                {timeLeft}s
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
