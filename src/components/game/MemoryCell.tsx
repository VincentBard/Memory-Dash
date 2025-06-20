import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MemoryCellProps {
  number: number;
  position: { row: number; col: number };
  isRevealed: boolean;
  isClickable: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isNext?: boolean;
  onClick: (number: number) => void;
}

export const MemoryCell = ({
  number,
  position,
  isRevealed,
  isClickable,
  isCorrect = false,
  isWrong = false,
  isNext = false,
  onClick,
}: MemoryCellProps) => {
  const [clickState, setClickState] = useState<"none" | "correct" | "wrong">(
    "none",
  );

  useEffect(() => {
    if (isCorrect && clickState === "none") {
      setClickState("correct");
    } else if (isWrong && clickState === "none") {
      setClickState("wrong");
    }
  }, [isCorrect, isWrong, clickState]);

  const handleClick = () => {
    if (isClickable && clickState === "none") {
      onClick(number);
    }
  };

  return (
    <div
      className={cn(
        "aspect-square rounded-lg border-2 transition-all duration-300 cursor-pointer select-none flex items-center justify-center text-2xl font-bold",
        "hover:scale-105 active:scale-95",
        {
          // Default state - hidden numbers
          "bg-game-bg/40 border-game-accent/40 text-transparent hover:bg-game-bg/60":
            !isRevealed && clickState === "none",

          // Revealed state - showing numbers
          "bg-game-primary/20 border-game-primary text-white":
            isRevealed && clickState === "none",

          // Correct click
          "bg-game-success/30 border-game-success text-white animate-target-hit":
            clickState === "correct",

          // Wrong click
          "bg-game-danger/30 border-game-danger text-white animate-target-hit":
            clickState === "wrong",

          // Not clickable
          "cursor-not-allowed opacity-50": !isClickable,
        },
      )}
      onClick={handleClick}
      style={{
        gridColumn: position.col + 1,
        gridRow: position.row + 1,
      }}
    >
      <span
        className={cn("transition-all duration-200", {
          "text-3xl": isRevealed || clickState !== "none",
          "text-transparent": !isRevealed && clickState === "none",
        })}
      >
        {number}
      </span>
    </div>
  );
};
