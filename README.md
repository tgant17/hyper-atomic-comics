# Dream Drive v2

Dream Drive now runs as a Next.js 15 application with a frontend button that summons a brand-new 4 panel comic on demand. The backend API route reuses the original Jimper modules to stitch together random panel assets, call OpenAI for dialogue, composite the panels with title text, upload the finished JPEG to Google Drive, and stream the result back to the UI.

- `app/page.jsx` renders the “Generate comic / Generate another” console.
- `app/api/generate-comic/route.js` is the API endpoint that orchestrates panel selection, OpenAI prompts, Drive uploads, and returns metadata plus a base64 data URI for instant previews.
- `modules/Jimper/lib/*` is the legacy comic-generation engine (Panels, Sheets, Helpers, OpenAI client, Drive client) reused by the new stack.
- `PANELz/` and `Backgrounds/` contain the full library of panels and background textures; the font files live under `fonts/`.

> **Artwork rights**  
> All illustrations, panels, and background assets in this repository are original works created by Caleb Gant. Do not reuse them without explicit permission. For inquiries, reach out to Caleb at **calebtisawesome@gmail.com**.

POSTING HERE: [Dream Drive](https://hyper-atomic-comics-gsvg.vercel.app/)
