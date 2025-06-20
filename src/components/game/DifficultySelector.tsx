import { cn } from "@/lib/utils";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

interface DifficultyConfig {
  name: string;
  description: string;
  sequenceLength: number;
  gridSize: number;
  showTime: number; // milliseconds to show sequence
  color: string;
  icon: string;
}

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: "Easy",
    description: "4 numbers, small grid",
    sequenceLength: 4,
    gridSize: 3, // 3x3 grid
    showTime: 3000,
    color: "green",
    icon: "🟢",
  },
  medium: {
    name: "Medium",
    description: "8 numbers, medium grid",
    sequenceLength: 8,
    gridSize: 4, // 4x4 grid
    showTime: 4000,
    color: "yellow",
    icon: "🟡",
  },
  hard: {
    name: "Hard",
    description: "12 numbers, large grid",
    sequenceLength: 12,
    gridSize: 5, // 5x5 grid
    showTime: 5000,
    color: "orange",
    icon: "🟠",
  },
  expert: {
    name: "Expert",
    description: "20 numbers, huge grid",
    sequenceLength: 20,
    gridSize: 6, // 6x6 grid
    showTime: 6000,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                "border-orange-400 bg-orange-500/20 text-orange-100":
                  config.color === "orange" && selectedDifficulty === key,
                "border-orange-400/30 bg-orange-500/10 text-orange-200 hover:border-orange-400/60":
                  config.color === "orange" && selectedDifficulty !== key,

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
                <div>Sequence: {config.sequenceLength} numbers</div>
                <div>
                  Grid: {config.gridSize}×{config.gridSize}
                </div>
                <div>Show time: {config.showTime / 1000}s</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
