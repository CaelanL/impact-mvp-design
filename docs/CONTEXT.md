# Impact360 — Context Brief

> Read this first. Then read PROJECT.md for the full spec, then MVP0-SPEC.md for what to build right now.

---

## What you're building and for whom

Impact360 is a management platform for LINC (Leaders in Every Community), a ministry incubator. LINC helps grassroots ministry leaders start and grow their ventures — think tutoring programs, community barbershops, meal ministries, homeless outreach — across ~6 US cities. The app helps LINC track the impact of these ventures, keep coaches and leaders connected, and generate reports for stakeholders.

**This is not a consumer app.** The users are ministry leaders, coaches, and organizational leadership. Many users have varying tech literacy — some don't have computers and will use phones. Design accordingly: big touch targets, simple flows, minimal clicks.

---

## The people involved

- **Ben** — CEO of LINC and the primary stakeholder. He's the one who wants this built. Not a developer or designer. Thinks in terms of ministry outcomes, not software. He'll be demoing this to a board on April 19–21, 2026.
- **Kate** — Helped create the wireframes. Also not a UX designer — the wireframes are hand-drawn notebook sketches. They're directional, not prescriptive. Don't follow them pixel-for-pixel.
- **Caelan** (the person you're working for) — The technical lead. Works in product/design at his actual job and is bringing that rigor here. He's the bridge between the ministry team and the software. Defer to his product instincts.
- **Andrea** — On the team, reviewing security.
- **4-person shared repo** — There are other engineers who will eventually work in this codebase. Write clean, conventional code. No clever tricks.

---

## Design philosophy

- **Modern SaaS, not churchy.** Clean, minimal, professional. Think Linear or Notion, not a church bulletin. Muted color palette, clear typography, no clip art or religious imagery in the UI itself.
- **The app should feel simple for a venture leader** who just needs to log in and submit their monthly numbers. But it should also feel powerful for Ben who needs to see everything at once.
- **Mobile-first thinking.** Many users will be on phones. Responsive is not optional.

---

## The key architectural decision: additive permissions

This was a deliberate choice. The alternative was a role toggle (switch between "I'm a coach" and "I'm a venture leader" views). We rejected that because:

1. It doesn't match reality — Josh in Milwaukee IS both a VL and a coach simultaneously, not one or the other.
2. It fragments the experience — you'd need info from both views at once sometimes.
3. It's confusing — "which mode am I in?"

Instead: **one app, one login, roles add surface area.** The left nav grows based on your roles. The dashboard stacks sections. Shared pages (Ventures, Reports) scope their content based on your permissions. A venture-leader-only user gets a dead-simple app. A CEO sees everything. No switching.

This affects how you build components: everything should accept a "scope" or "permissions" concept. Don't build separate Coach and VL versions of a page — build one page that adapts.

---

## The 3-bucket system (impact data)

Ventures submit impact data categorized into 3 buckets: **Social, Spiritual, Economic.** Each bucket has predefined metrics (people fed, baptisms, new jobs, etc.) but the specific metrics vary by venture type. A barbershop tracks haircuts. A meal ministry tracks meals. They both roll up into "Social impact" at the aggregate level.

This is messy by nature. Don't try to over-engineer it. The wireframes show predefined options per bucket with checkboxes — that's probably right for MVP. Just know that the data model needs to be flexible enough for different ventures to track different things within the same bucket framework.

---

## What exists already

- **Wireframes:** Hand-drawn, 8 pages, in `/home/caelanliu/linc-planning/`. They primarily show the Venture Leader view. Useful for the general page structure and the impact input flow. Don't treat them as final designs.
- **PROJECT.md:** The full living spec with roles, features, open questions, edge cases. Reference it heavily.
- **MVP0-SPEC.md:** The specific spec for what to build right now — a clickable prototype with hard-coded personas and role-adaptive views.

---

## What you're building RIGHT NOW (MVP 0)

A **frontend-only interactive prototype** in Next.js. No backend. No real database. Use in-browser local storage if you need any persistence (e.g., saving a note, toggling a setting). All user data is hard-coded.

The entry point is a **persona selector** — a grid of 6 fake users representing different role combinations. Click one, enter the app as them, see exactly what their experience looks like. There's a "Switch Persona" button in the header to go back.

**The purpose is NOT to build features.** It's to build the skeleton — the layout, the navigation, the page structures, the role-adaptive behavior — so the team can look at it and say "yes this is right" or "no, move this here." Buttons exist but don't do real things. Forms exist but don't save to a server. Reports don't generate real PDFs. The map is a placeholder. The point is the structure.

Build it component-first so that when we add real data and a real backend later, the components carry forward. This prototype WILL become production code. Don't write it like a throwaway.

---

## Tech stack

- **Next.js** (App Router)
- **Deploy on Vercel** (will be public since it's just a prototype)
- **In-browser local storage** for any lightweight persistence
- **No backend / no external database for MVP 0**
- Styling: use whatever is fast and clean — Tailwind is fine, CSS modules are fine, just keep it consistent

---

## Practical notes

- Don't get married to anything in the spec docs. Things are fluid. The team has been iterating fast and not everything is fully decided.
- Open questions in PROJECT.md are real open questions — don't guess at answers, just build around them or use sensible placeholder defaults.
- The wireframes use slightly inconsistent terminology (Director vs City Leader, different lifecycle stage names). Don't worry about it — just pick one version and be consistent.
- "Add Impact" is specifically for venture leaders to submit their own data. It's the main thing LINC wants VLs doing regularly. Don't bury it or make it complicated. It should be the most frictionless flow in the app.
- Signature Stories, AI summarization, gamification, and the training page are all Phase 2. Don't build them in MVP 0. They can appear as placeholder nav items or "Coming Soon" sections if it helps communicate the vision.

---

*Created: 2026-02-25*
