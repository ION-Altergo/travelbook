# Feature Spec Guidelines
Path: /docs/feature-spec-guidelines.md

Each feature has a "feature spec" document that describes the current implementation (status quo).
This is not a roadmap, changelog, or decision history.

Every feature must live under a dedicated docs folder:
  /docs/features/<feature-name>/spec.md

At the top of every feature spec, include:
Refer to /docs/feature-spec-guidelines.md for maintenance rules.

## Required sections (keep short and skimmable)

1) Overview
- What the feature does (1 to 3 lines)
- Scope: in / out

2) Architecture (start here)
- Entrypoints: 2 to 5 items as `path/to/file.ts > symbolName()`
- Invariants: things that must always hold
- Stable contracts: APIs, DB schema, external interfaces that must not break
- File map: key folders/files only
- Main flow: 3 to 6 steps (request/job flow)
- Key components: responsibilities, 1 line each

3) Interfaces
- API surface: endpoints, events, CLI, or public functions
- For each: inputs, outputs, auth, error behavior
- Mark each as: Stable (do not break) or Internal (refactorable)

4) Data and state
- Primary models and storage (tables, collections, buckets)
- Important fields and constraints
- State lifecycle: where created, updated, read

5) Edge cases and limits
- Important special cases handled today
- Current limitations (no future plans)

6) Tests
- Where tests live
- Key scenarios covered (bullets only)

7) Last verified
- Date + author
- What was checked (brief)

## Writing rules
- Do not paste code. Reference code as `path/to/file.ts > symbolName()`
- Prefer bullets over paragraphs.
- If spec and code disagree, update the spec to match the code (or fix the code).
- Update the spec in the same PR when changes affect architecture, interfaces, or data.

## Scaling and splitting (when needed)
Keep `/docs/features/<feature-name>/spec.md` as the canonical entrypoint.
If the spec becomes hard to scan, split into sub-specs within the same folder.

Rules:
- `spec.md` becomes an index spec that stays small and links to sub-specs.
- Put cross-cutting invariants and stable contracts in `spec.md`.
- Sub-specs follow the same required sections, but scoped to that slice.
- Avoid duplication. Prefer references between docs.

## Layout examples

Simple feature (single spec):
  /docs/features/<feature-name>/
    spec.md

Complex feature (split specs):
  /docs/features/<feature-name>/
    spec.md
    api.spec.md
    ingestion.spec.md
    storage.spec.md
    analysis.spec.md
