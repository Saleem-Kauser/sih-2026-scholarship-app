import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuickPromptsForRole } from '../../src/utils/jagoQuickPrompts.ts';

test('student quick prompts stay student-focused', () => {
  const prompts = getQuickPromptsForRole('student', 'en');

  assert.ok(prompts.includes('What is my application status?'));
  assert.ok(prompts.includes('What documents do I need?'));
  assert.ok(prompts.includes('What should I do next?'));
  assert.equal(prompts.length, 4);
});

test('admin quick prompts are ministry-focused', () => {
  const prompts = getQuickPromptsForRole('admin', 'en');

  assert.ok(prompts.includes('How many potential unreached students are there?'));
  assert.ok(prompts.includes('How many records require review?'));
  assert.ok(prompts.includes('Show scholarship coverage summary.'));
  assert.ok(prompts.includes('How many applications are being processed?'));
  assert.equal(prompts.length, 4);
});
