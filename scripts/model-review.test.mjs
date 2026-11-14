import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import { modelChangeSummary } from './model-review.mjs';

const fixture = () => ({ model: { version: '1.0.1' }, scoring: { method: 'cumulative' }, levels: [{ number: 1, criteria: { items: [{ id: '1.1.1', text: 'Original criterion', assessmentQuestionIds: ['1.2.1'] }] }, assessment: { methodology: 'Review evidence', groups: [{ id: '1.2', name: 'Availability', questions: [{ id: '1.2.1', question: 'Original question', response: { fields: [{ key: 'available', type: 'boolean', required: true }] } }] }] }, evidenceChecklist: { items: [{ id: '1.e.1', text: 'Original evidence' }] } }] });

test('reports criterion wording, response requirements, evidence and policy without dropping supporting content', () => {
  const before = fixture(); const after = fixture();
  after.levels[0].criteria.items[0].text = 'Replacement criterion';
  after.levels[0].assessment.groups[0].questions[0].response.fields[0].required = false;
  after.levels[0].evidenceChecklist.items[0].text = 'Updated evidence';
  after.scoring.method = 'changed';
  const report = modelChangeSummary(before, after);
  for (const expected of ['Criterion 1.1.1', '> Original criterion', '> Replacement criterion', 'Question 1.2.1', 'required: false', 'Evidence 1.e.1', '> Updated evidence', 'scoring.method']) assert.ok(report.includes(expected), expected);
});
test('reports additions, removals and ordering changes without confusing criterion and question identities', () => {
  const before = fixture(); const after = fixture();
  after.levels[0].criteria.items = [];
  after.levels[0].assessment.groups[0].questions.push({ id: '1.2.2', question: 'Another question' });
  after.levels[0].assessment.groups[0].questions.reverse();
  const report = modelChangeSummary(before, after);
  assert.match(report, /Criterion 1\.1\.1 — Removed/);
  assert.match(report, /Question 1\.2\.2 — Added/);
  assert.match(report, /Assessment group 1\.2 — Changed/);
});
test('unchanged content has no model changes and duplicate typed identities are rejected', () => {
  assert.match(modelChangeSummary(fixture(), fixture()), /No model changes/);
  const duplicate = fixture(); duplicate.levels[0].criteria.items.push(duplicate.levels[0].criteria.items[0]);
  assert.throws(() => modelChangeSummary(fixture(), duplicate), /Duplicate review identity/);
});

test('real model checklist entries appear under their stable evidence identifiers', () => {
  const model = YAML.parse(readFileSync(new URL('../model/pqcmm-model.yaml', import.meta.url), 'utf8'));
  const after = structuredClone(model);
  const level = after.levels.find((entry) => entry.evidenceChecklist.items.length);
  const item = level.evidenceChecklist.items[0];
  item.text += ' Clarified evidence.';
  const report = modelChangeSummary(model, after);
  assert.ok(report.includes(`Evidence ${item.id} — Changed`));
  assert.ok(report.includes('Clarified evidence.'));
});
