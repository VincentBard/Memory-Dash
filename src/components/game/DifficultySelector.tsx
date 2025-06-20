import { cn } from "@/lib/utils";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultyConfig {
  name: string;
  description: string;
  targetDuration: number;
  spawnRate: number;
  targetSize: number;
  maxConcurrentTargets: number;
  color: string;
  icon: string;
}

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: "Easy",
    description: "Large targets, slow pace",
    targetDuration: 2500,
    spawnRate: 1500,
    targetSize: 80,
    maxConcurrentTargets: 2,
    color: "green",
    icon: "🟢",
  },
  medium: {
    name: "Medium",
    description: "Medium targets, moderate pace",
    targetDuration: 1800,
    spawnRate: 1200,
    targetSize: 60,
    maxConcurrentTargets: 3,
    color: "yellow",
    icon: "🟡",
  },
  hard: {
    name: "Hard",
    description: "Small targets, fast pace",
    targetDuration: 1200,
    spawnRate: 800,
    targetSize: 45,
    maxConcurrentTargets: 4,
    color: "red",
    icon: "🔴",
  },
};

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export const DifficultySelector = ({
  selectedDifficulty,
  onSelect,
  disabled = false,
}: DifficultySelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center text-white">
        Choose Difficulty
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          Object.entries(difficultyConfigs) as [Difficulty, DifficultyConfig][]
        ).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={cn(
              "p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105",
              "bg-gradient-to-br backdrop-blur-sm",
              {
                "border-green-400 bg-green-500/20 text-green-100":
                  config.color === "green" && selectedDifficulty === key,
                "border-green-400/30 bg-green-500/10 text-green-200 hover:border-green-400/60":
                  config.color === "green" && selectedDifficulty !== key,

                "border-yellow-400 bg-yellow-500/20 text-yellow-100":
                  config.color === "yellow" && selectedDifficulty === key,
                "border-yellow-400/30 bg-yellow-500/10 text-yellow-200 hover:border-yellow-400/60":
                  config.color === "yellow" && selectedDifficulty !== key,

                "border-red-400 bg-red-500/20 text-red-100":
                  config.color === "red" && selectedDifficulty === key,
                "border-red-400/30 bg-red-500/10 text-red-200 hover:border-red-400/60":
                  config.color === "red" && selectedDifficulty !== key,

                "opacity-50 cursor-not-allowed": disabled,
                "animate-pulse-glow": selectedDifficulty === key && !disabled,
              },
            )}
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">{config.icon}</div>
              <div className="font-bold text-lg">{config.name}</div>
              <div className="text-sm opacity-80">{config.description}</div>

              <div className="text-xs space-y-1 mt-4 pt-3 border-t border-current/20">
                <div>Target size: {config.targetSize}px</div>
                <div>Speed: {config.spawnRate}ms</div>
                <div>Max targets: {config.maxConcurrentTargets}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
