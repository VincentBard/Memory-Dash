import { useState, useEffect, useCallback, useRef } from "react";
import { MemoryCell } from "./MemoryCell";
import { ScoreBoard } from "./ScoreBoard";
import {
  DifficultySelector,
  type Difficulty,
  difficultyConfigs,
} from "./DifficultySelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GridCell {
  number: number;
  position: { row: number; col: number };
  isRevealed: boolean;
  isClickable: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  isNext: boolean;
}

interface GameStats {
  score: number;
  currentNumber: number;
  totalNumbers: number;
  timeElapsed: number;
  startTime: number;
}

type GameState = "waiting" | "playing" | "gameOver";

export const GameBoard = () => {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    currentNumber: 1,
    totalNumbers: 0,
    timeElapsed: 0,
    startTime: 0,
  });

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("memory-dash-high-score");
    return saved ? parseInt(saved) : 0;
  });

  const gameTimerRef = useRef<NodeJS.Timeout>();

  const config = difficultyConfigs[difficulty];

  // Generate random positions for numbers
  const generateSequence = useCallback(() => {
    const { sequenceLength, gridSize } = config;
    const totalCells = gridSize * gridSize;

    // Get random positions for the sequence
    const positions = [];
    for (let i = 0; i < totalCells; i++) {
      positions.push({
        row: Math.floor(i / gridSize),
        col: i % gridSize,
      });
    }

    // Shuffle and take first sequenceLength positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    const selectedPositions = positions.slice(0, sequenceLength);

    // Create grid with numbers
    const newGrid: GridCell[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newGrid.push({
        number: i + 1,
        position: selectedPositions[i],
        isRevealed: true,
        isClickable: false,
        isCorrect: false,
        isWrong: false,
        isNext: false,
      });
    }

    return newGrid;
  }, [config]);

  const startGame = () => {
    const sequence = generateSequence();
    setGrid(sequence);
    setStats({
      score: 0,
      currentNumber: 1,
      totalNumbers: config.sequenceLength,
      timeElapsed: 0,
      startTime: Date.now(),
    });
    startPlaying();
  };

  const startPlaying = () => {
    setGameState("playing");
    setStats((prev) => ({ ...prev, startTime: Date.now() }));

    // Make clickable but keep numbers visible until first click
    setGrid((prev) =>
      prev.map((cell) => ({
        ...cell,
        isRevealed: true,
        isClickable: true,
        isNext: false,
      })),
    );

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        timeElapsed: Date.now() - prev.startTime,
      }));
    }, 100);
  };

  const handleCellClick = useCallback(
    (clickedNumber: number) => {
      if (gameState !== "playing") return;

      setStats((prev) => {
        const expectedNumber = prev.currentNumber;

        if (clickedNumber === expectedNumber) {
          // Correct click
          setGrid((prevGrid) =>
            prevGrid.map((cell) => {
              if (cell.number === clickedNumber) {
                return {
                  ...cell,
                  isCorrect: true,
                  isClickable: false,
                  isNext: false,
                };
              }
              // Hide all numbers after first click
              return {
                ...cell,
                isRevealed: false,
                isNext: false,
              };
            }),
          );

          const newCurrentNumber = expectedNumber + 1;

          // Check if game is complete
          if (newCurrentNumber > prev.totalNumbers) {
            completeGame();
            return {
              ...prev,
              currentNumber: newCurrentNumber,
            };
          }

          return {
            ...prev,
            currentNumber: newCurrentNumber,
          };
        } else {
          // Wrong click - game over
          setGrid((prevGrid) =>
            prevGrid.map((cell) =>
              cell.number === clickedNumber
                ? { ...cell, isWrong: true, isClickable: false }
                : { ...cell, isClickable: false },
            ),
          );
          endGame(false);
          return prev;
        }
      });
    },
    [gameState],
  );

  const completeGame = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    setStats((prev) => {
      const finalTimeElapsed = Date.now() - prev.startTime;
      const timeBonus = Math.max(0, 30000 - finalTimeElapsed); // Bonus for speed
      const difficultyMultiplier = {
        easy: 1,
        medium: 2,
        hard: 3,
        expert: 5,
      }[difficulty];

      const finalScore = Math.round(
        (prev.totalNumbers * 100 + timeBonus / 10) * difficultyMultiplier,
      );

      // Update high score
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem("memory-dash-high-score", finalScore.toString());
      }

      setGameState("gameOver");

      return {
        ...prev,
        score: finalScore,
        timeElapsed: finalTimeElapsed,
      };
    });

    // Reveal all numbers
    setGrid((prev) =>
      prev.map((cell) => ({
        ...cell,
        isRevealed: true,
        isClickable: false,
      })),
    );
  }, [difficulty, highScore]);

  const endGame = useCallback((completed: boolean) => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    if (!completed) {
      setGameState("gameOver");
      // Reveal all numbers to show what the sequence was
      setGrid((prev) =>
        prev.map((cell) => ({
          ...cell,
          isRevealed: true,
          isClickable: false,
        })),
      );
    }
  }, []);

  const resetGame = () => {
    setGameState("waiting");
    setGrid([]);
    setStats({
      score: 0,
      currentNumber: 1,
      totalNumbers: 0,
      timeElapsed: 0,
      startTime: 0,
    });
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${config.gridSize}, 1fr)`,
    gap: "8px",
    aspectRatio: "1",
    maxWidth: "500px",
    margin: "0 auto",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-bg via-purple-900/50 to-game-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            <span className="text-white/80">Memory Dash</span> 🧠
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#00feae" }}>
            Memorize the sequence and click the numbers in order. Test your
            memory and speed!
          </p>
        </div>

        {/* Score Board */}
        <div className="mb-8">
          <ScoreBoard
            score={stats.score}
            highScore={highScore}
            currentNumber={Math.min(
              stats.currentNumber - 1,
              stats.totalNumbers,
            )}
            totalNumbers={stats.totalNumbers}
            timeElapsed={stats.timeElapsed}
            level={difficulty}
            isPlaying={gameState === "playing"}
            isShowingSequence={false}
            sequenceTimeLeft={0}
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
                  className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-white font-bold px-12 py-6 text-xl rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-game-primary/30"
                >
                  🚀 Start Game
                </Button>
              </div>
            </div>
          )}

          {gameState === "playing" && (
            <div className="bg-game-bg/20 backdrop-blur-sm border border-game-accent/30 rounded-xl p-8">
              <div style={gridStyle}>
                {grid.map((cell) => (
                  <MemoryCell
                    key={`${cell.position.row}-${cell.position.col}`}
                    number={cell.number}
                    position={cell.position}
                    isRevealed={cell.isRevealed}
                    isClickable={cell.isClickable}
                    isCorrect={cell.isCorrect}
                    isWrong={cell.isWrong}
                    isNext={cell.isNext}
                    onClick={handleCellClick}
                  />
                ))}
              </div>

              {gameState === "playing" && (
                <div className="text-center mt-6">
                  <div className="text-game-accent text-lg font-bold">
                    🎯 Click the numbers in order (1, 2, 3...)
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === "gameOver" && (
            <div className="bg-game-bg/80 backdrop-blur-sm border border-game-accent/30 rounded-xl p-8 text-center space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">
                {stats.currentNumber > stats.totalNumbers
                  ? "Perfect! 🎉"
                  : "Game Over! 😔"}
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
                    {Math.min(stats.currentNumber - 1, stats.totalNumbers)}/
                    {stats.totalNumbers}
                  </div>
                  <div className="text-sm text-game-primary">Completed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {(stats.timeElapsed / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-game-primary">Total Time</div>
                </div>
              </div>

              {stats.score === highScore && stats.score > 0 && (
                <div className="text-2xl font-bold text-game-accent animate-pulse">
                  🏆 New High Score! 🏆
                </div>
              )}

              {/* Show the sequence */}
              <div className="mt-6">
                <div className="text-game-primary text-sm mb-4">
                  The sequence was:
                </div>
                <div style={gridStyle}>
                  {grid.map((cell) => (
                    <MemoryCell
                      key={`${cell.position.row}-${cell.position.col}`}
                      number={cell.number}
                      position={cell.position}
                      isRevealed={true}
                      isClickable={false}
                      isCorrect={cell.isCorrect}
                      isWrong={cell.isWrong}
                      isNext={false}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>

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
          <p>Challenge your memory and reaction time!</p>
        </div>
      </div>
    </div>
  );
};
