# PyTrek fonts

All fonts are free Google Fonts, loaded with Next.js's font loader
(`next/font/google`) in [src/app/layout.tsx](../src/app/layout.tsx). They're
downloaded at build time and served from PyTrek itself, so students' browsers
never contact Google and pages don't jump while fonts load.

## Roles

| Role | Tailwind class | Chosen font | Backup | Use for |
|---|---|---|---|---|
| App and teaching text (default) | `font-sans` | [Work Sans](https://fonts.google.com/specimen/Work+Sans) | [Manrope](https://fonts.google.com/specimen/Manrope) | Everything by default: lessons, buttons, forms |
| Ranger handwriting | `font-ranger` | [Architects Daughter](https://fonts.google.com/specimen/Architects+Daughter) | [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) | **Short bits only:** ranger notes, clue cards, story flavor, headings. Not instructions or error messages (handwriting is slow to read and harder for dyslexic readers). One weight only (no real bold). |
| Rogue AI agent / tech voice | `font-agent` | [Space Mono](https://fonts.google.com/specimen/Space+Mono) | [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) | The agent's messages, "terminal" moments |
| Student code | `font-mono` | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) | Code editor (CodeMirror), code examples, program output. Chosen for clear `0`/`O` and `1`/`l`/`I`. |

`<code>`, `<pre>`, and the CodeMirror editor automatically use the code font
(see [src/app/globals.css](../src/app/globals.css)).

## Emails

Most email apps (including Gmail) don't load custom fonts, so emails use
`'Work Sans', Arial, Helvetica, sans-serif` in
[src/lib/email-templates.ts](../src/lib/email-templates.ts). Readers with Work
Sans installed see it; everyone else sees Arial.

## How to swap a font (e.g. use a backup)

1. In `src/app/layout.tsx`, change the import and the loader, e.g. replace
   `Architects_Daughter` with `Patrick_Hand`. Google font names use
   underscores for spaces. Fonts with only one weight need
   `weight: "400"`; variable fonts (like Work Sans, Manrope, JetBrains Mono)
   don't need a weight.
2. Keep the same `variable:` name (e.g. `--font-architects-daughter`), or
   rename it and update the matching line in `src/app/globals.css`.
3. Run `npm run dev` and check the pages; then `npm run build`.

Available weights checked 11/18/2026: Work Sans, Manrope, and JetBrains Mono
are variable; Space Mono has 400/700; Architects Daughter, Patrick Hand, and
Share Tech Mono have only 400.
