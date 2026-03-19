import test from 'node:test';
import assert from 'node:assert/strict';

import { clampRobotStage, getRobotAssemblyPartKeys } from '../lib/robot-assembly-stage.js';

test('clampRobotStage constrains values to the 0-12 range', () => {
  assert.equal(clampRobotStage(-3), 0);
  assert.equal(clampRobotStage(13), 12);
  assert.equal(clampRobotStage(7.8), 7);
  assert.equal(clampRobotStage(Number.NaN), 0);
});

test('getRobotAssemblyPartKeys returns additive part keys for each stage', () => {
  assert.deepEqual(getRobotAssemblyPartKeys(0), ['workbench']);
  assert.deepEqual(getRobotAssemblyPartKeys(2), ['workbench', 'chassis', 'processor']);
  assert.deepEqual(getRobotAssemblyPartKeys(12).at(-1), 'activation');
  assert.equal(getRobotAssemblyPartKeys(12).length, 13);
});
