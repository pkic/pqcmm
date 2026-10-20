import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.some((arg) => !["--check", "--stage"].includes(arg))) {
  throw new Error("Usage: release-snapshot.mjs [--check] [--stage]");
}
const check = args.includes("--check");
const stage = args.includes("--stage");
if (stage && !check) throw new Error("Staging requires --check.");
const model = YAML.parse(await readFile(join(root, "model/pqcmm-model.yaml"), "utf8"));
const profile = YAML.parse(await readFile(join(root, "profiles/pqcmm-self-assessment-profile.yaml"), "utf8"));
const versions = [model.model.version, profile.profile.version, model.schemaVersion, profile.schemaVersion];
for (const version of versions) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid release version: ${version}`);
}
if (stage && process.env.RELEASE_TAG !== `v${model.model.version}`) {
  throw new Error("Release tag must match the working model version.");
}
const sources = [
  ["model/pqcmm-model", ".yaml"],
  ["profiles/pqcmm-self-assessment-profile", ".yaml"],
  ["schemas/pqcmm-model.schema", ".json"],
  ["schemas/assessment-profile.schema", ".json"],
];
// Check the entire set before creating any snapshots.
const snapshots = await Promise.all(sources.map(async ([base, ext], index) => {
  const source = await readFile(join(root, `${base}${ext}`));
  const path = `${base}-${versions[index]}${ext}`;
  let existing;
  try { existing = await readFile(join(root, path)); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (existing && !existing.equals(source)) throw new Error(`Snapshot differs: ${path}. Advance the contract version; existing snapshots cannot be overwritten.`);
  if (!existing && check) throw new Error(`Missing snapshot: ${path}`);
  return { path, source, existing };
}));
for (const { path, source, existing } of snapshots) {
  if (!existing) await writeFile(join(root, path), source, { flag: "wx" });
}
if (stage) {
  const dist = join(root, "dist");
  const archive = join(dist, `pqcmm-${process.env.RELEASE_TAG}`);
  await mkdir(archive, { recursive: true });
  for (const { path } of snapshots) {
    await mkdir(join(archive, dirname(path)), { recursive: true });
    await copyFile(join(root, path), join(archive, path));
    await copyFile(join(root, path), join(dist, path.split("/").at(-1)));
  }
  for (const path of ["README.md", "CONTRIBUTING.md", "LICENSE"]) {
    await copyFile(join(root, path), join(archive, path));
  }
}
console.log(`${check ? "Verified" : "Prepared"} ${snapshots.length} release snapshots for PQCMM ${model.model.version}.`);
