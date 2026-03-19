export const ROBOT_PART_KEYS = [
  "workbench",
  "chassis",
  "processor",
  "head",
  "left-arm",
  "right-arm",
  "chest-panel",
  "left-leg",
  "right-leg",
  "antenna",
  "armor",
  "jetpack",
  "activation",
];

export function clampRobotStage(stage) {
  if (!Number.isFinite(stage)) return 0;
  return Math.max(0, Math.min(12, Math.floor(stage)));
}

export function getRobotAssemblyPartKeys(stage) {
  const safeStage = clampRobotStage(stage);
  return ROBOT_PART_KEYS.slice(0, safeStage + 1);
}
