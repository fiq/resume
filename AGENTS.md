# AGENTS.md

## Purpose
This repository contains a personal resume/CV site and several historical or alternate HTML resume variants.

## Working Area
- Primary active files are under `cv/`.
- The current one-page variant is `cv/one-pager.html` with styles in `cv/one-pager.css`.
- `cv/index.html` is the EM / Staff+ CV.
- `cv/cto.html` is the Head of Engineering / Director+ CV.
- Other HTML files in `cv/` are alternate resume versions, experiments, or older layouts. Treat them as references unless the user names a specific file.
- Root-level PDFs are output artifacts or older exports. Do not edit binaries unless the user explicitly asks for regeneration or replacement.
- `resume_state.md` exists at the repo root and may be used as scratch state, but it is currently empty.

## Editing Rules
- Prefer minimal, targeted edits. Preserve the author’s wording unless the user asks for content changes.
- Keep this repo simple: plain HTML and CSS first. Do not introduce frameworks, bundlers, or package managers unless explicitly requested.
- Reuse existing structure and class names where practical instead of rewriting whole documents.
- When touching CSS, verify desktop and print behavior. Resume pages are likely intended for PDF export as well as browser viewing.
- Preserve external links, contact details, and employment chronology unless the user asks to change them.
- Expect resume content to be highly user-specific. If a fact looks inconsistent, flag it instead of silently “correcting” it.

## File Selection
- If the request says “resume”, “CV”, or “one pager” without naming a file, start with `cv/one-pager.html` and `cv/one-pager.css`.
- If the request is for an EM or Staff+ version, start with `cv/index.html`.
- If the request is for a Head of Engineering, Director, or senior leadership version, start with `cv/cto.html`.
- If the request mentions “latest”, check `cv/latest.html` and `cv/latest2.html` before assuming `one-pager` is the target.
- If the request is about the landing page, inspect the root `index.html` and `cv/index.html`.

## Verification
- For HTML/CSS changes, inspect the affected files directly and sanity-check for broken structure, missing closing tags, and obvious selector issues.
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
