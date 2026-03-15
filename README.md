# Resume Repo

This repo contains HTML resume variants and supporting source content for Raf Gemmail's CV site.

## Main Files

- `resume_content_cto.md`: source of truth for the CTO / Head of Engineering resume
- `cv/cto.html`: generated CTO HTML output
- `cv/index.html`: EM / Staff+ variant
- `cv/one-pager.html`: one-page variant
- `cv/style.css`: shared styling, including print rules for `cv/cto.html`
- `scripts/regenerate-cto.mjs`: regenerates `cv/cto.html` from `resume_content_cto.md`

## CTO Workflow

Preferred path with the Nix flake:

```sh
nix develop --command pnpm refresh:cto
```

That command:

1. Regenerates `cv/cto.html` from `resume_content_cto.md`
2. Runs the print-fit check
3. Fails if the CTO resume exceeds 2 printed pages

If you are already inside the flake shell:

```sh
pnpm refresh:cto
```

## NPM Targets

- `pnpm build:cto`: regenerate `cv/cto.html`
- `pnpm test:cto`: regenerate and run the print-fit check
- `pnpm refresh:cto`: alias for the full CTO refresh path
- `pnpm test:print-fit`: run only the print-fit check against `cv/cto.html`

## Docker Workflow

Containerized CTO refresh:

```sh
docker build -t resume-print-fit .
docker run --rm -v "$PWD:/work" resume-print-fit
```

Or, if `pnpm` is available on the host:

```sh
pnpm refresh:cto:docker
```

## Browser Preview

Open the generated CTO HTML directly in Chrome:

```sh
google-chrome-stable cv/cto.html
```

## Notes

- The CTO generator is section-driven and validates required sections rather than depending on whole-document markdown ordering.
- For `cv/cto.html`, prefer print-only spacing and density changes before removing content.
- The target print layout for the CTO resume is 2 pages.
