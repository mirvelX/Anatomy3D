# v10.x curriculum draft

Base: v10.1 commit `dfca0ec97ff544cd5b3684ea392360bd425f1b34`.
Branch: `codex/v10-study-expansion`. PR #5. Production requires explicit user approval.

## Permanent project requirements

- Every named anatomical structure must ultimately have a licensed, anatomically reviewed mesh or an individually identifiable region of a mesh. Spaces need an appropriate boundary representation; movements need approved joint animations.
- A text entry is not a completed model. Track missing geometry explicitly. Never fill gaps with primitive or schematic 3D.
- Preserve the existing C1/C2/L3 pilot geometry, masks, renderer and behavior. Do not restore the cancelled v11 2D branch.
- Kacitadze, Human Anatomy, volume I (2017) is the primary source wherever its available pages address a topic. AK notes are required as a second source. Expose differences and normalization instead of silently replacing source wording.
- The uploaded book ends at printed page 149. Vertebral joints from 150, thoracic joints from 155 and upper-limb joints from 162 need future book pages.
- Stages: 10.2 general arthrology; 10.3 vertebral connections; 10.4 thorax; 10.5 shoulder girdle; 10.6 humerus/forearm; 10.7 hand; 10.8 integration. These are planned module stages, not a declaration that the anatomical releases are complete.
- Run Node and browser tests after each module, use Netlify Deploy Preview, and keep main/production unchanged until approval.

## What is implemented

Seven user-provided interactive lab pages are integrated and published from `labs/`: v10.2 general arthrology, v10.3 vertebral connections, v10.4 thoracic connections, v10.5 upper-limb girdle connections, v10.6 free upper-limb connections, v10.7 pelvis connections and v10.8 free lower-limb connections. These are teaching visualizations and do not change the reviewed-mesh coverage count. The C1/C2/L3 BodyParts3D pilot is preserved.

Nine navigable draft modules, 278 study records at the initial integration checkpoint. The catalog includes general arthrology, vertebral connections, ribs I-XII, sternum, cavity boundaries, thoracic joints, clavicle/scapula, humerus, ulna/radius, both carpal rows, metacarpals I-V, 14 individual phalanges, and upper-limb joint/ligament records.

Shared UI: Georgian/Latin search, grouping, selectable descriptions, two-record comparison, learned toggle, per-module progress, question cycles, carpal-row quizzes and JSON backup/import. The existing atlas has a contextual Connections entry. The model controls are disabled with a visible reason until assets are approved; views are requirements, not working camera controls for absent meshes. The hand quiz is text-based; a click-on-mesh quiz is still pending.

Persistence uses `anatomy3d_curriculum_v10_2`, separate from the unchanged vertebral workspace. Imports merge learned entries and keep the larger valid score counters without double counting; old atlas backups are not overwritten.

## Sources actually inspected

The newly attached PDFs could not be materialized: attachment downloads failed with access errors. The previously uploaded `1.კონსპექტი A.K(2).pdf` (37 pages) was available through text retrieval. Pages 1-4 and 7-19 supplied the draft entries. Its identity with the new upload has NOT been established and is exposed in source metadata.

The previously uploaded Kacitadze scan has 150 PDF pages and no parsed text. Page retrieval yielded image references but no inspectable pixel data in this runtime, and the public PDF exceeded the web reader size limit. NO new entry is marked as book-verified. Page ranges in records are search targets only. No later book pages have been fabricated.

Examples of unresolved source issues are exposed in entries: intracapsularia/intercapsularia; misspelled Latin forms; Radius head called body in Georgian; questionable `კუბური` in the radiocarpal list; simplified thoracic aperture boundaries; rib-head and manubriosternal joint classifications; humeroradial axes. Normalized display Latin is shown alongside the source form. These notes do not constitute an authoritative correction.

## Remaining release blockers

1. Read the exact new PDFs, verify the old/new notes identity, visually inspect Kacitadze printed pp.40-59 and 130-149, determine exact per-entry citations, and add book-only landmarks missing from the current notes-based draft.
2. Add subsequent Kacitadze specific arthrology pages and resolve source conflicts with recorded evidence.
3. Acquire and inspect licensed meshes for every structure; record origin, license, attribution, scale/orientation, left/right identity, anatomical review, region mapping and segmentation evidence. Current new-model coverage is 0/278. Existing pilot meshes remain unchanged.
4. Complete capsule attachments, joint exceptions, full boundary sets, movements and accurately registered superior/inferior contacts. Several joint fields deliberately say that more source detail is needed.
5. Implement mesh highlight/isolate/camera views and click-on-model quizzes only after approved region mappings exist.
6. Finish anatomical review and user acceptance; only then consider a non-draft release and production approval.

## Validation

Each module checkpoint ran the existing Node suite plus curriculum tests and the new browser suite locally. PR CI additionally runs the original browser/PWA suite and pilot WebGL/canvas tests against the full repository assets, followed by the production build. Local checkout could not retrieve binary PNGs through the connector, so the new local browser test serves source directly. CI's checkout contains those unchanged PNGs and runs the complete build.

Test status and Netlify Preview must be checked against the final branch SHA, not an earlier checkpoint. Never merge automatically.
