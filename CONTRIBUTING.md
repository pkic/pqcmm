# Contributing to PQCMM

PQCMM is maintained by the PKI Consortium Post-Quantum Cryptography Working Group. Contributions from members and non-members are welcome and are subject to the PKI Consortium [Intellectual Property Rights Agreement](https://pkic.org/ipr/).

## Proposing changes

1. Open an issue describing the intended model, profile, or schema change.
2. Keep normative model changes separate from assessment-tool behavior changes whenever possible.
3. Edit the stable working files documented in README.md. Advance the relevant internal versions for changes to released contracts; preserve every released snapshot. Create versioned copies only when preparing an approved release with `pnpm run release:snapshot`.
4. Preserve existing stable identifiers and introduce new kebab-case identifiers for new concepts.
5. Run `pnpm install --frozen-lockfile` and `pnpm run validate`.
6. Open a pull request explaining compatibility and versioning impact.

## Repository contracts

- `model/` contains the stable working model and immutable versioned release snapshots.
- `profiles/` contains the stable working assessment profile and immutable versioned snapshots referencing a specific model version.
- `schemas/` contains the JSON Schemas for those contracts.
- `scripts/validate.mjs` validates schemas and cross-file invariants.

The website and assessment tooling consume pinned releases of these files. A pull request must not silently change the meaning of an existing release.
