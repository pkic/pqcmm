import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const model = YAML.parse(await readFile(join(root, "model/pqcmm-model.yaml"), "utf8"));
const profile = YAML.parse(await readFile(join(root, "profiles/pqcmm-self-assessment-profile.yaml"), "utf8"));
const versions = [model.model.version, profile.profile.version, model.schemaVersion, profile.schemaVersion];
for (const version of versions) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid release version: ${version}`);
}
if (process.env.RELEASE_TAG !== `v${model.model.version}`) {
  throw new Error("Release tag must match the working model version.");
}
const sources = [
  ["model/pqcmm-model", ".yaml"],
  ["profiles/pqcmm-self-assessment-profile", ".yaml"],
  ["schemas/pqcmm-model.schema", ".json"],
  ["schemas/assessment-profile.schema", ".json"],
];
// Check historical snapshots before generating assets outside the source tree.
const snapshots = await Promise.all(sources.map(async ([base, ext], index) => {
  const source = await readFile(join(root, `${base}${ext}`));
  const path = `${base}-${versions[index]}${ext}`;
  let existing;
  try { existing = await readFile(join(root, path)); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (existing && !existing.equals(source)) throw new Error(`Snapshot differs: ${path}. Advance the contract version; existing snapshots cannot be overwritten.`);
  return { path, source };
}));
const dist = join(root, "dist");
const archive = join(dist, `pqcmm-${process.env.RELEASE_TAG}`);
await mkdir(archive, { recursive: true });
for (const { path, source } of snapshots) {
  await mkdir(join(archive, dirname(path)), { recursive: true });
  await writeFile(join(archive, path), source);
  await writeFile(join(dist, path.split("/").at(-1)), source);
}
for (const path of ["README.md", "CONTRIBUTING.md", "LICENSE"]) {
  await copyFile(join(root, path), join(archive, path));
}
console.log(`Generated ${snapshots.length} versioned release assets for PQCMM ${model.model.version}.`);
