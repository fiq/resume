# Resume Repo

This repo contains HTML resume variants and supporting source content for Raf Gemmail's CV site.

## Main Files

- `resume_content_cto.md`: source of truth for the CTO / Head of Engineering resume
- `resume_content_staffplus.md`: source of truth for the Staff+ / senior technical leadership resume
- `cv/cto.html`: generated CTO HTML output
- `cv/index.html`: generated Staff+ HTML output
- `cv/one-pager.html`: one-page variant
- `cv/style.css`: shared styling, including print rules for `cv/cto.html`
- `scripts/regenerate-cto.mjs`: regenerates `cv/cto.html` from `resume_content_cto.md`
- `scripts/regenerate-staffplus.mjs`: regenerates `cv/index.html` from `resume_content_staffplus.md`

## CTO Workflow

Preferred path with the Nix flake:

```sh
nix develop --command pnpm refresh:cto
```

That command:

1. Regenerates `cv/cto.html` from `resume_content_cto.md`
2. Runs the print-fit check
3. Exports/validates using a desktop viewport so the PDF keeps the executive two-column layout
4. Fails if the CTO resume exceeds 2 printed pages

If you are already inside the flake shell:

```sh
pnpm refresh:cto
```

## Staff+ Workflow

Preferred path with the Nix flake:

```sh
nix develop --command pnpm refresh:staffplus
```

That command:

1. Regenerates `cv/index.html` from `resume_content_staffplus.md`
2. Runs a render check by printing the HTML to PDF with a desktop viewport
3. Reports the page count, but does not enforce a 2-page limit

If you are already inside the flake shell:

```sh
pnpm refresh:staffplus
```

## NPM Targets

- `pnpm build:cto`: regenerate `cv/cto.html` and export `cv/cto.pdf`
- `pnpm build:staffplus`: regenerate `cv/index.html` and export `cv/staffplus.pdf`
- `pnpm export:pdf:cto`: export `cv/cto.html` to `cv/cto.pdf`
- `pnpm export:pdf:staffplus`: export `cv/index.html` to `cv/staffplus.pdf`
- `pnpm test:cto`: regenerate and run the print-fit check
- `pnpm test:staffplus`: regenerate and run the Staff+ render check
- `pnpm refresh:cto`: alias for the full CTO refresh path
- `pnpm refresh:staffplus`: alias for the full Staff+ refresh path
- `pnpm refresh:all`: refresh both CV outputs in one pass
- `pnpm test:print-fit`: run only the print-fit check against `cv/cto.html`
- `pnpm test:print-fit:staffplus`: run only the render/page-count check against `cv/index.html`

The PDF export scripts use Playwright with a fixed desktop viewport so responsive layouts stay in desktop mode when written to PDF.

## Docker Workflow

Containerized refreshes:

```sh
docker build -t resume-print-fit .
docker run --rm -v "$PWD:/work" resume-print-fit pnpm refresh:cto
docker run --rm -v "$PWD:/work" resume-print-fit pnpm refresh:staffplus
docker run --rm -v "$PWD:/work" resume-print-fit pnpm refresh:all
```

Or, if `pnpm` is available on the host:

```sh
pnpm refresh:cto:docker
pnpm refresh:staffplus:docker
pnpm refresh:all:docker
```

## Browser Preview

Open the generated CTO HTML directly in Chrome:

```sh
google-chrome-stable cv/cto.html
```

## Notes

- The CTO generator is section-driven and validates required sections rather than depending on whole-document markdown ordering.
- The Staff+ generator follows the same section-driven approach and supports the Staff+ heading variants used in `resume_content_staffplus.md`.
- For `cv/cto.html`, prefer print-only spacing and density changes before removing content.
- The target print layout for the CTO resume is 2 pages.
- The CTO PDF should preserve the desktop two-column layout, with supporting blocks such as `Technical Foundations` remaining in the right sidebar.
- The Staff+ resume is not constrained to 2 pages.
