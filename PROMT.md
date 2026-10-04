# Portfolio Website Prompt — Narongpol Chunu

## วิธีใช้ prompt นี้

ก๊อปตั้งแต่หัวข้อ **PROMPT START** ลงไปทั้งหมด วางใน Claude Code / Cursor / Lovable / v0 ได้เลย เขียนเป็นภาษาอังกฤษเพราะ AI generate โค้ดได้แม่นกว่า และเนื้อหา TH ในเว็บใส่ไว้ให้แล้วในส่วน i18n

ก่อนส่ง ให้เติมช่อง `[...]` เหล่านี้ก่อน (ถ้าไม่มีให้ลบบรรทัดนั้นทิ้ง AI จะใช้ placeholder แทน):

- [ ] ลิงก์ GitHub repo ของแต่ละโปรเจค (ถ้าเป็น private ให้ลบออก)
- [ ] Screenshot/วิดีโอหน้าจอของ live.action, race.action, Peanut Butter, map.action (วางไว้ใน `/public/projects/`)
- [ ] Feature ภายในของ live.action และ race.action ที่เห็นไม่ครบ (เขียนจากหน้าแรก + resume + เว็บบริษัทไว้ให้แล้ว ตรวจและเพิ่มได้)
- [ ] ลิงก์ LinkedIn / Facebook / Line (ถ้าต้องการ)
- [ ] ไฟล์ 3D นก `.glb` ถ้ามีอยู่แล้ว (ถ้าไม่มี prompt จะสั่งให้ AI สร้างแบบ procedural ให้)

แนะนำให้สั่ง AI ทำทีละ phase ตามลำดับที่ระบุท้าย prompt อย่าให้ generate ทั้งเว็บในครั้งเดียว โดยเฉพาะส่วนนก 3D ที่ต้องปรับจูนหลายรอบ

---

## PROMPT START — 1. Role & Project Overview

You are a senior creative frontend engineer specializing in award-winning portfolio sites (Awwwards / FWA level): scroll-driven storytelling, Three.js, GSAP ScrollTrigger, and refined typography. Build a complete, production-ready personal portfolio website for **Narongpol Chunu**, a Full-Stack Developer and third-year Computer Science student at Maejo University (Thailand), currently the sole developer of all web systems at **Action in Thai**, a sports-event management company (RFID timing, race registration, GPS route maps).

**Purpose of the site:** showcase 4–5 production web projects to recruiters and hiring managers for a Full-Stack Engineering internship/junior role. It must feel cinematic and memorable (a 3D bird that flies in on scroll and lands on the owner's name, kinetic typography on hover) while staying **minimal, calm, pastel, and highly readable**. Spectacle lives in motion, not in clutter: every section has generous whitespace, one clear focal point, and no decorative noise.

**Core experience in one paragraph:** The page opens with a huge word **PORTFOLIO** filling the hero. As the visitor scrolls, a 3D bird flies in from the far right edge of the viewport, the letters of PORTFOLIO morph into **NARONGPOL CHUNU**, and the bird glides down and perches on the name. Continued scrolling makes the bird flap its wings and travel along with the visitor through the About and Projects sections, until it eventually flies off-screen to the left as the Projects section ends. Every text block on the site reacts to the mouse with kinetic typography (letter scramble, liquid/water-drop ripple, weight/width shifts).

**Tone words for all design decisions:** airy, precise, soft, confident, Japanese-minimal meets Scandinavian pastel. **Anti-goals:** neon, glassmorphism overload, gradients on every card, more than 2 fonts, more than 3 accent colors, generic "developer dark mode" look.

**Deliverables:** a Next.js project that runs with `npm run dev`, deploys to Vercel with zero config, Lighthouse Performance ≥ 85 on desktop with animations enabled, fully responsive (mobile falls back to lighter animations), bilingual TH/EN with a toggle, and clean, commented, typed code organized by component.

## 2. Tech Stack & Project Setup

Use exactly this stack. Do not substitute libraries without stating why.

| Layer | Library | Why / how to use |
| --- | --- | --- |
| Framework | Next.js 15 (App Router, TypeScript, `src/` dir) | SSR for SEO, `next/font` for fonts, `next/image` for project screenshots |
| Styling | Tailwind CSS v4 + CSS variables for the design tokens | All colors/spacing via tokens so theme changes are one-file edits |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` | Bird model, lighting, `useGLTF`, `useAnimations`, `<Float>` for idle hover |
| Scroll animation | GSAP 3 + ScrollTrigger (`@gsap/react` `useGSAP` hook) | Single source of truth for all scroll timelines; drives both DOM and the Three.js bird via a shared progress value |
| Smooth scroll | Lenis (`lenis/react`) | Inertia scrolling, synced to GSAP ticker; required for a cinematic feel |
| Text splitting | GSAP SplitText (free in GSAP 3.13+) | Per-letter animation for the PORTFOLIO → NARONGPOL CHUNU morph and kinetic hover |
| Micro-interactions | Framer Motion (`motion`) | Hover states, page transitions, language toggle, cards |
| i18n | `next-intl` | TH/EN with `[locale]` routing, messages in `messages/en.json` and `messages/th.json` |
| Icons | `lucide-react` | Thin-stroke icons matching the minimal look |
| Analytics (optional) | `@vercel/analytics` | One-line add |

**Folder structure to generate:**

```
src/
  app/[locale]/layout.tsx, page.tsx
  components/
    canvas/   BirdScene.tsx, Bird.tsx, Lights.tsx, ScrollRig.tsx
    hero/     Hero.tsx, MorphingTitle.tsx
    kinetic/  KineticText.tsx, ScrambleText.tsx, RippleText.tsx
    sections/ About.tsx, Projects.tsx, ProjectCard.tsx, Experience.tsx, Skills.tsx, Contact.tsx
    ui/       Nav.tsx, LangToggle.tsx, Cursor.tsx, Footer.tsx
  lib/        scroll.ts (Lenis + GSAP sync), tokens.ts, projects.ts (project data)
  hooks/      useScrollProgress.ts, useReducedMotion.ts, useIsMobile.ts
messages/     en.json, th.json
public/
  models/bird.glb
  projects/   live-1.png, live-2.png, race-1.png, peanut-1.png, action-1.png, map-1.png
```

**Key architectural rule:** one global GSAP ScrollTrigger timeline per section exposes a normalized `progress` (0–1) into a Zustand store (`useScrollStore`). The Three.js bird reads `progress` inside `useFrame` and never creates its own ScrollTriggers. This keeps DOM text and the 3D bird perfectly in sync.

**Bird 3D asset:** `[If I supply public/models/bird.glb with a "Flap" animation clip, load it with useGLTF/useAnimations.]` If no model is supplied, build a stylized low-poly bird procedurally in R3F: a tapered ellipsoid body, a small sphere head with a cone beak, two wings as thin extruded planes pivoted at the shoulder joint, and a fan-shaped tail. Flap by rotating each wing group on its Z axis with a sine wave (`rotation.z = sin(t * flapSpeed) * amplitude`), with amplitude and speed driven by scroll velocity. Material: `MeshStandardMaterial` in soft off-white `#F4F1EA` with `roughness 0.9`, a `#D9E4F0` pale-blue underside, and `flatShading: true` for a paper-craft look that matches the pastel palette.

## 3. Design System

The palette is a lighter, softer evolution of the owner's résumé (navy `#2C4A6E` on white). Keep navy as the single text/ink color; everything else is pale. Define every value as a CSS variable in `globals.css` and mirror it in `tailwind.config`.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#F7F8FA` | Page background (not pure white) |
| `--surface` | `#FFFFFF` | Cards, nav |
| `--ink` | `#1F3553` | Headings, body text (deep navy, not black) |
| `--ink-soft` | `#5B6B80` | Secondary text, captions |
| `--primary` | `#4A6FA5` | Links, active states, bird perch glow |
| `--pastel-blue` | `#D6E4F5` | Section tints, hover washes |
| `--pastel-mint` | `#DDEFE8` | Accent for "Live / RFID" project |
| `--pastel-peach` | `#F8E3D6` | Accent for Peanut Butter game project |
| `--pastel-lavender` | `#E6E1F5` | Accent for race.action project |
| `--line` | `#E3E8EF` | 1px hairline dividers |

**Typography (2 fonts only, loaded with `next/font/google`):**

- Display: **Bricolage Grotesque** (variable weight 300–800, variable width) — the variable axes are what make the kinetic typography possible. Fallback: `Space Grotesk`.
- Body: **Inter** 400/500 for EN; **IBM Plex Sans Thai** 400/500 for TH (swap by locale via a `font-body` class). Thai line-height 1.8, EN 1.6.
- Hero word PORTFOLIO: `clamp(5rem, 18vw, 16rem)`, weight 800, letter-spacing `-0.04em`, color `--ink`.
- Section titles: `clamp(2rem, 5vw, 3.5rem)`, weight 600.
- Body: 1.0625rem desktop / 1rem mobile, max line length 65ch.

**Layout & spacing:** 12-column grid, max content width 1200px, side padding `clamp(1.25rem, 5vw, 4rem)`. Section vertical padding `clamp(6rem, 14vh, 10rem)`. Use whitespace instead of boxes; cards get a 1px `--line` border and 20px radius, no drop shadows except a 0 8px 32px rgba(31,53,83,0.06) hover lift.

**Motion principles:** easing `power3.out` for entrances, `expo.inOut` for morphs; durations 0.6–1.2s; everything scroll-scrubbed uses `scrub: 1` for a slight lag that feels physical. Nothing autoplays on a loop except the bird's idle breathing. Honor `prefers-reduced-motion`: disable scrub/bird/kinetic effects and show the final static state.

**Custom cursor:** a 10px `--ink` dot with a 36px hairline ring that lags 80ms behind; the ring expands to 64px and fills `--pastel-blue` at 40% opacity over links and project cards. Hide on touch devices.

**Nav:** fixed, transparent over the hero, gains `--surface` at 80% + `backdrop-blur(12px)` after 80px of scroll. Left: small monogram "NC". Right: About · Projects · Experience · Contact · TH/EN toggle. Active section underlined with a 2px `--primary` line that slides between items.

## 4. Hero + Bird Scrollytelling (the signature sequence)

The hero is a pinned section 400vh tall (`ScrollTrigger pin: true, scrub: 1`). The visible viewport stays fixed while scroll progress 0→1 drives the whole sequence below. One `<Canvas>` is mounted at the page root (fixed, full-screen, `pointer-events: none`, transparent background) so the bird can travel across sections without remounting. Implement each phase as a labeled segment on a single GSAP timeline; the bird reads the same `progress` from the store.

| Phase | Scroll progress | What the visitor sees |
| --- | --- | --- |
| 0 Load | before scroll | PORTFOLIO letters rise in from `y: 110%` with a 40ms stagger and clip-path reveal (0.9s). Subtitle fades in: "Full-Stack Developer · Chiang Mai, Thailand". A thin scroll cue: a 1px line that grows and shrinks + the word "scroll". Bird is off-screen at `x = +viewportWidth * 0.7` in world units, invisible. |
| 1 Bird enters | 0.00 → 0.30 | Bird flies in from the far right edge on a gentle S-curve bezier (`CatmullRomCurve3` through 4 points), wings flapping at ~3 Hz. It flies in front of the letters, scale grows 0.6→1.0 as it approaches (depth). The camera does not move; the bird does. Letters of PORTFOLIO start a subtle weight shift 800→500 to signal change. |
| 2 Title morph | 0.25 → 0.55 | PORTFOLIO morphs into NARONGPOL CHUNU: split both strings into chars; letters that exist in both (P,O,R,T,L,N) fly to their new positions with `expo.inOut`; letters that disappear (F,I) scramble through 6 random glyphs then fade out; new letters (A,G,C,H,U) scramble in from random glyphs to their final glyph. Second word CHUNU drops to a second line. Final name set in weight 700, slightly smaller than PORTFOLIO (`clamp(3.5rem, 12vw, 10rem)`) so two lines fit. |
| 3 Perch | 0.50 → 0.65 | Bird decelerates (ease-out), its flap amplitude drops to zero, wings fold with a 0.3s settle. It lands on the top-right corner of the letter **U** at the end of CHUNU (compute the DOM rect of that char, project into Three.js world space with `unproject`, re-calc on resize). A soft 24px `--pastel-blue` glow fades in under its feet. Head does a small 2-frame look-around (rotate Y ±15°). |
| 4 Rest | 0.65 → 0.85 | Bird idles with a 0.5 Hz breathing scale (1.0↔1.015). Below the name, a short tagline types in letter by letter: "I build real-time systems that thousands of runners trust on race day." Scroll cue fades out. |
| 5 Release | 0.85 → 1.00 | Hero unpins. The name scrolls up normally with the page; the bird lifts off with two strong flaps and begins following the visitor downward (see next phases). |

**After the hero (bird travel through the page, driven by a second timeline spanning About → Projects):**

- **About (progress 0 → 1 of About):** the bird glides in a shallow arc across the top third of the viewport from right to left, flapping only when scroll velocity > threshold (use Lenis velocity); when the visitor stops, it glides and slowly sinks 10px, like it's coasting. It never covers text: keep it in the empty column opposite the text block.
- **Projects:** the bird moves to the right margin and hovers beside each project card as it scrolls into view, dipping 20px toward the active card then rising. Between cards, 1–2 lazy flaps.
- **Exit (last 30% of Projects section):** bird banks left, scale shrinks 1.0→0.5, flaps hard (5 Hz), exits past the left edge of the viewport along a rising curve, and `visible = false`. From Experience onward there is no bird. Do not bring it back on scroll-up except by replaying the timelines in reverse via scrub (which happens automatically).

**Lighting:** one `directionalLight` at (5, 8, 5), intensity 1.2, with soft shadow only onto a transparent `shadowMaterial` plane under the perch position; one `hemisphereLight` sky `#F7F8FA` ground `#D6E4F5` intensity 0.6; `<Environment preset="studio" />` from drei at very low `environmentIntensity 0.25` for subtle specular. Tone mapping ACES, no bloom.

**Performance rules for the canvas:** `dpr={[1, 1.5]}`, `frameloop="demand"` plus `invalidate()` on scroll/Lenis tick and on bird animation; `gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}`; dispose geometry on unmount; on mobile (< 768px) render the bird at 60% scale and reduce the S-curve to a straight path; if `navigator.hardwareConcurrency <= 4` or `prefers-reduced-motion`, replace the canvas with a static inline SVG bird at the perch position.

**Mobile fallback for the hero:** the pinned height drops to 250vh, PORTFOLIO is `clamp(3rem, 20vw, 6rem)`, name wraps to 2 lines; the morph still runs but without scramble (plain crossfade) to save CPU.

## 5. Kinetic Typography (hover interactions)

Build one reusable `<KineticText effect="...">` component that wraps any heading or paragraph, splits it into chars with SplitText, and attaches a pointer-driven effect. Effects must be subtle enough that text stays readable at all times (never move a glyph more than 0.15em, never drop contrast below AA). Each section uses a different effect so the page feels alive without being repetitive.

| Effect name | Where it is used | Behavior on hover |
| --- | --- | --- |
| `scramble` | Section titles (About, Projects, Experience, Skills, Contact), nav links | Letters within 120px of the cursor cycle through 4–8 random glyphs from `A–Z0–9!<>-_\/[]{}—=+*^?#` at 30ms intervals, then resolve back to the real letter. Resolution ripples outward from the cursor. Uses a per-char `requestAnimationFrame` loop; cancels on `pointerleave`. |
| `weight-wave` | Big name NARONGPOL CHUNU (after the morph), project titles | Each char's `font-variation-settings: 'wght'` is interpolated by distance to cursor: 800 at the cursor falling to 500 at 200px (Gaussian falloff). Also `'wdth'` 100→85. Smooth with GSAP `quickTo` so it lags ~120ms like liquid. |
| `ripple` (water drop) | About Me paragraph, project descriptions | On `pointermove`, spawn a radial wave at the cursor: chars displace on Y by `sin(distance*0.08 - t*6) * 4px * falloff` for 900ms, like a drop hitting water. Max 3 concurrent ripples. On click, a bigger drop (8px amplitude) plus a 1px expanding circle outline fades from the click point. |
| `magnet` | CTA buttons, social links, email | The whole word translates up to 6px toward the cursor and the letters spread `letter-spacing` 0→0.05em; snaps back with `elastic.out(1, 0.4)`. |
| `liquid-underline` | All inline links | An underline drawn as an SVG path that wobbles (3 control points animated with noise) while hovered, then settles into a straight line. |
| `drip` | Footer wordmark "Narongpol Chunu" | Letters occasionally (every 4–7s, one at a time) stretch downward 1.4× via `transform: scaleY` with `transform-origin: top`, then a tiny circle "drop" detaches and falls 24px and fades, letter snaps back. Pauses while hovered; hovering a letter triggers its drip immediately. |

**Implementation notes:** all effects read pointer position from one global `useMousePosition` store updated by a single `pointermove` listener, not per component. Use `will-change: transform` only during active hover; remove afterwards. Measure char rects once on mount and on resize with `ResizeObserver`, not every frame. Thai text (TH locale) splits by grapheme cluster (`Intl.Segmenter`) so combining vowel/tone marks never separate from their base consonant; apply `weight-wave` and `ripple` to Thai but disable `scramble` for Thai strings (random Latin glyphs look wrong) — use `weight-wave` instead. On touch devices, replace hover effects with a once-on-view entrance animation (chars rise + fade in, 20ms stagger).

## 6. Page Sections (in order)

Page order: **Hero → About → Projects → Experience → Skills → Contact → Footer.** Each section is a `<section id>` with a scroll-triggered entrance (title chars rise, body fades up 24px, 0.8s) and a thin numbered label top-left (`01 — About`, `02 — Projects`...) in `--ink-soft` mono-spaced small caps.

**About (01):** two-column on desktop. Left column (5/12): the circular profile photo from `/public/profile.jpg` `[replace with your photo]`, 280px, with a 1px `--line` ring offset 12px, and a slow 20s rotating dashed ring behind it. Right column (7/12): heading "About me" (`scramble`), then this paragraph with the `ripple` effect:

> Third-year Computer Science student at Maejo University (GPA 3.33) and the sole Full-Stack Developer at Action in Thai, where I design, build and deploy the company's entire sports-event platform on AWS EC2: race registration with automated payment verification, real-time RFID race results, and GPS/GPX route tracking. Interested in AI/ML and looking for a Full-Stack Engineering internship where I can grow inside an experienced team.

Under it, three small stat pills that count up on view: **4** production sites · **1M+** runners on the Action platform (company-wide) · **2026** year joined Action. Keep the bird in the empty top-right area of this section.

**Experience (03):** a vertical timeline with a 1px `--line` rail and `--primary` dots that fill as they pass the viewport center. Items:

1. **Full-Stack Developer — Action in Thai** · 2026 – Present · Sole developer of all company web systems, from database schema to AWS EC2 deployment. Built race.action.in.th (registration + automated payment slip verification), live.action.in.th (real-time RFID results), map.action.in.th (GPS/GPX route tracking).
2. **Committee Member — CSMJU Studio, Maejo University** · 2024 – Present · Organized Computer Science department activities and events.
3. **B.Sc. Computer Science — Maejo University** · 2024 – Present · GPA 3.33.

**Skills (04):** no progress bars (they look dated). Instead a tag cloud in 4 groups, each tag a pill with a `magnet` hover; tags from the owner's résumé:

- Languages: Python, JavaScript, TypeScript, Go, Ruby
- Frontend: React, Next.js, Tailwind CSS, HTML, CSS
- Backend & Data: NestJS, REST API, MySQL, PostgreSQL, MongoDB
- Cloud, DevOps & Tools: AWS EC2, Docker, Git/GitHub, VS Code, Postman, DBeaver, Figma, Android Studio, IntelliJ IDEA, Claude Code

Below, a quiet one-line "Also:" row — Graphic design · Photography · Video editing · Drone piloting — set in `--ink-soft`.

**Contact (05):** full-width, centered. Heading "Let's build something" (`weight-wave`). Giant email link `narongpol.arm2561@gmail.com` as the focal point with `magnet` + `liquid-underline`; clicking copies to clipboard and shows a 1.5s "Copied" toast. Row of icon links: GitHub `https://github.com/MeowHito`, `[LinkedIn URL]`, `[Line/Facebook URL]`. Small text: Based in Chiang Mai, Thailand `[or Rayong]` · Open to internships from `[month/year]`. No contact form (avoid spam and backend).

**Footer:** wordmark "Narongpol Chunu" with the `drip` effect, © 2026, "Built with Next.js, Three.js & GSAP", and a back-to-top link that scrolls smoothly through Lenis.

## 7. Projects Showcase (02)

**Layout:** a horizontal-scroll gallery pinned on desktop (GSAP `pin` + `xPercent` scrub, 5 cards, each 70vw wide with 4vw gaps) so the bird can "fly along" the row; on mobile a normal vertical stack. Each card: a large browser-frame mockup of the screenshot (16:10, `next/image`, parallax 6% inside its frame), a pastel accent wash behind it (per project), title (`weight-wave`), one-line role tag, 2–3 sentence description (`ripple`), a row of tech pills, and two links: **Live site ↗** and **Code ↗** `[omit if repo is private]`. Clicking a card opens a full-screen case-study overlay (Framer Motion `layoutId` shared-element transition) with 3–4 screenshots, a "Problem → Solution → Result" layout, and a Close button. Store project data in `lib/projects.ts` as typed objects with `en` and `th` fields.

| # | Project | Live URL | Role · Year | Accent | Tech pills |
| --- | --- | --- | --- | --- | --- |
| 1 | RACETIME — Real-time RFID Results | https://live.action.in.th | Sole developer · 2026 | `--pastel-mint` | Next.js, TypeScript, WebSocket/SSE, PostgreSQL, AWS EC2, RFID |
| 2 | Race.action — Registration & Payments | https://race.action.in.th | Sole developer · 2026 | `--pastel-lavender` | React, NestJS, MySQL, REST API, Automated slip OCR, AWS EC2 |
| 3 | Action Map — GPS/GPX Route Tracking | https://map.action.in.th | Sole developer · 2026 | `--pastel-blue` | Next.js, Leaflet/Mapbox, GPX parsing, Docker |
| 4 | Peanut Butter — Web Games Platform | https://peanut-frontend-theta.vercel.app | Year-2 capstone · 2025 | `--pastel-peach` | Next.js, TypeScript, Tailwind, File upload (HTML/ZIP), Auth, Vercel |
| 5 | Action — Company Website | https://www.action.in.th | Developer · 2026 | `--pastel-blue` | HTML/CSS/JS, Material Icons, TH/EN, SEO |

**Copy for each card (EN; TH versions are in section 8). Edit facts you want to change — items marked `[verify]` were inferred from the public pages and the résumé:**

1. **RACETIME (live.action.in.th)** — Role tag: "Real-time results platform for running events". Description: "A live timing dashboard that turns RFID chip reads into instant results the moment a runner crosses the finish line. Organizers manage events and categories; runners and spectators search by bib or name, watch leaderboards update in real time, and switch between Thai/English and light/dark themes." Case-study bullets: Problem — results used to be published hours after the race; Solution — ingest RFID reader data, compute net/gun time and rankings per category `[verify]`, push updates to the browser without refresh; Result — used in production for Action's events in 2026 `[add number of events / runners if known]`. Features to list: event listing, per-event leaderboard, category & age-group ranking, bib/name search, split times at checkpoints `[verify]`, certificate / result sharing `[verify]`, dark mode, TH/EN.
2. **Race.action (race.action.in.th)** — Role tag: "Registration system with automated payment verification". Description: "End-to-end race registration: runners pick a distance and shirt size, upload a bank-transfer slip, and get verified automatically. Organizers see live registration counts, revenue and shirt-size breakdowns on a dashboard." Case study: Problem — manual slip checking took organizer hours per event; Solution — automated slip verification `[verify method: QR / OCR / bank API]`, real-time dashboard, export; Result — `[e.g. 100% automated payment confirmation, N registrations processed]`.
3. **Action Map (map.action.in.th)** — Role tag: "GPS/GPX route tracking". Description: "Interactive course maps built from GPX files: runners preview elevation and checkpoints before the race; organizers publish routes for every distance." `[add: live tracking? elevation profile? — verify]`
4. **Peanut Butter** — Role tag: "Year-2 capstone · community platform for indie HTML games". Description: "Upload an HTML or ZIP game, share it with the community, and play it straight in the browser with no installs. Includes accounts, a browse page with recent games, and a sandboxed in-browser player." Case study: sandboxing user-uploaded games in an iframe, ZIP extraction and static serving, auth and upload limits. `[team size / your part — fill in]`
5. **Action company site** — Role tag: "Marketing site for the Action sports-event platform". Description: "The public face of Action: Register, AI photo search, and live RFID results in one place. Bilingual, SEO-friendly, and tuned to load fast on mobile at race venues." `[delete this card if you did not build it]`

**Screenshots:** load from `/public/projects/<slug>-1.png` etc. If images are missing, render a tasteful placeholder: the project's accent color with the title in `--ink` at 20% opacity, never a broken image.

## 8. Bilingual TH/EN (next-intl)

Routes: `/en` (default) and `/th`, auto-detected from `Accept-Language` on first visit, remembered in a cookie. The toggle in the nav is a small two-letter pill (`EN | TH`) with a sliding indicator; switching keeps scroll position and does not reload the 3D canvas (keep `<Canvas>` outside the locale-dependent tree). The name NARONGPOL CHUNU and the word PORTFOLIO stay in Latin letters in both locales (the morph depends on Latin chars). All other UI strings and project copy come from `messages/*.json`. Thai text uses IBM Plex Sans Thai and the grapheme-safe splitting described in section 5.

Thai strings to put in `messages/th.json` (keep the English ones from sections 6–7 in `en.json`):

| Key | TH |
| --- | --- |
| `hero.subtitle` | นักพัฒนา Full-Stack · เชียงใหม่ ประเทศไทย |
| `hero.tagline` | ผมสร้างระบบเรียลไทม์ที่นักวิ่งหลายพันคนไว้ใจในวันแข่ง |
| `hero.scroll` | เลื่อนลง |
| `nav.about` / `nav.projects` / `nav.experience` / `nav.contact` | เกี่ยวกับ / ผลงาน / ประสบการณ์ / ติดต่อ |
| `about.title` | เกี่ยวกับผม |
| `about.body` | นักศึกษาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 มหาวิทยาลัยแม่โจ้ (GPA 3.33) และนักพัฒนา Full-Stack เพียงคนเดียวของ Action in Thai ดูแลตั้งแต่ออกแบบฐานข้อมูลจนถึง deploy บน AWS EC2 ทั้งระบบรับสมัครที่ตรวจสอบการชำระเงินอัตโนมัติ ระบบผลการแข่งขัน RFID แบบเรียลไทม์ และระบบติดตามเส้นทาง GPS/GPX สนใจด้าน AI/ML และกำลังมองหาโอกาสฝึกงานตำแหน่ง Full-Stack Engineer ในทีมที่มีประสบการณ์ |
| `about.stats` | เว็บไซต์ที่ใช้งานจริง / นักวิ่งบนแพลตฟอร์ม Action / ปีที่เริ่มงานกับ Action |
| `projects.title` | ผลงาน |
| `projects.live` / `projects.code` / `projects.caseStudy` | ดูเว็บไซต์ / ดูโค้ด / อ่านรายละเอียด |
| `projects.racetime.tag` | แพลตฟอร์มแสดงผลการแข่งขันแบบเรียลไทม์ |
| `projects.racetime.desc` | แดชบอร์ดจับเวลาที่เปลี่ยนสัญญาณชิป RFID เป็นผลการแข่งขันทันทีที่นักวิ่งเข้าเส้นชัย ผู้จัดจัดการงานและประเภทการแข่งขัน ส่วนนักวิ่งและผู้ชมค้นหาด้วยหมายเลข BIB หรือชื่อ ดูอันดับที่อัปเดตแบบเรียลไทม์ พร้อมสลับภาษาไทย/อังกฤษและโหมดมืด |
| `projects.race.tag` | ระบบรับสมัครพร้อมตรวจสอบการชำระเงินอัตโนมัติ |
| `projects.race.desc` | ระบบรับสมัครงานวิ่งครบวงจร นักวิ่งเลือกระยะและไซส์เสื้อ อัปโหลดสลิปโอนเงิน แล้วระบบตรวจสอบให้อัตโนมัติ ผู้จัดเห็นยอดสมัคร รายได้ และสรุปไซส์เสื้อแบบเรียลไทม์บนแดชบอร์ด |
| `projects.map.tag` | ระบบติดตามเส้นทาง GPS/GPX |
| `projects.map.desc` | แผนที่เส้นทางแข่งขันแบบอินเทอร์แอกทีฟจากไฟล์ GPX นักวิ่งดูความสูงและจุดเช็กพอยต์ล่วงหน้า ผู้จัดเผยแพร่เส้นทางของทุกระยะได้ในที่เดียว |
| `projects.peanut.tag` | โปรเจกต์จบปี 2 · แพลตฟอร์มชุมชนเกม HTML อินดี้ |
| `projects.peanut.desc` | อัปโหลดเกมแบบ HTML หรือ ZIP แชร์ให้ชุมชน และเล่นได้ทันทีในเบราว์เซอร์โดยไม่ต้องติดตั้ง มีระบบบัญชีผู้ใช้ หน้าเลือกเกมล่าสุด และตัวเล่นเกมแบบ sandbox |
| `projects.action.tag` | เว็บไซต์หลักของแพลตฟอร์ม Action |
| `projects.action.desc` | หน้าบ้านของ Action รวมระบบรับสมัคร ค้นหาภาพด้วย AI และผลการแข่งขัน RFID ไว้ในที่เดียว รองรับสองภาษา เป็นมิตรกับ SEO และโหลดเร็วบนมือถือที่สนามแข่ง |
| `experience.title` | ประสบการณ์ |
| `experience.action` | นักพัฒนา Full-Stack — Action in Thai · 2026 – ปัจจุบัน · นักพัฒนาเพียงคนเดียวของระบบเว็บทั้งหมดในบริษัท ตั้งแต่ออกแบบฐานข้อมูลจนถึง deploy บน AWS EC2 |
| `experience.csmju` | กรรมการ — CSMJU Studio มหาวิทยาลัยแม่โจ้ · 2024 – ปัจจุบัน · จัดกิจกรรมของภาควิชาวิทยาการคอมพิวเตอร์ |
| `experience.edu` | วท.บ. วิทยาการคอมพิวเตอร์ — มหาวิทยาลัยแม่โจ้ · 2024 – ปัจจุบัน · GPA 3.33 |
| `skills.title` | ทักษะ |
| `skills.also` | และยัง: ออกแบบกราฟิก · ถ่ายภาพ · ตัดต่อวิดีโอ · บังคับโดรน |
| `contact.title` | มาสร้างอะไรดีๆ ด้วยกัน |
| `contact.copied` | คัดลอกแล้ว |
| `contact.based` | อยู่ที่เชียงใหม่ ประเทศไทย · พร้อมฝึกงานตั้งแต่ `[เดือน/ปี]` |
| `footer.built` | สร้างด้วย Next.js, Three.js และ GSAP |
| `footer.top` | กลับขึ้นด้านบน |

SEO per locale: `<title>` "Narongpol Chunu — Full-Stack Developer" / "ณรงค์พล ชูนู — นักพัฒนา Full-Stack" `[ตรวจการสะกดชื่อไทย]`, `hreflang` tags for both, Open Graph image generated with `next/og` showing the name on `--bg`.

## 9. Performance, Accessibility & Acceptance Criteria

**Performance:** dynamic-import the entire canvas tree with `next/dynamic({ ssr: false })` and show a static SVG bird as the loading placeholder; lazy-load project screenshots below the fold; preload the hero font with `display: swap`; compress `bird.glb` with Draco (`useGLTF` with `draco` path) under 300 KB; total JS for the first route under 350 KB gzipped; no layout shift from the hero (reserve height with CSS). Kill all ScrollTriggers and Lenis on route change. Test at 60 fps on a mid-range laptop; if the bird drops below 45 fps for 2 seconds, auto-reduce `dpr` to 1.

**Accessibility:** all kinetic text keeps the real string in the DOM (effects use `aria-hidden` clones layered over a visually-hidden original) so screen readers and copy-paste work; PORTFOLIO → name morph exposes `aria-live="polite"` final text; color contrast ≥ 4.5:1 for body, ≥ 3:1 for large display text; focus rings visible (2px `--primary` offset 3px); keyboard navigation through nav, cards and links; `prefers-reduced-motion` disables pin/scrub/bird/kinetic and shows final states; language toggle has `lang` attributes.

**Responsive breakpoints:** 375 (mobile), 768 (tablet), 1024, 1440 (desktop), 1920. Horizontal project gallery becomes vertical below 1024. Bird hidden on `< 375` width. Test both locales because Thai strings run ~20% longer.

**Acceptance criteria — the build is done when all are true:**

- [ ] Hero pins, PORTFOLIO morphs into NARONGPOL CHUNU, and the 3D bird enters from the right, lands on the final U, idles, and lifts off exactly as in section 4
- [ ] Bird follows through About and Projects, never overlaps text, and exits left before Experience
- [ ] Scrolling backward reverses every animation smoothly (scrub), no snapping
- [ ] All 6 kinetic effects work on their assigned elements; text stays readable and copyable
- [ ] TH/EN toggle swaps all strings without reloading the canvas; Thai glyphs never break apart
- [ ] 5 project cards with working Live links, case-study overlay opens/closes with shared-element transition
- [ ] Lighthouse desktop: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95
- [ ] Reduced-motion mode shows a fully usable static site
- [ ] `npm run build` passes with zero TypeScript errors and deploys to Vercel

**Build in this order, one phase per request, and stop after each for review:**

1. Project scaffold, tokens, fonts, Lenis + GSAP sync, nav, empty sections, i18n routing with both JSON files
2. Hero text: PORTFOLIO entrance + morph to name (no bird yet)
3. Bird: procedural model (or GLB), lighting, perch on the U, phases 1–5 of the hero
4. Bird travel through About/Projects and exit
5. Kinetic typography component and all 6 effects
6. About, Projects (gallery + case-study overlay with the copy above), Experience, Skills, Contact, Footer
7. Mobile/reduced-motion fallbacks, performance pass, Lighthouse, deploy

After each phase, list what you built, any assumption you made, and what to check in the browser. Ask me before changing any color, font, copy, or the bird choreography.

**PROMPT END**