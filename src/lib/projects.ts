import type { Accent } from "./tokens";

/**
 * Project data that doesn't change between locales.
 * Translatable copy (title, tag, desc, problem/solution/result, featureList)
 * lives in messages/{en,th}.json under `projects.<key>`.
 */
export type ProjectKey = "racetime" | "race" | "map" | "peanut" | "action";

export type Project = {
  key: ProjectKey;
  /** Screenshot prefix: /public/projects/<slug>-1.png, -2.png … */
  slug: string;
  liveUrl: string;
  /** Omit when the repo is private. */
  codeUrl?: string;
  year: number;
  accent: Accent;
  tech: string[];
  /** Screenshot count available in /public/projects (0 = placeholder). */
  shots: number;
};

export const projects: Project[] = [
  {
    key: "racetime",
    slug: "live",
    liveUrl: "https://live.action.in.th",
    year: 2026,
    accent: "mint",
    tech: ["Next.js", "TypeScript", "WebSocket/SSE", "PostgreSQL", "AWS EC2", "RFID"],
    shots: 0,
  },
  {
    key: "race",
    slug: "race",
    liveUrl: "https://race.action.in.th",
    year: 2026,
    accent: "lavender",
    tech: ["React", "NestJS", "MySQL", "REST API", "Automated slip OCR", "AWS EC2"],
    shots: 0,
  },
  {
    key: "map",
    slug: "map",
    liveUrl: "https://map.action.in.th",
    year: 2026,
    accent: "blue",
    tech: ["Next.js", "Leaflet/Mapbox", "GPX parsing", "Docker"],
    shots: 0,
  },
  {
    key: "peanut",
    slug: "peanut",
    liveUrl: "https://peanut-frontend-theta.vercel.app",
    year: 2025,
    accent: "peach",
    tech: ["Next.js", "TypeScript", "Tailwind", "File upload (HTML/ZIP)", "Auth", "Vercel"],
    shots: 0,
  },
  {
    key: "action",
    slug: "action",
    liveUrl: "https://www.action.in.th",
    year: 2026,
    accent: "blue",
    tech: ["HTML/CSS/JS", "Material Icons", "TH/EN", "SEO"],
    shots: 0,
  },
];

/** Skills (from the résumé) — tag names are proper nouns, not translated. */
export const skillGroups = [
  { key: "languages", tags: ["Python", "JavaScript", "TypeScript", "Go", "Ruby"] },
  { key: "frontend", tags: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"] },
  { key: "backend", tags: ["NestJS", "REST API", "MySQL", "PostgreSQL", "MongoDB"] },
  { key: "cloud", tags: ["AWS EC2", "Docker", "Git/GitHub"] },
  {
    key: "tools",
    tags: ["Claude Code", "VS Code", "Postman", "DBeaver", "Figma", "Android Studio", "IntelliJ IDEA"],
  },
] as const;

export const contact = {
  email: "narongpol.arm2561@gmail.com",
  github: "https://github.com/MeowHito",
  githubHandle: "MeowHito",
  /** On the résumé, but kept off the public site by default (spam). Set to show it. */
  phone: null as string | null, // "099-153-5426"
  // linkedin: "[LinkedIn URL]",
} as const;
