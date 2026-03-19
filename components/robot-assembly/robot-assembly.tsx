import type { ReactNode } from "react";

import { clampRobotStage } from "@/lib/robot-assembly-stage";
import { Activation } from "./parts/activation";
import { Antenna } from "./parts/antenna";
import { Armor } from "./parts/armor";
import { Chassis } from "./parts/chassis";
import { ChestPanel } from "./parts/chest-panel";
import { Head } from "./parts/head";
import { Jetpack } from "./parts/jetpack";
import { LeftArm } from "./parts/left-arm";
import { LeftLeg } from "./parts/left-leg";
import { Processor } from "./parts/processor";
import { RightArm } from "./parts/right-arm";
import { RightLeg } from "./parts/right-leg";
import { Workbench } from "./parts/workbench";

type RobotAssemblyProps = {
  stage: number;
  className?: string;
};

function PartLayer({ visible, children }: { visible: boolean; children: ReactNode }) {
  return <g className={`robot-part-layer ${visible ? "is-visible" : ""}`}>{children}</g>;
}

export function RobotAssembly({ stage, className }: RobotAssemblyProps) {
  const safeStage = clampRobotStage(stage);

  return (
    <div className={className}>
      <svg
        viewBox="0 0 400 300"
        role="img"
        aria-label={`Robot assembly stage ${safeStage} of 12`}
        className={`robot-assembly-svg ${safeStage === 12 ? "is-activated" : ""}`}
      >
        <defs>
          <linearGradient id="robot-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171730" />
            <stop offset="100%" stopColor="#0f0f22" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="300" rx="18" fill="url(#robot-bg)" />

        <PartLayer visible={safeStage >= 0}>
          <Workbench />
        </PartLayer>
        <PartLayer visible={safeStage >= 1}>
          <Chassis />
        </PartLayer>
        <PartLayer visible={safeStage >= 2}>
          <Processor />
        </PartLayer>
        <PartLayer visible={safeStage >= 3}>
          <Head />
        </PartLayer>
        <PartLayer visible={safeStage >= 4}>
          <LeftArm />
        </PartLayer>
        <PartLayer visible={safeStage >= 5}>
          <RightArm />
        </PartLayer>
        <PartLayer visible={safeStage >= 6}>
          <ChestPanel />
        </PartLayer>
        <PartLayer visible={safeStage >= 7}>
          <LeftLeg />
        </PartLayer>
        <PartLayer visible={safeStage >= 8}>
          <RightLeg />
        </PartLayer>
        <PartLayer visible={safeStage >= 9}>
          <Antenna />
        </PartLayer>
        <PartLayer visible={safeStage >= 10}>
          <Armor />
        </PartLayer>
        <PartLayer visible={safeStage >= 11}>
          <Jetpack />
        </PartLayer>
        <PartLayer visible={safeStage >= 12}>
          <Activation />
        </PartLayer>
      </svg>
    </div>
  );
}
