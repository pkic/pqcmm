import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { stdout } from "node:process";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relativePath) =>
  JSON.parse(await readFile(join(root, relativePath), "utf8"));
const readYaml = async (relativePath) =>
  YAML.parse(await readFile(join(root, relativePath), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const model = await readYaml("model/pqcmm-model-1.0.1.yaml");
const profile = await readYaml(
  "profiles/pqcmm-self-assessment-profile-1.0.0.yaml",
);
const modelSchema = await readJson("schemas/pqcmm-model.schema-1.0.0.json");
const profileSchema = await readJson(
  "schemas/assessment-profile.schema-1.0.0.json",
);

const validate = (schema, value, label) => {
  const validator = ajv.compile(schema);
  if (!validator(value)) {
    throw new Error(
      `${label} is invalid:\n${ajv.errorsText(validator.errors)}`,
    );
  }
};

validate(modelSchema, model, "PQCMM model");
validate(profileSchema, profile, "PQCMM assessment profile");

const subjectFields = new Map(
  profile.runtime.subjectFields.map((field) => [field.key, field]),
);
const solutionIdentityRule = profile.runtime.subjectRules?.find(
  (rule) =>
    rule.kind === "at-least-one" &&
    rule.fields.includes("cpe") &&
    rule.fields.includes("purl"),
);
if (
  !solutionIdentityRule ||
  subjectFields.get("cpe")?.format !== "cpe-2.3" ||
  subjectFields.get("purl")?.format !== "package-url"
) {
  throw new Error(
    "PQCMM must require at least one separately typed CPE 2.3 or pURL identifier.",
  );
}

if (
  profile.profile.model.id !== model.model.id ||
  profile.profile.model.version !== model.model.version
) {
  throw new Error(
    "Assessment profile model reference does not match the model release.",
  );
}

const ids = model.levels.flatMap((level) => [
  ...level.criteria.items.map((item) => item.id),
  ...level.assessment.groups.flatMap((group) =>
    group.questions.map((question) => question.id),
  ),
  ...level.evidenceChecklist.items.map((item) => item.id),
]);
if (new Set(ids).size !== ids.length) {
  throw new Error(
    "Criterion, question, and evidence identifiers must be unique.",
  );
}

const browserAssurance = profile.assurance.profiles.filter(
  (item) => item.availability === "browser",
);
if (
  browserAssurance.length !== 1 ||
  browserAssurance[0].id !== "self" ||
  browserAssurance[0].independentVerification ||
  browserAssurance[0].certification
) {
  throw new Error(
    "The browser profile must expose only unverified self-assessment.",
  );
}

stdout.write(
  `Validated PQCMM ${model.model.version}: ${model.levels.length} levels, ${ids.length} stable identifiers, profile ${profile.profile.version}.\n`,
);
