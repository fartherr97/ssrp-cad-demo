# SSRP CAD — Frontend Pre-Backend-Handoff Audit

**Reviewed as:** Senior Frontend Engineer · Senior UI/UX Designer · QA Lead · Accessibility Specialist · Product Reviewer
**Scope:** Frontend only (React 19 + Vite + Tailwind, single `useReducer` store, mock data). Backend logic, DB, server security, and deployment are explicitly out of scope except where the frontend *assumes* they exist.
**Method:** Full read of the core design system + architecture; clustered deep-read of all ~50 pages, ~35 admin sections, portals, modals, and shared components; production `vite build`; `eslint` static analysis; reducer cross-checks of the most consequential claims.

---

## 1. Overall Frontend Quality Score: **72 / 100**

This is **not a prototype.** It is a large (~38k LOC, 80+ screens), visually consistent, genuinely well-engineered front end with a real design-token system, a custom accessible `Select`, an animation/motion layer that honors `prefers-reduced-motion`, mobile-aware layouts, and an *excellent* `HANDOFF.md` where every write is a typed action (the action set is effectively the API contract). That foundation is what earns the 70s.

It is held back from the 80s/90s by: **one latent crash bug** (conditional hooks in the Command Portal that will trigger *on backend hydration*), **pervasive accessibility debt** (icon buttons with no accessible name, no modal focus traps, color-only status, clickable `<div>`s), **presence-only form validation** across most forms, **four competing patterns for the same UX** (toast vs. timed "Saved!" boolean; shared `Modal` vs. five hand-rolled ones; custom `Select` vs. native `<select>`; native `alert/confirm` vs. styled feedback), and **128 ESLint errors**.

| Axis | Grade | Notes |
|---|---|---|
| Visual design & consistency | A− | Strong tokens, cohesive theme, polished animations |
| Architecture / backend-readiness (data layer) | A− | Typed-action contract + HANDOFF.md is exemplary |
| Component reuse / consistency (UI layer) | C+ | 5 hand-rolled modals, native selects, 2 feedback systems |
| Form validation & data integrity | C | Mostly presence-only; many silent no-ops |
| Accessibility | C− | Systemic gaps; would fail a WCAG AA review |
| Loading / error states | D | Effectively none — invisible today, breaks at hydration |
| Code health (lint / purity) | C | 128 lint errors incl. a Rules-of-Hooks crash class |
| Performance (bundle) | C | 3 MB / 854 KB gzip single chunk, no code-splitting |

---

## 2. What's genuinely strong (so the criticism has context)

- **Design tokens**: `src/index.css` CSS variables + `tailwind.config.js` theme are well-factored; `src/constants/styles.js` centralizes buttons/badges/inputs/tables.
- **Custom `Select`** (`src/components/ui/Select.jsx`): keyboard nav, flip-aware portal menu, `role="listbox"`/`option`, animated open/close — better than a native select.
- **Toast system** (`src/contexts/ToastContext.jsx`): stack cap, promotable loading→success handles, progress bar, portaled, `role="status"`.
- **Motion**: full keyframe library, `prefers-reduced-motion` reduce honored globally, mobile rAF page-enter workaround.
- **Mobile**: `font-size:16px` on inputs (prevents iOS zoom), responsive breakpoints, hamburger nav, two-pane→single collapse, bottom-sheet modals.
- **Build passes** and **routing is clean** — every Admin nav/hub target has a matching route (no dead nav, no mounted "coming soon" stubs).
- **`HANDOFF.md`**: every mutation is a typed action; this is the single best thing about the project for backend wiring.

---

## 3. CRITICAL frontend issues

### C1 — Command Portal calls 10 hooks conditionally (Rules of Hooks violation → runtime crash, worst at hydration)
- **Location:** `src/pages/portal/CommandPortal.jsx:1378` (early `return <AccessDenied/>`) before hooks at `1383–1429` (`useMemo` ×7, `useState` ×2, `useTabParam`).
- **Issue:** `if (!hasCommandAccess) return …;` sits *above* ~10 hook calls. React requires the same hook order every render.
- **Why it matters:** `hasCommandAccess` derives from `officers`/`currentUser`. The moment those hydrate from a backend (false→true on first load), React throws **"Rendered more hooks than during the previous render"** and white-screens the portal. It's invisible today only because the mock store is synchronous. ESLint flags all 10 (`react-hooks/rules-of-hooks`).
- **Fix:** Move *all* hooks above the access-control early return; gate the *render output*, not the hook calls.
- **Blocks backend:** **Yes** — this will crash precisely when async data arrives.

### C2 — Destructive "Delete civilian" gated only by native `confirm()`
- **Location:** `src/pages/CivilianRegistry.jsx:96`.
- **Issue:** The single most destructive record action uses an unstyled browser `confirm()`.
- **Why it matters:** Inconsistent and unprofessional next to the app's styled `Modal`/toast system; a misclick permanently deletes a civilian and all linked data with an OS-chrome dialog.
- **Fix:** Replace with the shared `Modal` (danger variant), ideally type-to-confirm for civilians with records.
- **Blocks backend:** No (but should be fixed before real data exists).

### C3 — No "delete character" path anywhere in the civilian portal
- **Location:** `src/pages/portal/MyCharacters.jsx` (Edit/Set-Active only); `DELETE_CIVILIAN` exists in the reducer but is never invoked from any portal page.
- **Issue:** Players can register characters (including accidental or "Generate with AI" ones) but can never remove them.
- **Why it matters:** Permanent junk records; users hit a dead end with no recovery.
- **Fix:** Add a delete action with a confirm modal (reuse the portal `ConfirmModal`).
- **Blocks backend:** No.

> **Note:** No crash-on-load, no broken routes, no white-screen in the *default* (mock) flow — the only true crash is C1, and it's latent until hydration.

---

## 4. HIGH-priority frontend issues

### Consistency / "feels unfinished" (design-system divergence)
- **H1 — Native `alert()` for validation in the report builder.** `src/components/ReportForm.jsx:582, 659, 839, 840, 847` (image size/type errors). Use `toast.error(...)`. *Blocks backend: No.*
- **H2 — Native `alert()`/`confirm()` in the records builder.** `src/pages/admin/sections/CustomRecords.jsx:714, 921` (name required → alert), `:936` (delete template → confirm), `:999` (bundle import "replace all" → `window.confirm`). The same file uses `useToast` elsewhere. Use toast + styled confirm. *Blocks backend: No.*
- **H3 — Destructive WIPE gated only by `window.confirm`.** `src/pages/admin/sections/WipeRecords.jsx:23`. The most destructive action in the suite has no styled, typed confirmation. *Blocks backend: No.*
- **H4 — Native `confirm()` for flag delete.** `src/pages/admin/sections/Flags.jsx:61` (removes flag from all civilians). *Blocks backend: No.*
- **H5 — Two feedback systems for "saved".** 67 files use `useToast()`; 13 use a `setSaved(true)` + `setTimeout` boolean badge (`Limits`, `CommunityInfo`, `DiscordPresence`, `LoginPageEditor`, `Restrictions`, `Identifiers`, `CivilianForms`, `DiscordIntegration`, `CustomRecords`, `InGame`, `CommunityId`, plus `Supervisor`/`CommandPortal` use *both* redundantly). Some never reset the "Saved" label (`CommunityInfo`, `DiscordPresence`, `LoginPageEditor`, `Restrictions`). **Pick one (recommend toast) and delete the booleans.** *Blocks backend: No.*
- **H6 — Five hand-rolled modals bypass the shared `Modal`.** `DispatchPortal.jsx:89`, `portal/CivilianHome.jsx:206`, `CaseFiles.jsx:166`, `RecordsBureau.jsx:424` (InvestigationFlag), `RequestFDOTModal.jsx` / `RequestHCFRModal.jsx`, and duplicate `ConfirmModal`s in `MyVehicles.jsx`/`MyLicenses.jsx`. Each loses Escape-to-close, exit animation, and focus handling. Migrate to `ui/Modal.jsx`. *Blocks backend: No.*
- **H7 — Native `<select>` instead of the custom `Select`.** `FireOpsBoard.jsx:826`, `TowCAD.jsx:1080`, `CaseFiles.jsx:200 & 526`. Renders a light OS dropdown on the dark theme. *Blocks backend: No.*

### Missing / wrong feedback (actions that feel dead)
- **H8 — Status changes & self-assign give no feedback on several boards.** `DispatchBoard.jsx:56` (`setMyStatus`), `:50` (self-assign), `FireOpsBoard.jsx:430` (assign apparatus). Every other page toasts on these. *Blocks backend: No.*
- **H9 — "Clear Incident" closes a call with no confirm and no toast.** `FireOpsBoard.jsx:951`. Destructive (clears all attached units) yet silent, unlike `IncidentDetail`/`DispatchPortal`. *Blocks backend: No.*
- **H10 — Investigation tip submit is silent.** `RecordsBureau.jsx:379` dispatches `ADD_CASE_NOTE` then closes with no toast. *Blocks backend: No.*
- **H11 — False-success on duplicate plate.** `BusinessFleet.jsx:95` (and `MyVehicles`) always toast "registered," but `ADD_VEHICLE` (`cadStore.jsx:665`) silently returns unchanged state on a duplicate plate. User is told it worked; nothing appears. Reducer should signal failure. *Blocks backend: No.*

### Wiring / state bugs
- **H12 — "New Call" button is wired but never rendered.** `AppShell.jsx:97` passes `onCreateCall` to `<ActionBar>`, and `portals.js` declares `showNewCall:true` for dispatch/admin, but `ActionBar.jsx` never uses either — there is no global New-Call affordance. (Call creation still works *inside* `/cad`.) Render the button or remove the dead prop/flag. *Blocks backend: No.*
- **H13 — Notification read/clear ignore the recipient filter.** `ActionBar.jsx:324` → `MARK_NOTIFICATIONS_READ` and `:365` → `CLEAR_NOTIFICATIONS` operate on the **entire** `notifications` array (`cadStore.jsx:1502, 1510`), while the bell *displays* only `recipientBadge`-matched items. Reading/clearing your tray marks/clears everyone's. Filter by recipient. *Blocks backend: **Yes** — encodes wrong read-state semantics the API will inherit.*

### Destructive actions with no confirmation
- **H14 — Penal-code charge delete** (`PenalCodeEditor.jsx:183`), **Ban lift** (`BanManagement.jsx:38`), **Identifier delete** (`OfficerProfile.jsx:610`), **Unit-group delete** (`DispatchPortal.jsx:712`), **Account ban-cycle** (`Accounts.jsx:26` — clicking a status badge silently cycles ACTIVE→SUSPENDED→BANNED), **Tow job cancel / FDOT decline** (`TowCAD.jsx:354, 239`) all fire immediately on a single click. Add confirm (shared `Modal`) or undo. *Blocks backend: No.*

### Validation gaps that produce broken records
- **H15 — Character form has zero validation.** `MyCharacters.jsx:160` — empty submit registers a nameless civilian ("  registered"), corrupting identity displays everywhere. Require first/last/DOB. *Blocks backend: No.*
- **H16 — Warrant form allows empty subject/charges.** `WarrantControl.jsx:296` — `canSubmit = firstName || lastName`; an empty charge row creates `charge:''`, `civilianName:'UNKNOWN'`. Require a subject + ≥1 charge. *Blocks backend: No.*
- **H17 — Vehicle year/plate unvalidated.** `MyVehicles.jsx:182/170`, `BusinessFleet.jsx:174` — year accepts free text; plate format/dupe unchecked; vehicles "can't be edited after submission," so bad data is permanent. *Blocks backend: No.*

---

## 5. MEDIUM-priority polish issues

- **M1 — Reject/blocked conditions shown as green success toasts.** `ReportsCenter.jsx:198` ("Report marked Rejected" → success), `AdminTiers.jsx:408` ("Cannot delete — referenced" → `toast.success`). Use `warning`/`error`. *Blocks backend: No.*
- **M2 — Silent no-op on empty "add" forms.** `AdminBusinesses.jsx:114/135`, `Statutes.jsx:39`, `TenCodes.jsx:18`, `PermissionKeys.jsx:17`, `StatusCodes.jsx:18`, `QuickLinks.jsx:17`, `Servers.jsx:17`, `CallTypes.jsx:46`, `CivilianRegistry.jsx:47/75`, `CaseFiles.jsx:160` — clicking Add/Create/Save with an empty field just `return`s with no message (button often not disabled). Disable when invalid or show inline/toast error. *Blocks backend: Partial (bad shapes reach API).*
- **M3 — Auto-derived summaries are garbage.** `ReportsCenter.jsx:186` / `RecordsCenter.jsx:129` build `summary` by joining any string value > N chars. Sparse forms yield meaningless concatenations shown in lookups. Use a designated narrative field. *Blocks backend: **Yes** — defines persisted `summary` shape.*
- **M4 — Fragile civilian↔report matching.** `LEORecords.jsx:132` matches reports by scanning every `formData` value for a lowercase name equality — false positives across common names, misses ID-linked reports. Match on a stable `civilianId`. *Blocks backend: **Yes** — needs real subject linkage.*
- **M5 — Tow fleet split-brain.** Vehicles registered in `BusinessFleet` land in `state.vehicles` (`businessOwnerId`), but Tow Sign-On reads `company.fleet` (never populated by UI) — trucks show "No fleet configured." Reconcile the two models. *Blocks backend: No (resolve contract first).*
- **M6 — ToneBoard Play is effectively dead.** `ToneBoard.jsx:13` — dispatch tones carry no audio URL, so Play almost always toasts "No audio file uploaded." Hide/disable when no URL. *Blocks backend: No.*
- **M7 — Departments seed `type:'LEO'` doesn't match the edit dropdown options** (`Civilian/Law Enforcement/Fire & EMS/Dispatch`), so new agencies render with no Type selected. `Departments.jsx:224 vs :107`. *Blocks backend: No.*
- **M8 — Idle guard forces OFFDUTY with no warning.** `DutyGuard.jsx:32` — 15-min idle silently sets off-duty (losing call context) with no "still here?" prompt. *Blocks backend: No.*
- **M9 — `WipeRecords` copy contradicts itself.** `:81` says "cannot be restored" but the confirm/toast (`:24`) and the Auto-Saved Backups panel say it's restorable. *Blocks backend: No.*
- **M10 — Single-active-character confusion.** `MyLicenses.jsx:406` / `MedicalRecords.jsx:451` render only the active character despite multi-character copy + a dead `.map`; `CivilianHome` mixes account-wide and active-character stats with no scope label. Clarify scope. *Blocks backend: No.*
- **M11 — `CivilianContext` silently falls back to `myChars[0]`** when the persisted `activeCharId` doesn't match (`:31`) — can show another/deleted character with no indication. Validate the persisted id. *Blocks backend: No.*
- **M12 — Stray render artifacts / impure render.** `FormDocument.jsx:716` renders a literal leading comma before the supplement author; `LiveMap.jsx:158`, `Supervisor.jsx:625`, `DispatchPortal.jsx:220`, `CommandPortal.jsx:178/907` call `Math.random()`/`Date.now()` during render (ESLint `react-hooks/purity`) — `LiveMap` markers re-randomize position every render. *Blocks backend: No.*
- **M13 — `AccessDenied` "Login with Discord" actually logs out.** `AccessDeniedPage.jsx:39` — the CTA runs `LOGOUT` + navigate `/`; nothing reconnects. Relabel or wire to auth entry. *Blocks backend: Yes (auth re-entry undefined).*

---

## 6. Mobile / responsive issues

- **R1 — Fixed-px two-pane grids that only reflow at the mobile class breakpoint.** `CivilianRegistry.jsx:105` (`280px 1fr`), `WarrantControl.jsx:795` (`1fr 320px`), `UnitManagement.jsx:81` (`1fr 300px`). Between ~768–1024px the fixed rail + min-width tables force horizontal overflow. Use responsive/`clamp()` columns. *Blocks backend: No.*
- **R2 — Hardcoded `gridTemplateColumns:'1fr 1fr'` with no reflow.** `Geographical.jsx:84`, plus the login role grid `repeat(3,1fr)` (`LoginPage.jsx:280`) stays 3-up on a 320px phone. Use `repeat(auto-fit,minmax())`. *Blocks backend: No.*
- **R3 — `100vh`/fixed-height editor math.** `CustomRecords.jsx:1011` uses `calc(100vh - 56px)` and only splits its 3-pane editor at `xl` (1280px) — 768–1279px shows one cramped pane and hides the live preview; `100vh` ignores mobile browser chrome. Use the shell's flex height. *Blocks backend: No.*
- **R4 — Wide tables degrade to horizontal scroll on tablet.** `Supervisor.jsx:1166` (7 nowrap columns), Tow job queue, admin logs. Hide low-priority columns at `lg` or widen the card-view breakpoint. *Blocks backend: No.*
- **R5 — Date-row controls overflow on small mobile.** `CommandPortal.jsx:106` — two `w-[130px]` date boxes + 5 preset pills in one wrap row overflow ≤480px. *Blocks backend: No.*
- **R6 — `Messages` 768px boundary glitch.** Layout uses Tailwind `md:` (≥768) but the show/hide rules are `@media (max-width:768px)`; at exactly 768px the back button shows while panes are side-by-side. Align to 767/`md`. *Blocks backend: No.*
- **R7 — `FormDocument` NCIC teletype panel** uses `maxHeight:'62vh'` inner scroll nested inside the page scroll (double scrollbars on mobile) and fixed-px paper cells overflow narrow screens. *Blocks backend: No.*
- **R8 — Dense nav overflow on laptops.** `ActionBar.jsx:499` — admin/LEO nav (13 items) uses scrollbar-hidden `overflow-x-auto` and only collapses to hamburger at `lg`; at ~1024–1300px items scroll into a hidden region with no affordance. Add a "More" menu or visible scroll cue. *Blocks backend: No.*

---

## 7. Accessibility issues

- **A1 — Icon-only buttons have no accessible name (systemic).** The admin tree has ~6 ARIA attributes total; `AdminKit.jsx:177` `SonIconBtn` (reused for edit/delete/reorder across ~25 sections), `CustomRecords` `IconBtn`, `CivilianForms`/`HelpEditor` `MiniBtn`, `ActionBar` bell (`:333`)/clear-all (`:364`)/dismiss (`:400`), `FDOTPermits.jsx:246/257`, and the various `✕`/`×` text-glyph close buttons rely on `title` only (not a reliable accessible name). **Default `aria-label` from `title` in the shared icon-button primitives** — one fix covers most of the app. *Blocks backend: No.*
- **A2 — No focus trap / focus restore in any modal.** Shared `Modal.jsx:47` handles Escape but never traps Tab or restores focus to the trigger; the five hand-rolled modals (H6) lack even Escape. `RecordsBureau` `ImageLightbox` (`:189`) has no Escape at all. *Blocks backend: No.*
- **A3 — Nav/notification dropdowns are mouse-only and non-semantic.** `ActionBar.jsx:100–414` — the three dropdowns open on click but close only via `onMouseLeave` timers (no outside-click, no Escape) → stuck open on touch/keyboard; no `role="menu"/menuitem`, `aria-expanded`, or arrow-key nav; notification rows are `<div onClick>` (`:382`). The mobile drawer (`:534`) has no `role="dialog"`/`aria-modal`/focus trap/Escape. *Blocks backend: No.*
- **A4 — Clickable `<div>`s instead of buttons (21 across 14 files).** List rows in `CivilianRegistry.jsx:122`, `ReportsCenter.jsx:500`, `RecordsCenter.jsx:384`, `CustomRecords` `RecordListPanel:569`, `AdminBusinesses:187`, `Accounts` status toggle (`<span onClick>` `:54`), and LiveMap SVG markers (`<g onClick>` with no `tabIndex`/`role`). Not keyboard-focusable/activatable. Use `<button>` or add `role="button"`+`tabIndex`+key handler. *Blocks backend: No.*
- **A5 — Color-only / low-contrast status signaling.** `StatusBadge.jsx`/`statusColors.js`: `AVAILABLE` and `ARRVD` are the **same** `#4ade80` (text differs but color collides), and white text on light fills (`#4ade80`, amber) is sub-AA. License/priority bars (`LicensePoints`, `CivilianHome` license card) and 911/service toggles (`aria-pressed` missing) lean on color alone. Add icons/labels + fix contrast. *Blocks backend: No.*
- **A6 — Custom checkbox not operable / unlabeled inputs.** `MedicalRecords.jsx:84` `CheckToggle` is a `<div onClick>` with no input/role/keyboard; `FormDocument.jsx:92` `FormCell` labels aren't associated (`htmlFor`/`id`); native checkboxes render near-invisibly (`accentColor:'#000'` on near-black). Portal/business label `<div>`s likewise unassociated. *Blocks backend: No.*
- **A7 — Meaningful images with empty `alt`.** Mugshot/ID lightbox `RecordsBureau.jsx:194`, character avatars `MyCharacters.jsx:186/308`, `MyAccount.jsx:160`, `CivilianHome.jsx:186` use `alt=""` on load-bearing identity images. Use `alt={fullName}`/"Enlarged mugshot". *Blocks backend: No.*
- **A8 — Weak global focus ring.** `index.css:147` `*:focus-visible { outline: 1px solid #1060a8; }` — 1px low-contrast outline is easy to miss on the dark theme. Thicken/raise contrast (e.g. 2px + offset). *Blocks backend: No.*

---

## 8. Animation / interaction issues

The animation layer is the strongest part of the app and is largely **good**: a complete keyframe set, `prefers-reduced-motion` honored globally, consistent easing tokens, `.press`/`.lift` micro-interactions, toast stack capping. Issues are minor:

- **AN1 — `LiveMap` marker positions jitter.** `LiveMap.jsx:157` derives missing coordinates from `Math.random()` during render, so markers re-randomize on every re-render (impure render, M12). Derive a stable position from `call.id` or memoize. *Blocks backend: No.*
- **AN2 — `setState`-in-effect cascades (10×).** `Modal.jsx:24`, `ActionBar.jsx:450`, `CivilianContext.jsx:39`, `DispatchCenter.jsx:187`, `OfficerProfile.jsx:132`, `RecordsCenter.jsx:85`, `ReportsCenter.jsx:120`, `Departments.jsx:62`, `FileReport.jsx:55`, `MedicalRecords.jsx:411` — synchronous `setState` inside effects (ESLint `react-hooks/set-state-in-effect`) causes an extra render each. Mostly cosmetic perf, but `MedicalRecords:411` also has a stale-dep warning. *Blocks backend: No.*
- **AN3 — Autoplay tones silently fail.** `RadioToast.jsx:7` / panic tones construct `new Audio().play()` with errors swallowed; browsers block autoplay until a user gesture, so dispatch alert audio may never sound and there's no mute/enable affordance. *Blocks backend: No.*
- **AN4 — No loading affordance on async-feeling actions.** Avatar/image resize (`OfficerProfile.jsx:161`, `MyCharacters`) and the mock login delay show no spinner during processing. *Blocks backend: No.*

---

## 9. Backend handoff concerns

These are the things that will bite specifically *when Steve wires the API* — beyond the excellent `HANDOFF.md`.

1. **No loading or error states anywhere (systemic).** Every screen reads synchronously from the reducer and renders immediately. There are good *empty* states, but **zero** skeletons/spinners and **no** error UI. On an async API: (a) every list flashes its empty state ("You have no records") during fetch, reading as "you have none"; (b) any fetch error has no surface. **Add a loading/error contract now** — at least at the `AuthShell`/`Outlet` and per-list level. *(C1 is the acute version: hydration order also crashes the Command Portal.)*
2. **C1 hooks bug triggers on hydration** — fix before any async data.
3. **Wrong notification read/clear semantics** (H13) will carry into the API as a multi-user bug.
4. **Data-integrity defined by the frontend**: auto-derived `summary` (M3), string-matched subject linkage (M4), presence-only validation on SSN/plate/phone/Discord-ID/points/colors/URLs (M2, H15–H17, `PenalCodeEditor:55`, `BanManagement:30`). Decide the canonical field shapes/validation before persisting.
5. **Client-side "auth"/permissions are display-only**: `Authenticate.jsx` owner re-auth, `ActivePanicsPanel` clear-gating, `DutyGuard` clock-out on `beforeunload` (lossy). Mirror/enforce server-side.
6. **Optimistic IDs**: `Date.now()`/`Math.random()`/`nextId` generate IDs in 27 files; base64 data-URLs for photos/tones. Reconcile with server IDs and object storage (already noted in HANDOFF).
7. **Mock identities hardcoded** in `LoginPage.jsx` (names + a real-looking `discordId`) and `OFFICERS` seed — replace with the OAuth-resolved user.
8. **Bundle**: 3 MB / 854 KB-gzip single chunk, **no code-splitting** (`React.lazy`/`Suspense` count = 0). With a real network + auth, first paint on mobile is a multi-second blank with no loading screen. Route-level `lazy()` would cut this dramatically.
9. **Code health**: 128 ESLint errors (58 `no-unused-vars` dead code; 10 `rules-of-hooks`; 7 `purity`; 10 `set-state-in-effect`; 3 empty `catch`). Clean these before layering async complexity on top.

---

## 10. Steve's Handoff Checklist

### ✅ Ready for backend wiring (frontend won't need redesign)
- [x] **Action contract** — every mutation is a typed `dispatch({type,payload})`; `HANDOFF.md` catalogs all ~131 cases. The persistence-middleware approach in HANDOFF §5 is sound.
- [x] **Data model / entity shapes** — documented and consistent (`src/data/*`, HANDOFF §4).
- [x] **Routing** — all routes mounted, role landing pages, catch-all fallback; no dead nav targets.
- [x] **Design system** — tokens, buttons, badges, inputs, tables centralized; safe to extend without rework.
- [x] **Empty states** — present across portal + admin lists (just need to be distinguished from *loading*).
- [x] **Real-time-ready** — inbound socket events can reuse existing actions (HANDOFF §2.3).
- [x] **Read-receipt/UI-only actions** identified in HANDOFF (safe to skip server-side).
- [x] **`templateSnapshot`** persisted with filed docs (renders historical forms) — keep it.

### 🔧 Clean up *before* backend work begins
- [ ] **C1**: Fix Command Portal conditional hooks (move hooks above the early return). **Do this first.**
- [ ] **H13**: Make `MARK_NOTIFICATIONS_READ` / `CLEAR_NOTIFICATIONS` recipient-scoped.
- [ ] **Add loading + error states** (shell-level + per-list) so hydration/fetch-fail don't read as "empty"/crash.
- [ ] **Define validation + canonical field shapes** (SSN/plate/phone/Discord-ID/points/dates/colors/URLs) and replace auto-derived `summary` (M3) and string-matched subject linkage (M4) with explicit `civilianId`/narrative fields.
- [ ] **Reconcile duplicate-plate / false-success** (H11) — reducer must signal failure.
- [ ] **Replace mock identities** (LoginPage/OFFICERS) at the OAuth seam.
- [ ] **Reconcile the tow fleet model** (M5) before wiring tow endpoints.

### 🎨 Should fix for polish (not backend-blocking, but cheap and high-impact)
- [ ] Replace **all** native `alert()`/`confirm()` (H1–H4, C2) with toast + styled confirm `Modal`.
- [ ] **Standardize save feedback** on toast; delete the `setSaved` booleans (H5).
- [ ] **Migrate the 5 hand-rolled modals + native selects** to `ui/Modal` + `ui/Select` (H6, H7).
- [ ] **Add confirms** to all destructive single-click actions (H14).
- [ ] **Accessibility pass**: `aria-label` from `title` in icon-button primitives (A1), modal focus trap/restore (A2), dropdown ARIA + Escape/outside-click (A3), buttons-not-divs (A4), status color/contrast (A5), label associations + real checkboxes (A6), image `alt` (A7), stronger focus ring (A8).
- [ ] **Responsive**: convert fixed-px two-pane grids to responsive columns (R1–R3), table column-hiding on tablet (R4).
- [ ] **Code-split** routes with `React.lazy` + a `Suspense` loading screen (bundle item 8).
- [ ] **Clear the 128 ESLint errors** (dead imports, impure renders, set-state-in-effect, empty catches).

---

## 11. Final Verdict

### **Beta Frontend** — with a Backend-Ready *data layer*.

This is comfortably past "Prototype" and past a basic "Beta": it's broad, cohesive, and visually professional, and its **typed-action architecture + `HANDOFF.md` make the data/integration layer genuinely Backend-Ready.** What keeps the *product* at **Beta Frontend** rather than Backend-Ready overall is UI robustness: a latent **Rules-of-Hooks crash that fires exactly on backend hydration (C1)**, **no loading/error states**, **presence-only validation** that lets broken records through, **systemic accessibility debt**, and **four competing patterns for the same interactions**.

**Path to "Backend-Ready":** fix C1, add loading/error states, lock down validation + canonical field shapes, and fix the notification scoping (H13). That's a focused, well-bounded list — days, not weeks.

**Path to "Production-Polished":** the polish/a11y/responsive/lint cleanup in §10. Most of it is centralizable (icon-button `aria-label`, one confirm modal, one feedback channel), so the effort is far smaller than the issue count suggests.

> **Bottom line:** A strong, handoff-worthy front end with one must-fix crash bug and a clear, mostly-centralizable cleanup list. Fix the Critical + High items and Steve can wire the backend without redesigning the UI.

---
*Generated by a static + build + lint audit. Line numbers reference the audited commit on `claude/cad-frontend-audit-ZQK1s`.*
