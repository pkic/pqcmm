import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const file = 'model/pqcmm-model.yaml';
const clone = (value) => JSON.parse(JSON.stringify(value));

/** Preserve every model property while identifying review units by stable, typed identifiers. */
function reviewItems(model) {
  if (!Array.isArray(model.levels)) throw new Error('The model must contain levels');
  const entries = new Map();
  const add = (key, title, value) => {
    if (entries.has(key)) throw new Error(`Duplicate review identity: ${key}`);
    entries.set(key, { title, value });
  };
  const root = clone(model);
  delete root.levels;
  root.levelOrder = model.levels.map((level) => level.number);
  add('model', 'Model metadata and policy', root);
  for (const level of model.levels) {
    const header = clone(level);
    const criteria = header.criteria?.items ?? [];
    const groups = header.assessment?.groups ?? [];
    const evidence = Array.isArray(header.evidence) ? header.evidence : header.evidence?.items;
    if (header.criteria) header.criteria.items = criteria.map((item) => item.id);
    if (header.assessment) header.assessment.groups = groups.map((group) => group.id);
    if (Array.isArray(evidence)) {
      if (Array.isArray(header.evidence)) header.evidence = evidence.map((item) => item.id);
      else header.evidence.items = evidence.map((item) => item.id);
      for (const item of evidence) add(`evidence:${item.id}`, `Evidence ${item.id}`, { level: level.number, ...item });
    }
    add(`level:${level.number}`, `Level ${level.number}`, header);
    for (const item of level.criteria?.items ?? []) add(`criterion:${item.id}`, `Criterion ${item.id}`, { level: level.number, ...item });
    for (const group of level.assessment?.groups ?? []) {
      add(`group:${group.id}`, `Assessment group ${group.id}`, { level: level.number, ...group, questions: group.questions.map((question) => question.id) });
      for (const question of group.questions) add(`question:${question.id}`, `Question ${question.id}`, { level: level.number, group: group.id, ...question });
    }
  }
  return entries;
}

function changedFields(before, after, path = '') {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().flatMap((key) => changedFields(before[key], after[key], path ? `${path}.${key}` : key));
  }
  return [{ path: path || 'item', before, after }];
}

function quoted(value) {
  if (value === undefined) return '> _(not present)_';
  const text = typeof value === 'string' ? value : YAML.stringify(value).trimEnd();
  return (text || '(empty)').split('\n').map((line) => `> ${line}`).join('\n');
}

/** Compare structure and wording; intentionally make no claim about approval or semantic-version impact. */
export function modelChangeSummary(before, after) {
  const oldItems = reviewItems(before);
  const newItems = reviewItems(after);
  const changes = [...new Set([...oldItems.keys(), ...newItems.keys()])].flatMap((key) => {
    const previous = oldItems.get(key);
    const current = newItems.get(key);
    const fields = changedFields(previous?.value, current?.value);
    return fields.length ? [{ title: current?.title ?? previous.title, status: !previous ? 'Added' : !current ? 'Removed' : 'Changed', fields }] : [];
  });
  const lines = ['## Model change review', '', `Compared model versions: ${before.model?.version ?? 'unspecified'} → ${after.model?.version ?? 'unspecified'}.`, '', 'Structural changes and exact wording below are proposals for review, not approval or a semantic-version classification.', ''];
  if (!changes.length) return [...lines, 'No model changes.', ''].join('\n');
  lines.push('| Review item | Change |', '| --- | --- |', ...changes.map(({ title, status }) => `| ${title.replaceAll('|', '\\|')} | ${status} |`), '');
  for (const change of changes) {
    lines.push(`### ${change.title} — ${change.status}`, '');
    for (const field of change.fields) lines.push(`**${field.path}**`, '', 'Before:', quoted(field.before), '', 'After:', quoted(field.after), '');
  }
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const options = { head: 'HEAD' };
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, '');
    if (!['base', 'head', 'output'].includes(key) || !args[index + 1]) throw new Error('Usage: pnpm review:changes --base <ref> [--head <ref>] [--output <path>]');
    options[key] = args[index + 1];
  }
  if (!options.base) throw new Error('A base reference is required');
  const read = (ref) => {
    if (ref.startsWith('-') || /[\r\n\0]/.test(ref)) throw new Error('Invalid git reference');
    return YAML.parse(execFileSync('git', ['cat-file', 'blob', `${ref}:${file}`], { encoding: 'utf8' }));
  };
  const summary = modelChangeSummary(read(options.base), read(options.head));
  if (options.output) await writeFile(options.output, summary);
  else process.stdout.write(summary);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
