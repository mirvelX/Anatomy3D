# Anatomy 3D v10.0 development plan

Status: first development preview, 10.0.0-alpha.1. Base: `main` at `96b7ee2b7ed179bb688adf92cce25d7cd505766d` (v9.0).
Branch: `codex/v10-anatomy-foundation`. Keep the PR in draft; no merge or production deployment without the owner's final approval.

## Audit of v9

- Vanilla ES modules with a custom WebGL renderer and Canvas fallback; no model loader or external mesh assets.
- `scene.js` builds ellipsoids, tubes and plates. C3–C6, T1–T9 and L1–L4 mostly reuse regional dimensions. These are schematic illustrations, not individually validated vertebrae.
- Neighbor centers use approximate vertical spacing. Facet surfaces are largely horizontal, and C1/C2 facets do not consistently align. L5/S1 needs sacral superior articular structures. Separation and C1 rotation are explanatory animations, not biomechanics.
- T10's generated costal surface is absent from the list. T1–T9 use one rule, which needs reconciliation with atypical T1 anatomy before being called validated.
- Some sacral meshes label much of the bone as its base or ala; front and back foramina are not separately modeled. Do not use these as precise anatomical boundaries.
- Selection uses fixed-opacity fading; no true isolation or individual-part separation. Space guides need to remain visible when highlighted. Picking must match what is visible.
- Existing learning marks, cumulative quiz scores, backup validation and v7/v8 migration are useful foundations. v9 has 11 passing Node tests before changes.

## Source policy

Katsitadze, _Human Anatomy_, volume I (2017), is the primary source. Use a page/figure reference for every newly reviewed structure. Supplemental medical sources fill omissions; they never silently overwrite the book. Record disagreements and anatomical variants explicitly. Content review and mesh review are separate statuses.

The downloaded scan has a one-page offset: printed page 29 is PDF page 30. Inspect page images, since this PDF has no extractable text. Do not publish the PDF or its scans in this repository.

## Milestones and acceptance criteria

1. **Source-linked foundation (this PR):** book references and level-specific study notes; schematic C6 carotid tubercle, dens articular surfaces and lumbar accessory processes; adjustable fading, true isolation and selected-part separation in WebGL and Canvas; unlearned practice without immediate cycle repeats; v10 storage migration retaining v9 data; automated and visual preview checks. Keep an explicit schematic model notice.
2. **Detailed model pilot:** evaluate original BodyParts3D data and university photogrammetry, record the exact asset/version/author/license, preserve source coordinates, and prototype C1/C2 plus one typical vertebra per region. Segment the surfaces manually into stable structure IDs; validate against the book from anterior, posterior, superior, inferior and lateral views. No guessed automatic segmentation or AI-generated anatomy passed off as verified. Keep simplified fallback available.
3. **All-level morphology:** C1–C7, T1–T12, L1–L5, sacrum and coccyx; review exceptional levels C6, C7, T1, T10–T12, L5/S1. Add missing sacral/coccygeal structures. Store review notes, anatomy variants, coordinate units and model provenance. Shared regional descriptions must not imply unique measured geometry for every level.
4. **Articulation:** define attachment landmarks and facet normals on both bones, align upper/lower pairs and retain a common scale. Add discs only where appropriate, distinguish occipito-atlantal, median/lateral atlanto-axial, zygapophysial and sacrococcygeal connections. Validate contacts and overlaps at rest. Keep illustrative separation distinct from physiological movement; do not claim motion limits without a source.
5. **Study/exam/progress:** timed or untimed sessions, review missed structures, per-structure history, session resume and transparent scoring; migration/backup tests for every schema. Test source links, model/label correspondence and touch use on the user's Galaxy S23 Ultra.

## Candidate asset research

- Original BodyParts3D description: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html
- Original download entry: https://lifesciencedb.jp/bp3d/info_en/download/index.html
- UBC lumbar photogrammetry: https://www.clinicalanatomy.ca/back/vertebra3D.html

These are candidates, not shipped assets. Original-site and archive license summaries differ, so verify the exact downloaded dataset license before redistribution; do not rely on a mirror's software license. A whole-bone mesh alone does not provide part segmentation or validate joint contact geometry.

## Release gate

- Node tests, browser regression suite and deterministic build pass.
- WebGL and Canvas: selection, guides, isolation, transparency, separation and picking agree.
- Check 26 selectors and all 104 assembly combinations; old progress, backup import/export, reload, offline and multi-tab behavior remain correct.
- Netlify deploy-preview and CI succeed for the exact PR head. Review on desktop and a physical phone.
- Mark unreviewed geometry honestly; complete the model and articulation milestones before calling v10.0 anatomically validated.
- Owner approves the tested preview before merging `main`. Do not enable auto-merge.

## Storage and preview caveats

v10 writes `anatomy3d_workspace_v10` and retains the original v9/v8 keys. v9/v8 backup imports are supported; v10 backups with new structures cannot be imported by v9. Returning to v9 restores its earlier snapshot, not progress earned in v10. Export a v10 backup before rollback. Netlify preview and production have different origins, so use export/import to transfer progress for testing.
