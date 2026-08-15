# PQC Maturity Model (PQCMM)

This repository is the versioned, machine-readable source package for the PKI Consortium PQC Maturity Model.

[![Validate model package](https://github.com/pkic/pqcmm/actions/workflows/validate.yml/badge.svg)](https://github.com/pkic/pqcmm/actions/workflows/validate.yml)

## Package contents

- `model/` contains approved normative model releases.
- `profiles/` contains versioned tool behavior that references, but does not rewrite, a model release.
- `schemas/` contains JSON Schemas for models and assessment profiles. Portable assessment packages use the model-neutral schema maintained by the assessment tool.
- `scripts/validate.mjs` validates all current package contracts and stable identifiers.

The model and assessment profile are deliberately separate. Criteria and assessment questions remain immutable within a released model version, while form fields, cross-field subject rules, evidence limits, assurance states, report sections, and registered policy identifiers can advance in a separately versioned profile.

PQCMM requires at least one canonical CPE 2.3 name or package URL (pURL) for inventory correlation. The profile expresses that requirement through a generic `at-least-one` subject rule. Portable assessment credentials expose CPE and pURL as separate named properties; the runtime does not use a PQCMM-specific validation branch.

## Assurance boundary

The browser profile issues self-assessments only and does not apply signatures. It defines qualified third-party and PKI Consortium certification as external workflow states so a browser user cannot self-select them. The assessment does not store a proposed signer. Instead, the profile defines optional approval roles and PDF signature fields, and the external PAdES workflow establishes each actual signer at signing time. The current profile provides optional accountable-executive and security-executive fields and permits additional signatures. Identity, organization binding, role authority, document signature, trusted time, evidence review, assessor qualification, and certification issuance are separate assurance facets, allowing stronger combinations without imposing one credential stack on every user.

The planned PKI Consortium submission service may charge for processing, review, publication, signatures, status services, and long-term storage. That service is intentionally outside this repository and the offline assessment tool.

## Validate

```sh
pnpm install
pnpm run validate
```

## Releases

Released model files are immutable. Substantive changes require a new semantic model version while assessment behavior can advance independently through a new profile version. Tags use `v<model-version>`, and the release workflow publishes `.tar.gz` and `.zip` archives with SHA-256 checksums.

The PKI Consortium website and assessment tooling should consume a pinned release or commit rather than an unversioned copy from the default branch.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring and versioning workflow. This repository is available under the [MIT License](LICENSE), and contributions are subject to the PKI Consortium [Intellectual Property Rights Agreement](https://pkic.org/ipr/).
