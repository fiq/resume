# AGENTS.md

## Purpose
This repository contains a personal resume/CV site and several historical or alternate HTML resume variants.

## Working Area
- Primary active files are under `cv/`.
- The current one-page variant is `cv/one-pager.html` with styles in `cv/one-pager.css`.
- `cv/index.html` is the EM / Staff+ CV.
- `cv/cto.html` is the Head of Engineering / Director+ CV.
- Use `resume_content_cto.md` as the content source of truth for `cv/cto.html` and `resume_state.md` as the structural/editorial guidance.
- `cv/cto.html` uses an executive two-column layout: main narrative content on the left and compact supporting blocks in a right sidebar on desktop, collapsing to one column on mobile.
- Optimise `cv/cto.html` for roughly two printed pages where possible by keeping header spacing tight, sidebar sections compact, and supporting content out of the main column.
- Other HTML files in `cv/` are alternate resume versions, experiments, or older layouts. Treat them as references unless the user names a specific file.
- Root-level PDFs are output artifacts or older exports. Do not edit binaries unless the user explicitly asks for regeneration or replacement.
- `resume_state.md` exists at the repo root and may be used as scratch state, but it is currently empty.

## Editing Rules
- Prefer minimal, targeted edits. Preserve the author’s wording unless the user asks for content changes.
- Keep this repo simple: plain HTML and CSS first. Do not introduce frameworks, bundlers, or package managers unless explicitly requested.
- Reuse existing structure and class names where practical instead of rewriting whole documents.
- Preserve the role of each column in `cv/cto.html`: main column for summary/experience/earlier highlights/education, sidebar for compact supporting sections such as leadership focus, community, and technical foundations. Keep contact and profile links in the header unless the user asks to move them.
- Preserve the current CTO hierarchy: header with contact/profile links and credibility line, calmer section headings, compact sidebar cards, and a visually secondary education block.
- Keep `Technical Foundations` as a short sidebar block, not a full-width section, unless the user explicitly asks to change the layout.
- Do not duplicate contact details outside the header in `cv/cto.html`.
- When refining `cv/cto.html`, prefer tightening wording and spacing over removing roles. If print length is too long, compress bullets before changing the information architecture.
- Prefer print-only spacing/type adjustments before changing on-screen layout. If content must be tightened, shorten bullets rather than removing roles or major sections.
- When touching CSS, verify desktop and print behavior. Resume pages are likely intended for PDF export as well as browser viewing.
- Preserve external links, contact details, and employment chronology unless the user asks to change them.
- Expect resume content to be highly user-specific. If a fact looks inconsistent, flag it instead of silently “correcting” it.

## File Selection
- If the request says “resume”, “CV”, or “one pager” without naming a file, start with `cv/one-pager.html` and `cv/one-pager.css`.
- If the request is for an EM or Staff+ version, start with `cv/index.html`.
- If the request is for a Head of Engineering, Director, or senior leadership version, start with `cv/cto.html`.
- If the request mentions “latest”, check `cv/latest.html` and `cv/latest2.html` before assuming `one-pager` is the target.
- If the request is about the landing page, inspect the root `index.html` and `cv/index.html`.

## Script Workflow
- Use repository scripts rather than manual regeneration when possible.
- `pnpm build:cto` regenerates `cv/cto.html` from `resume_content_cto.md`.
- `pnpm build:staffplus` regenerates `cv/index.html` from `resume_content_staffplus.md`.
- `pnpm test:cto` runs CTO regeneration plus print-fit enforcement.
- `pnpm test:staffplus` runs Staff+ regeneration plus render/page-count check.
- `pnpm refresh:cto` and `pnpm refresh:staffplus` are the preferred full refresh aliases.
- `pnpm refresh:all` refreshes both CV outputs in one pass.
- Docker equivalents exist (`*:docker`), including `pnpm refresh:all:docker` for containerized rebuilds.
- The Docker image default command runs `pnpm refresh:all`; pass an explicit command to run a narrower target.

## Verification
- For HTML/CSS changes, inspect the affected files directly and sanity-check for broken structure, missing closing tags, and obvious selector issues.
- For `cv/cto.html` changes that affect spacing or density, verify the print result when feasible. A headless Chrome print-to-PDF check is the preferred repeatable validation path in this repo.
- If a local preview is needed, use a simple static server such as `python3 -m http.server` from the repo root, only if the user needs it.
- Mention when visual verification was not performed in a browser.

## Change Style
- Keep formatting consistent with the surrounding file.
- Avoid broad reformatting of large HTML documents unless that is part of the request.
- Add comments only when they clarify non-obvious structure or print-specific behavior.

## Safe Assumptions
- This is a hand-maintained document repo, not an application codebase.
- Small, reversible edits are preferred over architectural cleanup.
- When in doubt, optimize for readability, printability, and preserving the existing voice.
