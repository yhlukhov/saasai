<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Font and typography

- The implementation source of truth is [app/layout.tsx](app/layout.tsx) and [app/globals.css](app/globals.css): the app currently loads `Inter` with `next/font/google` and applies it to the root `<html>` element.
- Use the existing semantic typography tokens `font-sans`, `font-heading`, and `font-mono`; do not add arbitrary `font-family` declarations or introduce another font without updating the `next/font` setup and CSS theme aliases together.
- Keep the established hierarchy: compact `text-xl` or `text-2xl` headings, `text-lg` section/state titles, and predominantly `text-sm` body copy and controls. Use `text-muted-foreground` for supporting copy and metadata.
- Use `font-heading` in shared UI component title slots and `font-mono` for shortcuts and compact numeric values. The current mono token references `--font-geist-mono`, but no Geist font is loaded; do not assume a real Geist face is available.
- The README's Geist description is stale; follow the actual font loading and CSS tokens instead of copying that description into new code.
- When changing Next.js font loading, consult the installed Next.js guidance under `node_modules/next/dist/docs/`, then run `npm run lint` and `npm run build`.
