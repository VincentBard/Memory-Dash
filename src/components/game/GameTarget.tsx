import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GameTargetProps {
  id: string;
  position: { x: number; y: number };
  onHit: (id: string, reactionTime: number) => void;
  onMiss: (id: string) => void;
  size: number;
  duration: number;
  isHit?: boolean;
}

export const GameTarget = ({
  id,
  position,
  onHit,
  onMiss,
  size,
  duration,
  isHit = false,
}: GameTargetProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [startTime] = useState(Date.now());
  const [hitState, setHitState] = useState<"none" | "hit" | "miss">("none");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hitState === "none") {
        setHitState("miss");
        onMiss(id);
        setTimeout(() => setIsVisible(false), 200);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onMiss, hitState]);

  useEffect(() => {
    if (isHit && hitState === "none") {
      const reactionTime = Date.now() - startTime;
      setHitState("hit");
      onHit(id, reactionTime);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isHit, hitState, id, onHit, startTime]);

  const handleClick = () => {
    if (hitState === "none") {
      const reactionTime = Date.now() - startTime;
      setHitState("hit");
      onHit(id, reactionTime);
      setTimeout(() => setIsVisible(false), 200);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="absolute cursor-pointer select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={handleClick}
    >
      <div
        className={cn(
          "w-full h-full rounded-full border-4 flex items-center justify-center font-bold text-white transition-all duration-200",
          {
            "bg-game-target border-orange-400 animate-target-appear hover:scale-110":
              hitState === "none",
            "bg-game-success border-green-400 animate-target-hit":
              hitState === "hit",
            "bg-game-danger border-red-400 animate-target-hit":
              hitState === "miss",
          },
        )}
        style={{
          boxShadow:
            hitState === "none" ? "0 0 20px hsl(var(--game-target))" : "none",
        }}
      >
        <div className="text-2xl">🐵</div>
      </div>
    </div>
  );
};
