# Anatomy 3D · v10.9 schematic refresh

v10.9 keeps the v10.1 study workflow that the project was built around:
a left structure selector, a large central interactive 3D viewer, and a right
reference/progress panel. The UI is polished rather than replaced.

## 3D direction

The BodyParts3D C1/C2/L3 pilot has been removed at the owner's request.
The vertebral atlas now uses one consistent schematic 3D system for every level
(C1–C7, T1–T12, L1–L5, sacrum and coccyx).

The schematic renderer supports:

- orbit / zoom and standard anatomical camera views
- structure picking
- selected-structure highlighting
- context transparency and isolate mode
- per-part separation
- neighboring vertebrae, intervertebral discs and joint guides
- illustrative C1–C2 rotation
- WebGL with Canvas fallback

The geometry is a teaching schematic, not a CT/photogrammetry mesh. Text-source
verification and 3D-form accuracy are tracked separately.

## Curriculum expansion

The v10.2–v10.8 curriculum workspace remains integrated and uses the same visual
language as the v10.1 vertebra atlas. It contains 9 study modules / 278 records,
Georgian/Latin search, learned progress, quizzes, comparison and JSON
backup/import.

Seven user-provided schematic 3D labs remain available for:

- v10.2 General Arthrology
- v10.3 Vertebral Connections
- v10.4 Thoracic Connections
- v10.5 Upper-limb Girdle Connections
- v10.6 Free Upper-limb Connections
- v10.7 Pelvis Connections
- v10.8 Free Lower-limb Connections

These procedural labs are learning visualizations and are not described as
anatomically reviewed scan meshes.

## Sources

Primary anatomy source where available:
**კაციტაძე — „ადამიანის ანატომია“, I ტომი (2017)**.

The uploaded AK notes are the second required course source. Source-review
status is shown separately from 3D visualization status.

## Development

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec playwright install chromium
pnpm test:browser
pnpm build
```

The v10.9 work should be preview-tested before merging to production.
