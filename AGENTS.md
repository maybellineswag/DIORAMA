<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DIORAMA Image Sorter

Local-first Next.js (App Router) app that sorts the Amriel reference archive
into a 47-folder taxonomy using Gemini 2.5 Flash. See `README.md` for the full
overview and `amriel-sorter-context.md` for the original product spec.

## Key facts
- **The Gemini key is server-only.** It lives in `GEMINI_API_KEY` (`.env.local`,
  git-ignored) and is used only in `src/app/api/classify/route.ts`. Never expose
  it to the client or prefix it with `NEXT_PUBLIC_`.
- **`src/lib/taxonomy.ts` is the portable engine** (folders, rules, few-shots,
  prompt builder + response schema). It's intentionally framework-agnostic so it
  can move into the larger brand-architecture app later.
- **`src/lib/useSorter.ts`** owns all app state: queue, classification,
  perceptual-hash dedup, undo, sessions, stats, ZIP export.
- Originals are never modified — only a ~512px copy is sent to the model; the
  full-quality original is what goes into the downloaded ZIP.
- The `skills/` folder is excluded from TypeScript checking (see `tsconfig.json`).

## Commands
- `pnpm dev` — local dev at http://localhost:3000
- `pnpm build` — production build (runs type-check)
- `pnpm lint` — ESLint
