# DIORAMA — Image Sorter

A local-first web app that sorts the Amriel reference archive into its 47-folder
taxonomy. Drop in a folder of images, the app classifies each one with Gemini
2.5 Flash, you confirm/override with the keyboard, then download a single ZIP
with everything filed into subfolders — **originals, full quality**.

This is the MVP wedge for the larger Amriel brand-architecture tool. The
classification engine (`src/lib/taxonomy.ts`) is written as a portable module so
it lifts straight into that app later.

---

## How it works

1. **Drop a folder of images** (or pick files). Originals are never modified.
2. The app makes a **small ~512px copy** of each image and sends only that to
   the classifier — faster, cheaper, and the only thing that leaves your machine.
3. **Perceptual-hash dedup** auto-flags duplicate images before they're classified.
4. You review each image: confirm the proposed folders, add/remove folder
   **chips**, or trash it. Fully keyboard-driven.
5. The app **learns** from your overrides in-session and feeds your recent
   corrections back into the prompt.
6. **Download** a ZIP — one subfolder per category, originals copied into each
   folder they were tagged with. Trashed/duplicate images go to `_TRASH`.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `Enter` | Confirm current folders |
| `T` | Trash (duplicate / not-Amriel) |
| `M` | Override to MISC |
| `A` | Add a folder (opens search) |
| `L` | Save for later (moves to end of queue) |
| `Z` / `⌘Z` | Undo last decision |

---

## Running it locally

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### The Gemini API key

The key lives **only on the server**, never in the browser. It's read from
`GEMINI_API_KEY` in `.env.local` (which is git-ignored — it will not be pushed).

1. Get a key at <https://aistudio.google.com/apikey> (the "API key", starts with `AIza`).
2. Copy `.env.example` to `.env.local` and paste your key:
   ```
   GEMINI_API_KEY=your-key-here
   ```
3. Restart `pnpm dev`.

> ⚠️ **Rotate any key you've ever pasted into chat, email, or shared anywhere.**
> Treat it as compromised and generate a fresh one.

---

## Deploying to Vercel (shareable link)

1. Push this repo to GitHub. `.env.local` is git-ignored, so your key is **not**
   committed.
2. Import the repo at <https://vercel.com/new>.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` with
   your key. (Optionally add `APP_PASSWORD` once a password gate is wired in.)
4. Deploy.

Because the deployed link is public, never put the key anywhere client-side —
it stays in the Vercel env var and is only used by `/api/classify`.

---

## Project structure

```
src/
├── app/
│   ├── api/classify/route.ts   # server-side Gemini call (holds the key)
│   ├── layout.tsx              # fonts (Fraunces display + Geist UI)
│   ├── globals.css             # the DIORAMA design system
│   └── page.tsx                # phase switch: upload → start → review → done
├── components/
│   ├── Dropzone.tsx            # folder/file upload
│   ├── ReviewStage.tsx         # the main keyboard-driven review screen
│   ├── SessionScreens.tsx      # start / checkpoint / done screens
│   ├── FolderSearch.tsx        # add-folder combobox
│   ├── Wordmark.tsx            # DIORAMA logo
│   └── icons.tsx
└── lib/
    ├── taxonomy.ts             # 47 folders, rules, few-shots, prompt builder ⭐ portable
    ├── useSorter.ts            # queue / classification / dedup / undo / stats
    ├── image.ts                # resize-for-model + perceptual hash
    ├── zip.ts                  # JSZip export
    ├── storage.ts              # learning loop + settings (localStorage)
    └── types.ts
```

---

## Notes

- **Privacy:** full-size images never leave your computer. Only a small preview
  is sent to Gemini for classification.
- **Large batches:** images are held in browser memory while you sort. For
  thousands at once, work in chunks (use the **Sort 30 / 50 / 100** buttons).
- **Rate limits:** Gemini's free tier has per-minute caps; the app surfaces a
  clear message if you're rate-limited.
