import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, symlink, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
test("automatic release assets and immutable historical snapshots", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "pqcmm-snapshot-"));
  try {
    const paths = ["scripts/release-snapshot.mjs", "model/pqcmm-model.yaml", "profiles/pqcmm-self-assessment-profile.yaml", "schemas/pqcmm-model.schema.json", "schemas/assessment-profile.schema.json", "README.md", "CONTRIBUTING.md", "LICENSE"];
    for (const path of paths) {
      await mkdir(join(fixture, dirname(path)), { recursive: true });
      await copyFile(join(root, path), join(fixture, path));
    }
    await symlink(join(root, "node_modules"), join(fixture, "node_modules"), "dir");
    const run = (...args) => spawnSync(process.execPath, [join(fixture, "scripts/release-snapshot.mjs"), ...args], { encoding: "utf8", env: { ...process.env, RELEASE_TAG: "v0.0.0" } });
    const result = run();
    assert.notEqual(result.status, 0, "reject mismatched release tag");
    assert.match(result.stderr, /Release tag must match/);
    const modelPath = join(fixture, "model/pqcmm-model.yaml");
    const original = await readFile(modelPath, "utf8");
    const version = original.match(/\n  version: ([\d.]+)/)[1];
    const staged = spawnSync(process.execPath, [join(fixture, "scripts/release-snapshot.mjs")], { encoding: "utf8", env: { ...process.env, RELEASE_TAG: `v${version}` } });
    assert.equal(staged.status, 0, staged.stderr);
    const snapshotPath = join(fixture, `model/pqcmm-model-${version}.yaml`);
    await assert.rejects(readFile(snapshotPath), { code: "ENOENT" });
    assert.equal(await readFile(join(fixture, `dist/pqcmm-model-${version}.yaml`), "utf8"), original);
    assert.equal(await readFile(join(fixture, `dist/pqcmm-v${version}/model/pqcmm-model-${version}.yaml`), "utf8"), original);
    await writeFile(snapshotPath, original);
    const generate = () => spawnSync(process.execPath, [join(fixture, "scripts/release-snapshot.mjs")], { encoding: "utf8", env: { ...process.env, RELEASE_TAG: `v${version}` } });
    assert.equal(generate().status, 0, "matching historical snapshots are accepted");
    await writeFile(modelPath, `${original}\n# Changed draft\n`);
    assert.notEqual(generate().status, 0, "reject reuse of a historical version");
    assert.equal(await readFile(snapshotPath, "utf8"), original, "historical snapshot remains intact");
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
