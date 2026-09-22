# AGENTS.md

Rules for anyone — human or agent — working in this repo. The project-specific
section comes first and takes precedence; the portable **Engineering Guidelines**
below are the method underneath it.

---

## This repo in one screen

A single-page **experiment in LLM-generated SVG flowers**. Each flower is one SVG
a model produced; its header comment records the experiment data (model, author,
and the author's note on the process). Contributing is trivial: drop one `.svg` file into
`flowers/` and open a pull request. Clicking a flower opens a detail panel.

**Stack:** React + Vite + TypeScript. **Tests:** Vitest + Testing Library +
Stryker. **Deploy:** Netlify (native Git integration; PR Deploy Previews).

**Where the pieces live:**

| Path                         | Role                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `flowers/*.svg`              | The data. One flower per file; experiment fields in a header comment.                          |
| `src/flowers/parseFlower.ts` | The one pure module — parse + validate the header, reject unsafe SVG. **Mutation-tested.**     |
| `src/flowers/loader.ts`      | Glue — discovers `flowers/*.svg` via `import.meta.glob`. Pure parts split out and unit-tested. |
| `src/components/`            | `FlowerGrid`, `FlowerCard`, `FlowerDetailPanel`, `profileUrl` — presentation.                  |
| `tests/flowers.test.ts`      | The contribution gate — validates every real file in `flowers/`.                               |

**Conventions specific to this repo:**

- **The trust boundary is `flowers/`.** Anyone can submit a file, so
  `parseFlower` validates it and rejects XSS vectors (`<script>`, inline
  `on*=` handlers, `javascript:` URIs). Never weaken these without an equivalent
  safeguard. `dangerouslySetInnerHTML` is only acceptable because content passes
  through `parseFlower` **and** human PR review.
- **`parseFlower.ts` is the mutation-testing target.** After changing it, run
  `npm run mutation` and keep the score ≥ 80 (survivors equivalent or killed).
  It's listed in `stryker.conf.json`; don't add glue (loader/components/IO) there.
- **The flower contract is: 255×255 top-down, plus experiment data.** Every flower
  declares `viewBox="0 0 255 255"` and is drawn as if seen from above (a
  guideline, not machine-checkable). The header requires `name`, `author`,
  `model`, and `comment` (the author's note on the process); `github`
  is optional. All enforced by `parseFlower`.
- **`id` is a document-wide namespace, so every id is prefixed with its flower's
  slug.** The whole field is inlined into one page, which means `href="#id"` and
  `url(#id)` resolve to the first match in the document — not to the flower that
  declared it. A bare `id="petal"` in two flowers renders the wrong shape in the
  later one (and nothing at all when a gradient shadows a path). `parseFlower`
  can't see this — it validates one file at a time — so the cross-file check
  lives in `tests/flowers.test.ts` instead.
- **The field is a grid of plates; details live in the panel.** Each tile is
  captioned like a figure in a field guide — `Fig. N`, the flower's name, then
  `author · model`. The number is the flower's position in the field, assigned
  by `FlowerGrid`, so it renumbers as flowers are added. Clicking a plate opens
  `FlowerDetailPanel` (left side on desktop, full-screen on mobile) with the
  flower big + its experiment data. The panel is an accessible dialog (Escape closes, focus managed).
- **The contribution gate must stay green and must stay strict.** If you change
  the flower format, update `parseFlower.ts` + its tests, `tests/flowers.test.ts`,
  `CONTRIBUTING.md`, and the seed flowers together.
- **Keep contributing to one file.** Discovery is automatic via `import.meta.glob`
  — never introduce a manual registry a contributor has to edit.
- **Accessibility is non-negotiable:** flowers carry an `aria-label`; the sway
  animation is disabled under `prefers-reduced-motion`.

**Before you push:** `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build` — the same gate CI runs.

---

## Engineering Guidelines — the virtuous cycle of coding

> Project-agnostic. This repo's rules above take precedence; this document is the
> portable method underneath them.

---

### 1. Philosophy — the lazy senior developer

> **You are a lazy senior developer.** Lazy means efficient, not careless. The best
> code is the code never written.

Laziness, done right, is the engine of a **virtuous cycle**: the smallest correct
change creates the least surface to test, the fewest mutants to kill, the smallest
diff to review, and the least to maintain — so the next change is cheaper and the
codebase gets healthier, not heavier. Careless is the opposite: a small diff in the
wrong place is a second bug, not efficiency.

**Non-negotiables — never lazy about these:** understanding the problem; input
validation at trust boundaries; error handling that prevents data loss; security;
accessibility; real-hardware calibration (the platform is never the spec ideal — a
clock drifts, a sensor reads off); anything explicitly requested. These are the
floor; laziness operates above them.

---

### 2. The virtuous cycle

```
Understand → Decide the smallest sufficient change → Test first →
Prove the tests guard → Refactor simpler → Ship safely → Feed back → (Understand)
```

Each phase feeds the next: understanding lets you pick the truly smallest change;
minimal code is cheap to test; tests that pin behavior can be audited by mutation;
audited tests give confidence to refactor smaller; a small, well-tested diff ships
safely; and every bug fix returns to _Understand_ with a root-cause fix plus a
regression guard — so the next cycle starts from deeper knowledge and a stronger
net. That upward spiral is the virtuous cycle.

#### 2.1 Understand (the precondition, not optional)

The ladder below runs **after** you understand the problem, not instead of it. Read
the task and the code it touches; trace the real flow end to end; then climb. A
small diff you don't understand is just laziness dressed up as efficiency.

#### 2.2 Decide the smallest sufficient change — the Ponytail ladder

Before writing any code, stop at the **first rung that holds**:

1. Does this need to be built at all? (**YAGNI**)
2. Does it already exist in this codebase? Reuse the helper/util/pattern that's
   here — don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.

**Rules of the rung:**

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- **Deletion over addition. Boring over clever. Fewest files possible.**
- **Shortest working diff wins — but only once you understand the problem.** The
  smallest change in the wrong place isn't lazy, it's a second bug.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- When two stdlib approaches are the same size, pick the **edge-case-correct** one —
  lazy means less code, not the flimsier algorithm.
- Mark a deliberate simplification that cuts a real corner with a known ceiling
  (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the
  ceiling and the upgrade path (see §3.4).

#### 2.3 Test first — TDD

TDD is a **design discipline**, not a verification ritual: writing the test first
forces the interface and usage into the open before the implementation, producing
decoupled, testable code as a by-product.

**Red → Green → Refactor, one behavior per cycle:**

1. **Red** — write the smallest test for the next bit of behavior. Run it. Watch it
   fail **for the right reason** (an assertion failure or the expected error — a
   compile/import error is a _setup_ failure, not red; fix the setup and re-run).
2. **Green** — write the **simplest** code that passes. This is Ponytail rung 7 in
   action: minimal, not general. If you can't think of a test that needs the
   generalization, you don't need it yet.
3. **Refactor** — with tests green as a net, simplify (§2.5). Never mix refactor
   with new behavior — that's a new Red.

**Good tests:** one test, one behavior, named as behavior (`returns_X_when_Y`, not
`testFoo1`); Arrange-Act-Assert with the Act one line; **test behavior, not
implementation** (assert what it _does_, not which private helper it called);
edge cases as separate tests (empty, boundary, null, off-by-one, idempotent
re-call, error paths); fast & deterministic — isolate non-determinism (clock,
randomness, network, filesystem) behind seams; tests leave the world as they found
it (fresh state per test, `finally` cleanup for E2E).

**Levels — the pyramid:** unit (pure logic, in-memory, milliseconds) → integration
(your code wired to real runnable deps — a real in-memory DB, not a mocked one) →
E2E (full journey through the running system). **Don't mock what you don't own** —
mocks of your own code lie about whether it works; stub only external boundaries you
can't control.

**Prove the test can fail.** Code-first with a "passing" test proves nothing —
temporarily break the code and confirm the test fails for the right reason.

**The lazy floor — leave one check behind.** Non-trivial logic that wasn't TDD'd (a
quick fix, a script) still leaves **ONE runnable check**: the smallest thing that
fails if the logic breaks — an assert-based demo/self-check or one tiny test file,
no frameworks, no fixtures. Trivial one-liners need no test. Lazy code without its
check is unfinished.

#### 2.4 Prove the tests guard — mutation testing

Green tests prove the code works _now_; they do **not** prove the tests would catch
it _breaking_. Coverage measures "was this line run"; mutation measures "would a
change here be caught." Mutation testing audits the **tests**, not the code.

**The loop** (after a pure module's suite goes green):

1. Run the mutator scoped to that one file.
2. For each surviving mutant: **real gap** → write/sharpen a test that kills it
   (often a missing edge case or a weak assertion — `assertEqual` not
   `assertNotNull`, or a branch only one side is tested); **equivalent** → the
   mutation doesn't change observable behavior (e.g. `i += 1` vs `i = i + 1`), mark
   it ignored, don't chase it.
3. Repeat until only equivalents survive. Target **≥ 80% mutation score** on pure
   modules; treat a drop as a quality signal, not a per-commit gate.

**Scope to pure, deterministic code** (reducers, diff/patch engines, parsers,
validators, canonicalizers, business rules). **Don't mutate glue** (I/O, DB,
network, framework wiring, time/random-dependent code) — cover that with
integration/E2E; mutating it produces noise. Run nightly/on-demand, not every
commit (it's slow). Tooling: Stryker (JS/TS), mutmut / cosmic-ray (Python), PIT
(Java).

A high survivor count means your tests are shallow; mutation testing is the
diagnostic that tells you so. It is what closes the TDD loop.

> **In this repo:** the mutator is Stryker, scoped to `src/flowers/parseFlower.ts`
> (see `stryker.conf.json`). Run it with `npm run mutation`.

#### 2.5 Refactor simpler — boy scout

With audited-green tests as a net, leave the code cleaner than you found it: remove
duplication, rename to intent, simplify. **Deletion over addition; boring over
clever.** Run tests after each step. Every change shrinks the surface a little, so
the next cycle has less to understand and test.

#### 2.6 Ship safely

- **Understand impact before merging** — know the callers; use the project's
  impact/call-graph tool if there is one; report blast radius on risky changes.
- **Never blind-rename** — a rename must update every call site through a
  reference-aware tool, never find-and-replace.
- **Verify scope before committing** — confirm the diff touches only what you
  intended.
- **Don't bypass your own validation layer** — write through the API/loader that
  enforces invariants; never poke storage directly.
- **Destructive ops are triple-safe first** — back the data up out of the repo,
  confirm the source of truth is intact and recoverable, then proceed. Confirm
  before, not after.
- **External-API ethics** — never automate another person's credentials/2FA;
  respect rate limits and ToS; go human-paced on sensitive endpoints; stop on any
  access/limit wall; touch only data you're authorized to.

#### 2.7 Feed back — root cause restarts the cycle

Every bug report names a **symptom**, not a cause. A fix restarts at §2.1
_Understand_: trace the real flow, then fix the **shared function once** — grep
every caller of what you touch; one guard in the shared place is a smaller diff
than one per caller, and patching only the path the ticket names leaves a sibling
caller still broken. Leave the regression guard behind (the
failing-test-that-reproduced-the-bug, or the one check from §2.3). That guard is
what makes the next cycle safer — the virtuous cycle closes here and rises.

---

### 3. Pervasive standards (apply in every phase)

#### 3.1 Architecture — when the ladder says "build", build it complete

Whatever the stack, a data model (entity / resource / aggregate) is **unfinished**
until it has:

- **A full lifecycle surface:** create → read-one → update (partial) → delete →
  list (paginated). Every entry point self-documents (summary + grouping) so the
  generated docs read like a manual.
- **A wire-schema layer separate from storage.** Define input shapes (create /
  update) and output shapes (read / detail) explicitly; **never serialize internal
  / ORM objects directly** — go through a mapper. Storage evolves without breaking
  clients.
- **Referential integrity on delete.** Deleting a node first removes or nulls
  everything that references it — no dangling foreign keys. Centralize this in a
  helper.
- **Relationships are first-class CRUD.** An attributed edge/link (a join with
  metadata) gets flat, id-addressable create/read/update/delete of its own,
  editable from the UI where one exists.
- **Invariants enforced on write — create _and_ update.** Date ordering, uniqueness,
  status-machine rules: validate on create and re-validate the merged state on
  partial update.
- **Tests at every layer** for the above (§2.3).

> **In this repo** the "entity" is a flower and its lifecycle is a file in a Git
> repo: create/update/delete = a pull request that adds/edits/removes a file in
> `flowers/`; read/list = the build-time `import.meta.glob` in `loader.ts`. The
> wire-schema layer is `parseFlower` mapping raw SVG text → the `Flower` shape
> (never rendering raw file bytes as a model). Invariants (required fields, unique
> id, the `viewBox="0 0 255 255"` canvas, no unsafe content) are enforced on every
> write by the CI contribution gate.

#### 3.2 Naming

- English, always. Descriptive of purpose or behavior. Pronounceable, searchable.
  Meaningful distinctions (names must differ in a way that clarifies the
  difference).
- **No acronyms.** ≥ 3 characters unless very explicit with less.
- **Named constants instead of magic numbers.**
- Follow the language's case convention; mark private/internal per convention.
- Controlled vocabularies (enums / status sets) as named module-level constants,
  never inline strings; normalize aliases through one map in one place.

#### 3.3 Functions & structure

- Small, focused on a single task, descriptively named, few arguments, **no side
  effects** on state outside their scope.
- Make intent visible: extract conditions to named booleans, magic numbers to
  constants, blocks to named helpers; flatten with guard clauses. Name the _why it
  matters_ (`canAccessRecord`), never the operators (`ageAndConsentAndNotSuspended`).
- **Top-down flow — callers above callees**; related code close together;
  variables declared near their use; vertical separation of concepts.
- Configurable data **high** in the code (env/flags at the top, defaults co-located);
  limit over-configurability — avoid knobs that make the code unmanageable.
- **Law of Demeter** — a module knows only its direct dependencies. **Dependency
  injection** for clean, testable seams. Encapsulate boundary conditions in one
  place; no hidden dependence on internal state.

#### 3.4 Commenting

**Principle:** make the code explain itself; comment only what code _can't_ say;
delete the rest — **a stale comment is worse than none.**

**Ladder — stop at the first that works:**

1. Make it obvious in code (rename, extract, named constants so intent reads in the
   code itself).
2. Else comment the _why_ the code can't carry: a trade-off, a gotcha ("looks
   wrong, is correct because…"), a spec/RFC citation, a one-line public-API doc.
3. Else it's stale — delete it.

**Litmus test for any comment you keep:** _"If the code changed, would this comment
have to change too?"_ Yes → it's narration, delete (or rename to carry it). No →
it's anchored outside the code, keep it.

**Never in code:** algorithm walkthroughs (`// 1.… 2.…`), restatements (`// increment
i`), commented-out code, project history (ticket/sprint IDs → commits & tracker),
promissory TODOs (→ file an issue).

**Good comments (all pass the litmus test):** a file header with purpose + how to
run it + a pointer to the deciding design record; _why_-comments on non-obvious
correctness ("we don't fabricate a default — that would pollute data quality");
design-record references inline (`(ADR-NNN)`) so the long-form _why_ lives in one
durable place; lint-suppression markers _with the rule code_; one-line section
dividers; and the **`ponytail:`** marker for a deliberate simplification with a
known ceiling — naming the ceiling and the upgrade path, e.g.
`// ponytail: O(n²) scan — fine under ~10k rows; switch to an index when we cross that.`

**Length discipline:** a _why_ that needs more than ~3 short lines belongs in the
spec / ADR / commit message, not the code.

---

### 4. Definition of done

- [ ] Ponytail ladder climbed — YAGNI honored, no unrequested abstractions /
      dependencies / boilerplate; smallest sufficient diff in the _right_ place.
- [ ] Failing test written first and proven to fail for the right reason; non-trivial
      logic guarded by at least one runnable check.
- [ ] Pure modules touched: mutation score ≥ target, survivors equivalent or killed.
- [ ] Refactored simpler (boy scout); deliberate corners marked `ponytail:`.
- [ ] Impact understood; scope verified; no bypass of the validation layer;
      destructive ops triple-safe.
- [ ] Type-check + build clean; zero runtime warnings/errors in the client.
- [ ] Root cause fixed (not symptom); regression guard left behind.

---

_In one paragraph:_ Understand fully, then climb the Ponytail ladder to the
smallest sufficient change; test first (red-green-refactor, behavior not
implementation); audit those tests with mutation on pure modules; refactor simpler
under the green net; ship safely with impact understood and scope verified; fix
root causes and leave a regression guard so the next cycle starts from deeper
knowledge. Lazy means efficient — the best code is the code never written — and
never lazy about understanding, validation, security, or real-hardware calibration.
