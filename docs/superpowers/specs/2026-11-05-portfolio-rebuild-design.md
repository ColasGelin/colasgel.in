# Portfolio rebuild: design

Date: 2026-11-05
Status: awaiting review

## Goal

Replace colasgel.in with a one-page site that lets a hiring team see all of Colas Gelin's work at first
glance and try samples of it directly on the page.

**Audience:** hiring teams for junior-to-mid roles: AI/LLM, applied AI, ML, Python/TS backend, AI + security,
and full-stack with AI.

**Success criteria:**
- Within 30 seconds, a recruiter knows what Colas has built, the current role, and availability.
- Every featured project, job, and the school entry is reachable from the first screen.
- At least two samples run live in the browser, with no server.
- Every claim on the site can be traced to the CV or a repo.

## Page structure

One page, with no intro animation and no separate project pages.

1. **Header:** "Colas Gelin", "AI Engineer", a one-line summary of the work, "Available January 2027 · Málaga
   or remote EU", and links to GitHub, LinkedIn, and email.
2. **Work area:** filter row, then the entry list on the left and the stage on the right.
3. **Compact block:** skills, spoken languages, and certifications.

The header starts large and shrinks to a thin sticky bar after a short scroll, or on the first click on a row or
filter. It stays compact under reduced motion. Each entry has at most 3 short points and 4 stack tags.

**Filters:** All · Work · Projects · Hackathons · 42. Filters are labels, so an entry can belong to several.
All is the default, and CyberBridge is selected on load. Selecting a filter that hides the current entry
selects the first visible entry.

**List row:** name, one-line description, and an origin tag (`work`, `42`, `personal`, or `1st place`).

**Stage:** title, sample-type label (`Live`, `Recorded run`, `Diagram`, or none), the sample, what was built,
stack, and a repo or site link when one is public.

**Phone (below 768px):** the list becomes an accordion, and the sample opens inside its row. Only one row is
open at a time.

**Look:** dark and technical: near-black background, monospace details, one accent colour.

## Entries

Listed in All order. Filter membership is in the last column.

| Entry | Tag | Stage | Link | Filters |
|---|---|---|---|---|
| CyberBridge, Sherpa Tribe (Dec 2025 – Present) | work | Diagram | none | Work |
| Inception-of-Wisdom | 42 | Diagram | none | Projects, 42 |
| Inception-of-Context | 42 | Diagram | none | Projects, 42 |
| Re-Fresh, NASA Space Apps Málaga | 1st place | Live | github.com/ColasGelin/Re-fresh.earth | Hackathons |
| Lanoria Hackathon | 1st place | Text, then recorded | github.com/ColasGelin/Hackathon-LaNoria | Hackathons |
| MLOps-Waiting-Queue | personal | Static images | github.com/ColasGelin/MLOps-Waiting-Queue | Projects |
| jobcopilot | personal | Recorded run | github.com/ColasGelin/jobcopilot | Projects |
| Learn2Slither | 42 | Live | github.com/ColasGelin/Learn2Slither | Projects, 42 |
| AI Integration Developer, CumarAI (Sep 2024 – Mar 2025) | work | Text | none | Work |
| Inception-of-Things | 42 | Text | github.com/ColasGelin/Inception-of-Things | Projects, 42 |
| Total-Perspective-Vortex | 42 | Text | github.com/ColasGelin/Total-Perspective-Vortex | Projects, 42 |
| 42 School, RNCP 7 (Master's level), Lyon then Málaga, Nov 2022 – expected May 2027 | 42 | Text | none | 42 |

Pizza Popote and the old "Work in progress" entry are dropped.

## Content rules

- Claims come only from `cv.yaml`, `cv-interview.md`, or the project's repo.
- NASA is always "1st place, NASA Space Apps Challenge, Málaga", never an unqualified first place.
- School is "RNCP 7 (Master's level), in progress, expected May 2027", never "Master" or "Bachelor" alone.
- Re-Fresh's simulation is labelled "approximate model". The site does not claim the planned ML model was
  built, and makes no air-quality claim.
- Learn2Slither is described as a Deep Q-Network.
- jobcopilot's test count is the README's figure, 440+.
- Lanoria's stack is the repo's: Next.js and Gemini. Team of 4 is stated. Colas's own part is added once
  confirmed, and left out until then.
- CyberBridge copy and diagram are described at CV level, with no product screens, and need Sherpa Tribe's
  review before publishing.
- Phone number, salary, and job-search filters never enter this repo. This repo is public.

## Samples

Each sample is a separate lazy-loaded component, fetched only when its entry is selected. If it fails to
load, the stage falls back to the entry's text and link. Animated samples start paused when the visitor has
reduced motion enabled.

- **Learn2Slither (live):** a 10×10 snake game driven by the trained network, with a slider across saved
  checkpoints (1, 10, 100, 30,000, and 50,000 sessions). Weights are exported to JSON, and the 24-value state
  function and forward pass are ported to TypeScript. A checkpoint that doesn't match the network shape is
  dropped. If fewer than three remain, the slider is replaced by a plain play control on the best one.
- **Re-Fresh (live):** a month picker, placeable green zones, and an average-temperature readout, using the
  Landsat grids and the repo's cooling approximation (up to -5 °C, fading to zero with distance). Grids are
  fetched one month at a time. The sample's initial download, including any city model, stays under 3 MB. If
  the 17.7 MB model can't be compressed to fit, the heat grid renders without buildings. Three.js loads only
  with this sample. The processed grid values are sanity-checked before use.
- **Diagram:** a small animated SVG showing a system's flow, used for CyberBridge and both Inception projects.
  A recorded run can replace it later by changing that entry's content only.
- **Recorded run:** plays a stored list of timestamped steps, with play, pause, and step controls. Used for
  jobcopilot now, and for Lanoria when real outputs are captured. Recordings contain real output only, with
  personal data removed.
- **Static images (MLOps-Waiting-Queue):** the repo's validation images with predictions, plus a short
  description of the agent. Replaced by a recorded run if one is captured.

## Architecture

- Rebuild in this repo with Next.js (current stable release, upgrading from 15.3.3), TypeScript, and Tailwind,
  as a static export with no server, API routes, or secrets.
- Old components, fonts, and 3D models are deleted, and stay available in git history.
- `src/content/entries.ts`: a typed array of all entries. Adding a project means adding one object.
- `src/content/profile.ts`: header, skills, and languages.
- `src/components/`: `Header`, `Filters`, `EntryList`, `Stage`, `ProfileBlock`.
- `src/samples/`: `Snake`, `ReFresh`, `Diagram`, `Replay`, `Gallery`, each behind a dynamic import.
- `Stage` selects the sample from the entry's `sample` field and knows nothing about any one sample.
- `public/samples/`: weights, grids, recordings, and images, all fetched on demand.

Filter and selected-entry state live in the page's client component, and neither is stored in the URL.

## Accessibility

The filters and list work by keyboard, the selected entry is announced to screen readers, and every visual
sample has a text equivalent in the stage.

## Testing

- Build and lint pass, and the static export contains no secrets or private data.
- Unit tests cover filter membership, fallback selection, and required fields on every entry.
- Snake tests compare the TypeScript forward pass against PyTorch output on fixture states.
- Cooling tests check the maximum drop and the fall-off to zero.
- Browser checks at desktop and phone widths cover each filter, each sample, the load-failure fallback, and
  reduced motion.

## Out of scope

- Skill filters, deep links to entries, separate project pages, a blog, and analytics.
- French and Spanish versions. The site is English only.
- Interests.
- A "Download CV" link, until a version without the phone number exists.
- Changes to hosting or to `pizzapopote.colasgel.in`.
- Fixing the CV itself. The differences found are recorded under Content rules.
