"use client";

import { useEffect, useState } from "react";
import { RobotAssembly } from "./robot-assembly";

type RobotAssemblyAnimatedProps = {
  className?: string;
};

export function RobotAssemblyAnimated({ className }: RobotAssemblyAnimatedProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev >= 12) {
          // Pause at fully assembled for a beat, then restart
          return 0;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      <RobotAssembly stage={stage} className="w-full" />
    </div>
  );
}
