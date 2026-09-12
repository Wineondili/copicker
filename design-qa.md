# Design QA

## 2026-09-12 — Build 8881 live picker and settings synchronization

- Codex `26.908.40834` build `8881`; renderer `0.12.16` hot-loaded without quitting/restarting Codex. An unrelated unselected GPT-5.2 radio caused `0.12.15` to show `Other`; the corrected classifier ignores only unknown unselected rows and still rejects unknown selected or ambiguous states.
- Native checked-model/effort/Fast confirmation passed for Astra/low/Standard, Sol/ultra/Fast, Terra/medium/Standard, Luna/max/Standard, GPT-5.5/xhigh/Fast, Daybreak/low/Standard, and Codex Spark/medium/Standard. A trusted pointer click also confirmed Terra/high/Standard, left the native menu open, and showed an intermediate thumb position during the existing easing. Do not label this an exhaustive live matrix or a separately completed automated drag pass.
- The user independently reported that models select correctly and that sending uses the selected model with correct routing. This supersedes the earlier pending live-selection/first-message status for the tested picker flow. No model request was submitted by the inspection helpers, and ownership guards stopped further attempts when the prepared composer changed.
- Settings source and standalone preview retain seven rows with effort counts 6/6/6/5/6/4/4. The native Luna slider reports Max as step five of five on this build, despite six catalog efforts. Existing preference defaults, dimensions, colors, non-Fast rows, and 240-millisecond pointer easing remain unchanged. The settings footer explains native availability and Default display without adding a Default row.
- Isolated settings HTML, `1280 × 720`, in-app Browser: title and meaningful content present; seven model rows; no horizontal overflow or framework overlay; no console warnings/errors. Enabling Astra and hiding the three original defaults saved in mock state; attempting to hide the last row was rejected; mock Apply completed. Screenshot: local `settings-desktop.png` artifact outside the repository. The actual MCP Astra save/read contract passed offline. These are not live settings persistence or newly measured native settings geometry claims.
- All 47 offline tests, JavaScript syntax checks, whitespace validation, and release build passed. After the user authorized MCP refresh, the installed executable/resources were updated with a recoverable local backup and matching SHA-256, and only the existing Copicker watcher was reloaded. All three app renderers report rail/settings `0.12.16`; the saved-preferences and LaunchAgent-plist hashes are unchanged. The official MCP refresh request was accepted, but a subsequent read in the current loaded task still returned the old settings document, consistent with the documented queued-refresh boundary. Live Astra persistence is not confirmed. Codex stayed at PID (omitted), and no Codex restart or publication was performed.

- Final handoff: the user chose to restart Codex manually after the build. The final release rebuild passed and remains SHA-identical to the installed executable. A fresh installed MCP process passed read-only schema/resource verification for all seven models and the updated settings document, without writing preferences. No old task connection was force-stopped.

result: live picker and user-reported model routing passed; settings source/isolated UI, installed page delivery, and fresh MCP process passed; post-restart integration remains user-owned

## 2026-09-10 — Build 8378 radio-list compatibility candidate

- Inspected Codex `26.903.61454` build `8378` in the running process without a restart. The official picker retains both simple and advanced panels, and advanced now contains a Default row plus seven model radio rows. The compact view uses an explicit-model marker, model-specific strength keyboard control, and Fast checkbox.
- Renderer `0.12.15` adds this layout independently from the legacy Model/Effort/Speed flyouts. It adds Astra with six effort levels, displays Default without selecting a model cell, and retains the accepted 240-millisecond pointer easing.
- Isolated browser fixture: 42 synthetic model/effort/Fast cases passed, including transitions through Daybreak and Codex Spark. An unresponsive native-slider fixture terminated boundedly and restored Astra/xhigh/Standard. Default display and Default-to-explicit-Astra selection passed. Replacing the composer during a pending transaction preserved the replacement state and resynchronized the rail to Terra/medium.
- The fixture uses synthetic catalog data and native-control handlers. It is regression evidence, not live Codex switching acceptance. Live candidate loading was stopped by guards when test windows changed to real tasks or were closed; no running task's model was changed.
- At this checkpoint production installation, live model switching, first-message persistence, restart, and cold-login checks remained pending. The 2026-09-12 entry above supersedes the live-selection/first-message portion only; the following entries describe older candidates.

## 2026-09-01 — Renderer 0.12.13 flyout loop and special-model freeze

- Strict result: installed renderer `0.12.13` failed. The user observed that Daybreak Blue and GPT-5.3 Codex Spark could leave Codex unresponsive at every effort, and an idle no-task picker continuously flashed the official Model, Effort, and Speed flyouts.
- Environment: Codex `26.825.51511` build `7377`, source-exact installed payload SHA `520be6970e07fd9116152bdb35a6116342e82f969e55740cfffb6a7e72d6dafb`, loaded watcher, and `injection-succeeded`. A bounded read-only probe found the currently active task on Sol/max with all official menus closed; it did not mutate a selector or attempt to reproduce the no-task freeze.
- Source evidence: no-task passive synchronization explicitly opened Model/Effort/Speed to capture and verify official state. Opening the Model flyout added or removed the legacy Daybreak leaf, the global observer treated that proxy-owned DOM churn as a fresh external structure change, initialization requested the same passive read while it was still running, and the completion handler scheduled another microtask retry. Thread Daybreak classification had the same unbounded same-key retry shape on the shared commit queue. This mechanism directly explains the reported continuous flashing and is consistent with the special-model stall.
- Candidate correction: renderer `0.12.14` removes idle no-task official-control reads; nested flyouts are touched only after an explicit CoPicker selection. It ignores bounded passive classification churn for external Daybreak generations, coalesces duplicate in-flight task classification without a queued retry, suppresses initialization during passive classification, and retains a successful no-task confirmation across a same-composer trigger remount.
- Offline evidence: all 44 tests passed, including executable proxy-churn and no-task-confirmation contracts. JavaScript and shell syntax checks, whitespace validation, and the production release build also passed.
- Boundary: the explicit no-task transaction still opens official controls because build `7377` exposes no equivalent inspected public method for renderer-local draft/default/prewarm state. The transaction is now bounded rather than idle or self-retrying. Renderer `0.12.14` is not installed and has not received a live interaction pass.

candidate result: `0.12.13` live-failed; `0.12.14` offline-green and pending live validation

## 2026-09-01 — Live failure diagnosis and renderer 0.12.13 correction (superseded by next live failure)

- Strict result: renderer `0.12.12` failed. The user observed that selection had no effect after installation.
- Environment: running Codex `26.825.51511` build `7377`, installed source-exact payload SHA `a49a67af32a074b369b1454a190c5501f47f2513b2d0be3a8359d9f8ad9152b7`, watcher `injection-succeeded`, and bounded Inspector probes that opened only the first-level picker and read privacy-limited metadata. No selector mutation, task creation, restart, or bundle modification was performed by the probes.
- Rendered evidence: CoPicker `0.12.12` was present but displayed centered `Other`, no active cells, and `switchState: error`. Runtime state classified the account as exact `legacy-model` Daybreak and reported `Codex reported an unsupported effort or service tier for the current model.` The authoritative settings notification contained `serviceTier: "default"` for the visible Sol/medium Standard state.
- Root cause: `0.12.12` accepted only explicit null as Standard and deliberately refused all mutation under the exact legacy Daybreak topology. Both static assumptions were disproved by this account's live state.
- Candidate correction: renderer `0.12.13` accepts explicit null or exact `"default"` as Standard, restores the normal mutation route for one exact legacy Daybreak Model leaf, and continues to reject unrelated tiers and ambiguous/separate-program Daybreak state. Pointer animation, release-coordinate commit semantics, transaction baselines, and the responsive flat-effort fix are unchanged.
- Offline evidence: all 44 tests, JavaScript and shell syntax checks, whitespace validation, and the production release build passed.
- Boundary: `0.12.13` has not been installed or interacted with. A new user acceptance pass is still required.

candidate result: `0.12.12` failed live; `0.12.13` offline-green and pending live validation

## 2026-09-01 — No-task official-control compatibility candidate (superseded by live failure)

- Target flow: on a new unsent composer with no task ID, CoPicker resolves the exact official first-level picker, commits model-backed Model/Effort/Speed selections through Codex's owned controls, and requires exact official control confirmation without using a retained task ID or raw config write.
- Environment: read-only bundle-on-disk inspection of Codex `26.825.51511` build `7377`, plus the repository's offline JavaScriptCore and source-contract harnesses. No renderer Inspector, injection, installation, application restart, live selection, or task creation was performed.
- Current-build evidence: the build-`7377` bundled sources retain an explicit new-draft model/effort/service-tier path that updates renderer-local draft state, persists profile-aware defaults, and invalidates prewarmed tasks. The same bundled sources render either a markerless active-panel power picker or an exact non-Power Work picker with Model/Effort/Speed flyout rows, `role="menuitem"` leaves, `aria-controls` portal ownership, and no selected-effort attribute inside the Effort submenu. The official renderer loads every hidden-inclusive `model/list` page, then filters hidden targets out of the ordinary picker while retaining the selected hidden model as additional context.
- Compatibility result: renderer `0.12.12` separates primary-surface classification from actionable menu items, supports the exact current three-flyout power and non-Power Work layouts plus the exact catalog-sized alternate flat-effort layout, excludes exactly one explicitly labeled Daybreak-program prefix, binds the primary surface and flyouts through `aria-controls`, and treats absent or conflicting compact Fast state as unknown. Model labels require exact visible-text equality against the complete paginated live catalog; when responsive layout hides the compact trigger text, the flat-effort path falls back only to one exact Model row on the same primary surface. Hidden targets remain unselectable and a hidden current model aborts because its selected-only leaf may disappear. The proxy preflights target and rollback Model/Effort leaves, requires two matching current Model/Effort/tier snapshots with a semantic Speed signature, and binds mutations to the original still-unsent composer. The exact checked target Model leaf confirms responsive icon-only triggers. A visually checked Standard can mask a carried unsupported tier, so passive initialization stays provisional and Standard is accepted only after an observed catalog-resolved Fast-to-Standard transition; that transition makes normalized Standard the rollback baseline because the hidden raw tier is unknowable. Missing Speed/Fast controls abort. The requested tier is established on the current model and reapplied on the target. Partial failure restores and recaptures the captured tier index, including exact `Ultrafast`; rollback failure invalidates confirmation. Passive refresh is serialized and retried only for the same composer. The proxy boundedly waits out the compact Ultra warning, never matches `Fast` by suffix, and leaves Advanced intact rather than activating Reset. Existing-task requests require a strictly newer notification and invalidate confirmation after an unconfirmed dispatch. Trusted official changes invalidate cached state in either notification/DOM order. The previously user-confirmed click/drag easing and release-coordinate commit state machine are unchanged.
- Daybreak boundary: build `7377` removes `gpt-daybreak-blue-latest` from the Model submenu and exposes a separate generic Daybreak program checkbox whose transition may remap current and default base models. The candidate rejects the Daybreak row on both task paths when that control is present, allows ordinary model mutation only while the exact control is explicitly off, and rejects every mutation when neither the checkbox nor one exact legacy leaf is observable. An exact legacy leaf remains passive read-only recognition only; mutation is refused because its availability cannot be held atomically while mutually exclusive flyouts cycle. The current program remains pending an explicit base-model/effort policy.
- Offline evidence: the full 44-test suite passed, including executable legacy/power/flat layout classification, ambiguity rejection, exact-label rejection, service-tier rejection, and observed Standard-transition semantics. JavaScript syntax, shell syntax, whitespace checks, and the production release build also passed.
- Boundary: this static/offline result was subsequently superseded by the installed `0.12.12` failure recorded above.

candidate result: offline-green but live-failed; do not use as acceptance evidence

## 2026-08-30 — Restored click and drag positional easing candidate

- Target flow: isolated Model Rail tuner loads, a non-thumb cell press visibly eases the fill/thumb to its preview cell and commits once on release, then one continuous drag visibly eases through preview cells and commits only the final release cell.
- Environment: Codex in-app browser, `http://127.0.0.1:8767/model-rail-tuner.html`, native `1280 × 720` browser viewport, rendered stage `194 × 88` CSS pixels. The localhost server, browser tab, and screenshot were temporary development surfaces.
- Click animation evidence: the thumb moved from `left=657.5, top=312` through sampled intermediate positions `631.01, 320.78` and `565.94, 342.16` to `561.5, 344`. While the pointer was held, computed transition properties remained `left, top, transform` with durations `240ms, 240ms, 150ms`; release recorded exactly one Terra/low commit.
- Drag animation evidence: during one continuous Terra/low-to-Luna/xhigh gesture, the stage remained in `dragging` state while the thumb retained `left/top` 240-millisecond transitions and the selection fill retained `width/bottom` 240-millisecond transitions. Release recorded Luna/xhigh as row `2`, index `3`, and advanced the total commit count from `1` to `2` exactly once.
- Rendered evidence: the final screenshot showed the unchanged accepted rail geometry in Luna/xhigh state, with no clipping, overlap, blank page, framework overlay, console warning, or console error.
- Offline evidence: the new production/tuner animation contract and the existing final-displacement, frozen-snapshot, cancellation, thread-scoping, and no-task-selector contracts passed in the full 41-test suite. SwiftPM manifest loading, JavaScript and shell syntax checks, whitespace validation, and the production build also passed.
- Boundary: this is isolated browser and offline source validation for renderer `0.12.11`. It did not attach to, install into, inject, restart, or mutate the running Codex app and is not new live-runtime acceptance.

candidate result: original click/drag easing restored in isolation; release-coordinate commit semantics preserved; live Codex acceptance not tested

## 2026-08-28 — Pointer-release reliability candidate

- Target flow: isolated Model Rail tuner loads, a non-thumb cell click commits once, a continuous drag commits the final release cell once without pausing, and a stationary thumb click toggles Fast once.
- Environment: Codex in-app browser, `http://127.0.0.1:8766/tools/model-rail-tuner.html`, native browser viewport, rendered stage `194 × 88` CSS pixels. The server and tab were temporary development surfaces.
- Interaction evidence: a Terra/low cell click changed the commit counter from `0` to `1`; one continuous Terra/low-to-Luna/xhigh drag changed it to `2` with committed row `2`, index `3`, Fast `false`; a stationary click on that final thumb changed it to `3` with Fast `true` and did not change the selected cell.
- Rendered evidence: the final screenshot showed the unchanged accepted rail geometry in Luna/xhigh/Fast state, with no clipping, overlap, blank page, framework overlay, console warning, or console error. Position easing is disabled only during an active drag; resting appearance is unchanged.
- Source behavior evidence: executable JavaScriptCore tests cover a release displacement with no qualifying intermediate move, a moved gesture returning to its start, ordinary cell selection, Fast preservation across preview-only compatible rows, non-Fast clearing, pointer cancellation rollback, and exact/ambiguous task-ID resolution.
- Boundary: this is isolated browser and offline source validation for renderer `0.12.9`. It did not attach to, inject, restart, or mutate the running Codex app and is not new live-runtime acceptance.

candidate result: isolated interaction passed; live Codex acceptance not tested

## 2026-08-15 — Runtime Model Rail v0.8.0

- Historical source reference: a 752 × 724 pixel Sol/xhigh preview was compared with the runtime component. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Historical runtime reference: a 3104 × 1844 pixel Codex screenshot captured the Sol/xhigh state. The original image existed only in a machine-local temporary directory and is not a portable repository asset.
- Density normalization: structural comparison used CSS measurements because the full-page screenshots have different pixel densities. Source and runtime both measured 289.75 × 134.75 CSS pixels; the selector stage measured 194 × 88 CSS pixels.
- Full-view check: the detached rail stayed outside the official first-level picker without overlap.
- Focused check: typography, label placement, gradients, dot spacing, fill/thumb geometry, endpoint labels, shell color, and outer footprint matched the approved preview.
- Interaction check: the user confirmed arrow-key navigation and Space-based Fast toggling in the live app.
- Final result: passed by user acceptance. No visual changes remain requested.

## 2026-08-27 — CoPicker settings native-control realignment

- Source visual truth:
  - `[local reference omitted]` — current Codex General settings at 3104 × 1844 pixels.
  - `[local reference omitted]` — current Codex default segmented control at 166 × 68 pixels.
  - `[local reference omitted]` — current Codex secondary toolbar button at 94 × 66 pixels.
- Rendered implementation evidence:
  - `[local reference omitted]` — reconstructed in-app-browser document capture at 657 × 1021 pixels.
  - `[local reference omitted]` — combined official-source and rendered-implementation comparison, including focused control regions.
- Viewport and density normalization: the official full screenshot is an @2x 3104 × 1844 capture representing a 1552 × 922 CSS-pixel app window. The focused segmented and button sources were downsampled by exactly 0.5 to 83 × 34 and 47 × 33 CSS-pixel evidence. The implementation was captured by the Codex in-app browser at a 657 × 724 CSS-pixel viewport and device scale 1; two captures at `scrollY=0` and `scrollY=297.5` were joined without rescaling. The full views therefore document responsive hierarchy rather than pixel-coordinate identity, while all focused controls are compared at one image pixel per CSS pixel.
- State: controlled visual validation; personal preference snapshot omitted.
- Full-view comparison evidence: both surfaces use the same settings-group hierarchy, 768-pixel maximum content column, 16-pixel card radius, 12-by-16 row inset, 24-pixel row gap, compact group headings, and responsive shrink behavior. CoPicker's additional groups and model rows are intentional product content, not visual drift.
- Focused comparison evidence:
  - Card: white light fill, 8-percent default border, 16-pixel radius, and no superellipse override.
  - Switch: 32 × 20 track, 16 × 16 border-box thumb, 2-pixel unchecked offset, 14-pixel checked offset, 10-percent off fill, and current Codex chart blue when checked.
  - Segmented control: transparent group, 2-pixel option gap, 24-pixel option box, fully rounded option, tertiary unselected text, and selected-only 5-percent text fill with no shadow.
  - Action: 28-pixel toolbar height, 8-pixel horizontal padding, 10-pixel radius, transparent border, 14-pixel text, and 5-percent/10-percent normal/hover fills.
- Required fidelity surfaces:
  - Fonts and typography: system/OpenAI host font variables, 14-pixel group titles and toolbar actions, 12-pixel row labels/options, 11-pixel descriptions, native weights, and native line heights are aligned. No wrapping or truncation regression was visible at 657 pixels.
  - Spacing and layout rhythm: native row, card, section-header, option, switch, and action dimensions are aligned; the narrower implementation capture exercised responsive layout without overlap or clipping.
  - Colors and visual tokens: card fill, 8-percent border, 5-percent selected/action fill, 10-percent hover/off fill, tertiary text, focus ring, and chart blue now map to the current renderer semantics.
  - Image quality and assets: this settings surface contains no visible product imagery or custom icons; no raster, SVG, emoji, or CSS-art substitute is present.
  - Copy and content: CoPicker-specific labels and access/subscription notices remain unchanged and readable; the source General-page copy is intentionally not duplicated.
- Interaction evidence: the preview bridge returned an authoritative snapshot, six inputs rendered selected, placement selection remained keyboard-native through radio inputs, and **立即应用** completed with `已应用到当前 Codex`, `当前窗口已更新，无需重启。`, and no visible error panel. The live Codex process was not attached, signalled, restarted, or reinjected for this QA pass.
- Comparison history:
  - Pass 1 found four P1 mismatches: an oversized pseudo-element switch thumb, a stronger outline token, the inset segmented-control variant, and an outlined pill action. It also found a large standalone page title and a gray fallback card fill that did not match the current light Codex surface.
  - Fixes replaced the pseudo-element with a border-box thumb element; mapped the default 8-percent border; implemented the default transparent segmented variant; implemented the `secondary` toolbar action; changed the top treatment to the native compact settings-group header; and made the light fallback panel pure white while retaining forwarded host tokens.
  - Pass 2 used `[local reference omitted]`; no actionable P0, P1, or P2 mismatch remained in the required fidelity surfaces. The different source copy, model-row count, and responsive viewport width are documented constraints rather than visual defects.

final result: passed

## 2026-08-28 — CoPicker page-title hierarchy

- Source visual truth:
  - `[local reference omitted]` — current official Codex General settings at 3104 × 1844 pixels, showing the page-level heading, its vertical clearance, and compact group headings.
  - `[local reference omitted]` — the accepted CoPicker controls before this correction, showing that only the page-title hierarchy and missing first group label required adjustment.
- Rendered implementation evidence:
  - `[local reference omitted]` — updated CoPicker settings document captured at a 1552 × 922 CSS-pixel viewport in the Codex in-app browser.
  - `[local reference omitted]` — one combined comparison input containing the official reference downsampled from @2x and the implementation at one image pixel per CSS pixel.
- Viewport and density normalization: the 3104 × 1844 official screenshot was downsampled exactly to 1552 × 922 before comparison. The isolated implementation uses the same viewport but intentionally omits the surrounding native settings sidebar and toolbar; relative page-title, group-title, and card spacing are therefore the authoritative comparison surfaces.
- State: controlled visual validation; personal preference snapshot omitted.
- Native source confirmation: the current Codex renderer wraps settings pages with a 768-pixel maximum content column, a `heading-lg font-normal` page heading, 32 pixels of bottom padding, 40-pixel group gaps, and compact toolbar-height section headers. The implementation now follows that same hierarchy while retaining the already accepted local control primitives.
- Measured implementation:
  - Page title: 24-pixel font, 400 weight, 28.8-pixel line height, starting at the content inset.
  - Page-title wrapper: 32-pixel bottom padding.
  - First group title: `常规`, 14-pixel font, 500 weight, 21-pixel line height.
  - First card: 768-pixel width at the same left edge as both headings; all lower groups retain their previous 40-pixel spacing.
- Required fidelity surfaces:
  - Typography: the page title now has the official visual prominence while section headings remain compact; row labels, descriptions, warnings, and controls are unchanged.
  - Spacing: the page title no longer collapses into the first card, and the new `常规` label occupies the same group-header rhythm used by official settings.
  - Layout: the existing centered 768-pixel maximum width, card geometry, row separators, model order, placement controls, and appearance controls remain unchanged.
  - Color and assets: the accepted dark theme tokens, colored warning text, switches, and icon-free settings body remain unchanged.
- Comparison history:
  - Pass 1 is the user-supplied CoPicker screenshot: the outer title incorrectly reused the 14-pixel group-title treatment and the first card had no visible group label.
  - Pass 2 is `[local reference omitted]`: the outer heading matches the official 24-pixel page treatment, the relative blank space matches the native wrapper contract, and the first group now reads `常规`. No visible regression was found in the accepted lower controls.

final result: passed

## 2026-08-28 — Superseded screenshot-derived page-top inset

> Historical result only. This screenshot-based 42-pixel inset was later disproved by direct live DOM and computed-style measurements. The current accepted contract is recorded in the final section below and in `docs/accepted-baseline.md`.

- Source visual truth:
  - `[local reference omitted]` — live CoPicker settings at 3104 × 1844 pixels before the correction, showing the page title too close to the host toolbar edge.
  - `[local reference omitted]` — official Codex General settings at 3104 × 1844 pixels, used to confirm the intended page-level vertical breathing room.
- Rendered implementation evidence:
  - `[local reference omitted]` — corrected CoPicker settings document captured in the Codex in-app browser at a 1552 × 922 CSS-pixel viewport.
  - `[local reference omitted]` — combined full-view and focused comparison of the observed live page before the fix and the corrected implementation.
- Viewport and density normalization: the live 3104 × 1844 source was downsampled exactly to 1552 × 922. The implementation was captured at 1552 × 922 with one image pixel per CSS pixel. The focused comparison aligns the host content edge and page-title region so surrounding sidebar and toolbar differences do not distort the whitespace judgment.
- State: controlled visual validation; personal preference snapshot omitted.
- Findings and comparison history:
  - Pass 1 found one P2 spacing mismatch: the live page left approximately half as much clear space above `CoPicker` as between `CoPicker` and `常规`, making the page title appear pinned to the host toolbar edge.
  - The fix changed only the body page-top inset from 20 to 42 pixels and advanced the renderer compatibility identifier so a subsequent injection replaces the older settings surface.
  - Pass 2 measured 42 pixels from the content top to the page-title top and 41.5 pixels from the page-title bottom to the `常规` title top. The 0.5-pixel difference is subpixel layout rounding; no actionable P0, P1, or P2 mismatch remains.
- Required fidelity surfaces:
  - Fonts and typography: the accepted 24-pixel, 400-weight page title and 14-pixel, 500-weight group headings are unchanged.
  - Spacing and layout rhythm: only the page-top inset changed; the first card begins at the same position relative to `常规`, and all 40-pixel lower group gaps remain unchanged.
  - Colors and visual tokens: dark surface, text, border, warning, switch, and selected-control tokens are unchanged.
  - Image quality and assets: the settings body contains no visible product imagery or new assets.
  - Copy and content: all labels, descriptions, access notices, model order, and save/apply messages are unchanged.
- Interaction evidence: the preview loaded the authoritative snapshot and **立即应用** still completed with `已应用到当前 Codex` and `当前窗口已更新，无需重启。` after the spacing-only change.

historical result: superseded; do not use the 42-pixel inset as a current implementation target

## 2026-08-28 — CoPicker live native settings viewport alignment

- Source of truth: bounded `getBoundingClientRect()` and `getComputedStyle()` readings from the running official General settings page, not screenshot estimation or guessed minified utility classes.
- Exact environment:
  - runtime source `c0343d4d76e4094cd99ba9ff7fe0fb71fc3edbbb`;
  - CoPicker CLI/plugin `0.12.0-dev`;
  - renderer compatibility `0.12.8`;
  - Codex desktop `26.820.60940` build `7119`;
  - Apple silicon `arm64`;
  - `1440 × 810` CSS-pixel window at device-pixel ratio `2`.
- Direct official measurements:
  - right-pane toolbar: `top=0`, `height=46`;
  - scroll viewport: `left=268.828125`, `top=46`, `width=1171.171875`, `height=764`, `overflow-y=auto`, and `20px` padding on every side;
  - centered content: `left=470.41`, `top=66`, `width=768`, `max-width=768px`;
  - page heading: `top=66`, `height=28.8`, `font-size=24px`, `line-height=28.8px`, `font-weight=400`;
  - title block: `height=60.8`, including `32px` bottom padding;
  - first group title: `top=136.3`, `height=21`, `font-size=14px`, `line-height=21px`, `font-weight=500`;
  - heading top to group-title top: `70.3px`; heading bottom to group-title top: `41.5px`.
- Root cause of the superseded pass: the fallback host covered the whole right pane from `y=0`, so the fixed 42-pixel body inset attempted to absorb both the toolbar and panel spacing. It also inherited a 32-pixel `text-2xl` line height instead of the official unitless `1.2` heading line height.
- Accepted implementation:
  - detect the full-width native `overflow-y: auto|scroll` viewport inside the settings panel;
  - position the fallback host to that viewport rectangle below the toolbar;
  - use a 20-pixel iframe body inset, centered 768-pixel maximum content column, 24-pixel heading, unitless `1.2` line height, 32-pixel title bottom padding, and 40-pixel group gaps;
  - retain responsive measurement instead of hard-coding the observed sidebar width or window coordinate.
- Regression boundary: `model-rail.js` keeps the wide-scroll-viewport predicate, forwards the native heading line-height variable, and deliberately does not forward `--text-2xl--line-height`; `copicker-settings-v2.html` keeps `--copicker-page-top-inset: 20px`.
- Acceptance: the corrected payload was installed and reviewed in the running Codex app. The user explicitly confirmed that the page was completely identical to the official settings geometry.
- Safety evidence: the bounded inspection/injection closed Inspector afterward; the official app bundle was not modified or re-signed, and Codex was not terminated or restarted by the agent.

final result: passed for the exact runtime and Codex build above; later Codex builds require independent remeasurement
