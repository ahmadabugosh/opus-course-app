import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('robot-assembly includes all stage part components through activation', () => {
  const source = read('components/robot-assembly/robot-assembly.tsx');

  const imports = [
    'LeftArm',
    'RightArm',
    'ChestPanel',
    'LeftLeg',
    'RightLeg',
    'Antenna',
    'Armor',
    'Jetpack',
    'Activation',
  ];

  for (const imported of imports) {
    assert.match(source, new RegExp(`\\b${imported}\\b`));
  }

  const stageChecks = [
    'safeStage >= 4',
    'safeStage >= 5',
    'safeStage >= 6',
    'safeStage >= 7',
    'safeStage >= 8',
    'safeStage >= 9',
    'safeStage >= 10',
    'safeStage >= 11',
    'safeStage >= 12',
  ];

  for (const check of stageChecks) {
    assert.match(source, new RegExp(check.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
  }
});

test('globals.css defines stage 12 activation animations', () => {
  const css = read('app/globals.css');

  const requiredSelectors = [
    '.robot-assembly-svg.is-activated',
    '.robot-eyes-activated',
    '.robot-flame-flicker',
    '.robot-particle-burst',
  ];

  const requiredKeyframes = [
    '@keyframes robotHover',
    '@keyframes robotEyePulse',
    '@keyframes robotFlameFlicker',
    '@keyframes robotParticleBurst',
  ];

  for (const selector of requiredSelectors) {
    assert.match(css, new RegExp(selector.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
  }

  for (const keyframe of requiredKeyframes) {
    assert.match(css, new RegExp(keyframe.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
  }
});
