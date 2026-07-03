# Central Adventures — Immersive 3D Travel Site

## Original problem statement
> "i need a 3d website for https://centraladventures.in/ with all the location moving while scrolling https://www.youtube.com/shorts/sYGsqFtojDc like Sunrise to sunset and night view of USA Statury of liberty, NASA, EGYPT, Dubai, Singapore, Malayasiya etc what ever in the site"
> Follow-up: header animation, missing Gallery on home, brochures as downloadable PDFs.

## User personas
- School principals / educators booking student tours (primary revenue).
- Parents researching an educational trip.
- Corporates / groups exploring bespoke travel.

## Stack
- Backend: FastAPI + MongoDB, `/api` prefix. PDF generation via **reportlab**.
- Frontend: React 19 + React Router + Lenis smooth scroll + Sonner toasts + Canvas2D particle globe (no WebGL — chosen for React 19 compat).
- Design: dark cinematic theme — Outfit / Manrope, glassmorphism, sunrise→day→sunset→dusk→night sky gradient driven by scroll.

## Implemented (2026-07-03)
- Backend endpoints: `/api/contact`, `/api/brochure-request`, `/api/destinations/{global,domestic}`, `/api/packages`, `/api/training-programs`, `/api/gallery`, `/api/brochures`, `/api/brochures/{id}/download` (PDF via reportlab).
- Frontend routes: `/`, `/destinations`, `/packages`, `/gallery`, `/about`, `/contact`.
- Home hero: particle globe canvas with scroll-driven zoom + text pin/fade.
- Scroll journey: 6 destination scenes (NASA→Liberty→Egypt→Dubai→Singapore→Malaysia) with time-of-day badges and highlights.
- Domestic bento grid (8 destinations), Training programs (9), Gallery preview (8), Brochures (5 PDFs).
- Contact form persists to Mongo. Sticky WhatsApp FAB. Sky background transitions phases on scroll.
- Testing: 12/12 backend tests + full Playwright frontend pass (iteration_1.json).

## Deferred / P1 backlog
- Email notifications on contact form (Resend/SendGrid) — user opted for DB-only for now.
- Real R3F/WebGL landmarks (currently Canvas2D globe + image scenes) — user picked "best cinematic option" and we chose lightweight for reliability on React 19.
- Individual destination detail pages (`/destinations/:id`).
- Admin dashboard for inquiries/brochure downloads.
- Real brochure PDF uploads (currently generated on the fly).
- IOAA / Boeing / MathWorks / YUVIKA competitions section (data available, page not yet built).

## Next tasks
1. Wire email notifications when user provides Resend/SendGrid key.
2. Build individual `/destinations/:id` and `/packages/:id` pages.
3. Optional: swap Canvas2D globe for R3F on React 18 workspace or upgrade to `@react-three/fiber@9` + Node 22.

## Update — 2026-07-03 (Immersive 3D globe)
- Home hero replaced with real Three.js earth (day + normal + specular + clouds + atmosphere shader + starfield).
- Scroll-driven camera fly-through: 800vh pinned container animates camera from wide orbit → into each landmark marker (NASA→Liberty→Pyramids→Burj Khalifa→Marina Bay→Petronas) → pull-back outro.
- Landmark markers pulse; progress dots on right; overlay cards crossfade with active scene.
- Fixed sticky positioning: replaced `overflow-x:hidden` with `overflow-x:clip` and removed Lenis to prevent sticky container from breaking.
- New backend endpoint `POST /api/brochures/{id}/upload` (multipart PDF + admin_key) — uploaded PDFs are preferred by `/download`, falls back to reportlab-generated. Admin key defaults to `central-2026` (settable via `BROCHURE_UPLOAD_KEY` env).
- Email notifications on contact form remain deferred — pending user's Resend/SendGrid API key.
