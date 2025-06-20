import { useState, useEffect, useCallback, useRef } from "react";
import { GameTarget } from "./GameTarget";
import { ScoreBoard } from "./ScoreBoard";
import {
  DifficultySelector,
  type Difficulty,
  difficultyConfigs,
} from "./DifficultySelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Target {
  id: string;
  position: { x: number; y: number };
  isHit: boolean;
}

interface GameStats {
  score: number;
  hits: number;
  misses: number;
  reactionTimes: number[];
}

type GameState = "waiting" | "playing" | "gameOver";

export const GameBoard = () => {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    hits: 0,
    misses: 0,
    reactionTimes: [],
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("chimp-high-score");
    return saved ? parseInt(saved) : 0;
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const gameTimerRef = useRef<NodeJS.Timeout>();

  const config = difficultyConfigs[difficulty];

  const generateRandomPosition = useCallback(() => {
    const margin = 10; // Percentage margin from edges
    return {
      x: margin + Math.random() * (100 - 2 * margin),
      y: margin + Math.random() * (100 - 2 * margin),
    };
  }, []);

  const spawnTarget = useCallback(() => {
    if (
      targets.length < config.maxConcurrentTargets &&
      gameState === "playing"
    ) {
      const newTarget: Target = {
        id: Date.now().toString(),
        position: generateRandomPosition(),
        isHit: false,
      };
      setTargets((prev) => [...prev, newTarget]);
    }
  }, [
    targets.length,
    config.maxConcurrentTargets,
    gameState,
    generateRandomPosition,
  ]);

  const handleTargetHit = useCallback(
    (targetId: string, reactionTime: number) => {
      setTargets((prev) => prev.filter((t) => t.id !== targetId));
      setStats((prev) => {
        const newStats = {
          ...prev,
          score: prev.score + Math.max(100 - Math.floor(reactionTime / 10), 10),
          hits: prev.hits + 1,
          reactionTimes: [...prev.reactionTimes, reactionTime],
        };
        return newStats;
      });
    },
    [],
  );

  const handleTargetMiss = useCallback((targetId: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    setStats((prev) => ({
      ...prev,
      misses: prev.misses + 1,
    }));
  }, []);

  const startGame = () => {
    setGameState("playing");
    setStats({ score: 0, hits: 0, misses: 0, reactionTimes: [] });
    setTargets([]);
    setTimeLeft(30);

    // Start spawning targets
    spawnTimerRef.current = setInterval(spawnTarget, config.spawnRate);

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(() => {
    setGameState("gameOver");
    setTargets([]);

    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    // Update high score
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem("chimp-high-score", stats.score.toString());
    }
  }, [stats.score, highScore]);

  const resetGame = () => {
    setGameState("waiting");
    setStats({ score: 0, hits: 0, misses: 0, reactionTimes: [] });
    setTargets([]);
    setTimeLeft(30);
  };

  // Update spawn timer when difficulty changes
  useEffect(() => {
    if (gameState === "playing" && spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = setInterval(spawnTarget, config.spawnRate);
    }
  }, [difficulty, config.spawnRate, gameState, spawnTarget]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const averageReactionTime =
    stats.reactionTimes.length > 0
      ? Math.round(
          stats.reactionTimes.reduce((a, b) => a + b, 0) /
            stats.reactionTimes.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-bg via-purple-900/50 to-game-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-accent mb-4">
            Beat the Chimp! 🐵
          </h1>
          <p className="text-xl text-game-secondary max-w-2xl mx-auto">
            Test your reflexes! Click the chimps as fast as you can before they
            disappear.
          </p>
        </div>

        {/* Score Board */}
        <div className="mb-8">
          <ScoreBoard
            score={stats.score}
            highScore={highScore}
            hits={stats.hits}
            misses={stats.misses}
            averageReactionTime={averageReactionTime}
            level={difficulty}
            timeLeft={gameState === "playing" ? timeLeft : undefined}
            isPlaying={gameState === "playing"}
          />
        </div>

        {/* Game Area */}
        <div className="relative">
          {gameState === "waiting" && (
            <div className="bg-game-bg/60 backdrop-blur-sm border border-game-accent/30 rounded-xl p-8 space-y-8">
              <DifficultySelector
                selectedDifficulty={difficulty}
                onSelect={setDifficulty}
              />

              <div className="text-center">
                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-white font-bold px-12 py-6 text-xl rounded-xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
                >
                  🚀 Start Game
                </Button>
              </div>
            </div>
          )}

          {gameState === "playing" && (
            <div
              ref={gameAreaRef}
              className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-2 border-game-accent/30 rounded-xl overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(139, 69, 255, 0.1), rgba(59, 7, 100, 0.3))",
              }}
            >
              {targets.map((target) => (
                <GameTarget
                  key={target.id}
                  id={target.id}
                  position={target.position}
                  onHit={handleTargetHit}
                  onMiss={handleTargetMiss}
                  size={config.targetSize}
                  duration={config.targetDuration}
                  isHit={target.isHit}
                />
              ))}

              {/* Game instructions overlay */}
              <div className="absolute top-4 left-4 text-white/60 text-sm">
                Click the chimps quickly!
              </div>
            </div>
          )}

          {gameState === "gameOver" && (
            <div className="bg-game-bg/80 backdrop-blur-sm border border-game-accent/30 rounded-xl p-8 text-center space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">
                Game Over! 🎉
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-game-accent">
                    {stats.score}
                  </div>
                  <div className="text-sm text-game-primary">Final Score</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-game-secondary">
                    {stats.hits}
                  </div>
                  <div className="text-sm text-game-primary">Targets Hit</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {averageReactionTime}ms
                  </div>
                  <div className="text-sm text-game-primary">Avg Reaction</div>
                </div>
              </div>

              {stats.score === highScore && stats.score > 0 && (
                <div className="text-2xl font-bold text-game-accent animate-pulse">
                  🏆 New High Score! 🏆
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  🔄 Play Again
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="lg"
                  className="border-game-accent/50 text-game-accent hover:bg-game-accent/10 px-8 py-3 rounded-xl transition-all duration-300"
                >
                  ⚙️ Change Settings
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-game-primary/60 text-sm">
          <p>Challenge your reflexes and beat your high score!</p>
        </div>
      </div>
    </div>
  );
};
