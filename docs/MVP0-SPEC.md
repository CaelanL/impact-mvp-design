# MVP 0 — Interactive Prototype Spec

> Goal: A clickable, code-based prototype that lets the team experience the app as different users. No backend. No real auth. No working CRUD. Just layout, navigation, and role-adaptive views with placeholder content. This is a thinking tool, not a product yet.

---

## What This Is For

- Demo to the team: "this is what the app feels like for each role"
- Validate the additive permissions model — does it actually work when you see it?
- Surface layout/nav problems before we build real features
- Brainstorm: seeing it will spark better ideas than talking about it

---

## How It Works

### Persona Selector (replaces login)
Instead of real auth, the app opens to a **persona selector page**. A list of hard-coded users, each with a description of who they are and what roles they hold. Click one to enter the app as that person.

### Proposed Personas

| # | Name | Roles | Affiliate | Switcher? | Description |
|---|------|-------|-----------|-----------|-------------|
| 1 | **Maria** | Venture Leader | LINC | No | Runs "Hope Kitchen" in Chicago. Simplest experience. Single-org, single-role. |
| 2 | **James** | Coach | LINC | No | Coaches 3 VLs in Chicago. No venture of his own. Single-org. |
| 3 | **Josh** | Venture Leader + Coach | LINC | No | Runs "Milwaukee Barbers" AND coaches 2 others. Dual affiliate-role test. |
| 4 | **Sarah** | City Leader (platform) | — | Yes (LINC / Grace Church) | Oversees Chicago. Sees LINC ventures AND Grace Church via the org switcher. |
| 5 | **David** | City Leader (platform) + VL (LINC) | LINC | Yes (LINC) | Leads Milwaukee AND runs his own venture. Dual-layer test (platform + affiliate). |
| 6 | **Ben** | Director (LINC) + Platform Owner | LINC | Yes (LINC / Grace Church / Platform) | The god-view. Can switch between affiliate views and a platform-wide view. |
| 7 | **Pastor Mike** | Director | Grace Church | No | Runs Grace Church Chicago. Affiliate-only — no awareness of LINC or the platform. |

> These personas test: single-role affiliate users (Maria, James), dual affiliate roles (Josh), platform roles (Sarah, David), the platform/affiliate overlap (Ben), and a fully isolated affiliate director (Mike).

### Org/Affiliate Context Switcher

The prototype includes a **Slack/Vercel-style context switcher** in the sidebar. This is how platform-level users navigate between affiliates.

**How it works:**
- Appears between the logo and nav items in the sidebar
- Only visible to users with access to multiple affiliates or platform roles
- Affiliate-only users (Maria, James, Josh, Mike) never see it — their world is their org
- Switching context re-scopes shared pages (Ventures, Dashboard, Reports) to the selected affiliate
- Platform pages (My City, All Cities, Platform Admin) always show cross-org data

**Who sees what in the switcher:**
- **Sarah** (City Leader): LINC, Grace Church (affiliates in her city)
- **David** (City Leader): LINC (only affiliate in Milwaukee)
- **Ben** (Director + Platform Owner): LINC, Grace Church, Platform View

**Test data:**
- 2 affiliates: **LINC** (7 ventures across Chicago + Milwaukee) and **Grace Church Chicago** (2 ventures)
- Grace Church has a Director (Mike), 2 Venture Leaders (Rachel, Kevin), and 2 ventures
- Sarah's city (Chicago) contains ventures from both affiliates — this is the cross-org test case

---

## Pages to Build

Every page below exists as a real route. Content is placeholder/hard-coded. Buttons and links exist but either navigate to other pages or do nothing (with a subtle "coming soon" state or just no-op).

### 1. Persona Selector (`/`)
- Grid or list of persona cards
- Each card shows: name, photo placeholder, roles (as badges), short description
- Click a card → enter the app as that person
- No password, no auth — just click

### 2. Dashboard (`/dashboard`)
- **Role-adaptive stacked sections:**
  - **"My Venture" card** — shows if the user IS a venture leader. Venture name, status badge (Accelerate/Build/Scale/Multiply), 3 impact circles (Social/Spiritual/Economic) with placeholder numbers, last submitted date.
  - **"My Leaders" card** — shows if the user is a Coach. List of assigned VLs with name, venture name, last submitted date, status indicator (green = submitted this month, yellow = overdue, red = way overdue). Placeholder data.
  - **"My City" card** — shows if the user is a City Leader. City name, # of coaches, # of ventures, city-level impact circles (aggregated placeholder numbers), list of coaches with quick stats.
  - **"All Cities" card** — shows if the user is a Director or Platform Owner. Grid of city cards, each showing city name, # ventures, health indicator. Scoped to the active affiliate context.
  - **"Platform" card** — shows if the user is Platform Owner. Lists all affiliates (LINC + Grace Church) with per-org stats.
- **Map placeholder** — a box that says "Map View — Coming Soon" or a static image
- **Quick action buttons:** Add Impact, Generate Report (non-functional, just present)

### 3. Ventures (`/ventures`)
- **If user has 1 venture (VL only):** redirects straight to that venture's profile
- **If user has multiple ventures in scope (Coach, City Leader, Director):** shows a list/grid of venture cards, scoped to the active affiliate context
  - Each card: venture name, leader name, city, status badge, last submission date
  - Click → goes to that venture's profile page
- **If user is also a VL:** their own venture is pinned to the top with a "My Venture" label, visually distinguished from the ones they oversee

### 4. Venture Profile (`/ventures/:id`)
- Mirrors the wireframe (page 3):
  - Venture name, cause, address
  - Leader name, role, contact info (placeholder)
  - Photo placeholder
  - Status dropdown (read-only for prototype, shows current stage)
  - Venture story/mission text
  - Venture photos (placeholder boxes)
  - Impact summary — 3 circles (Social, Spiritual, Economic) with placeholder numbers
  - Milestones section (placeholder — "Phase 2")
  - "See Venture Docs" button (navigates to training page or no-op)
  - "Generate Report" button (no-op)
  - "Add Impact" button (navigates to Add Impact page — only for VLs viewing their own venture, or coaches/directors viewing a venture they manage)
- **If viewer is Coach or above:** Notes section appears at the bottom
  - Placeholder coach notes (attributed, timestamped)
  - Placeholder director notes
  - "Add Note" button (no-op)
  - "AI Summary" placeholder

### 5. Add Impact (`/add-impact`)
- Only appears in nav for Venture Leaders
- Mirrors wireframe (page 4):
  - Month/year selector (hard-coded to current month)
  - Venture name shown (auto — this is your venture)
  - 3 tabs: Social | Spiritual | Economic
  - Each tab shows placeholder metrics with checkboxes and number inputs
    - Social: People Fed, Kids Tutored
    - Spiritual: Baptisms, Conversions, Gospel Conversations
    - Economic: $ Into Upside, New Jobs
  - Stewardship section: $ Raised / $ Spent
  - Save button → shows a mock review popup → "Congrats!" message
- **This page does NOT appear for coaches/city leaders/directors in the nav.** If they need to add data on behalf of a VL, that action would be on the venture profile page (a button that says "Add Impact for This Venture" — present but non-functional in MVP 0).

### 6. My City (`/my-city`)
- Only appears in nav for City Leaders (platform role)
- City name header
- **Coaches section:** list of coaches in this city with # of assigned ventures, activity indicator
- **Ventures section:** ventures in this city, filtered by the active affiliate context
- **City impact rollup:** 3 circles aggregated across visible ventures
- Click any coach → see their profile. Click any venture → venture profile page.
- When Sarah switches context (LINC → Grace Church), this page shows only that affiliate's Chicago ventures

### 7. All Cities (`/all-cities`)
- Only appears in nav for Director+ and Platform Owner/Admin
- Grid of city cards (one per city)
- Each card: city name, city leader name, # coaches, # ventures, health indicator
- Venture counts and impact stats scoped to the active affiliate context
- Click a city → goes to that city's view (same as My City page but for the selected city)

### 8. Reports (`/reports`)
- Mirrors wireframe (page 6):
  - Filter controls: by venture / city / region (dropdowns, functional enough to show different scopes)
  - Date range selector
  - "Generate Report" button → mock popup → placeholder PDF-like view
- **Filter scope adapts to role + context:** VL only sees their venture. Coach sees their ventures. Director sees their affiliate. Platform Owner in platform context sees everything.

### 9. Training (`/training`)
- Only appears in nav for Venture Leaders and Coaches
- Mirrors wireframe (page 5):
  - Program track progress bar (Accelerate → Builder → Sustainer → Multiplier → Network)
  - Current stage highlighted for the selected venture
  - "My Venture Documents" section with placeholder document cards
  - Actions/Reminders section with placeholder items

### 10. Network (`/network`)
- Mirrors wireframe (page 7):
  - Map placeholder (or static map image)
  - Search bar (non-functional)
  - Sample public venture cards showing the 3 privacy tiers
  - Status banner at top: "You are currently [Private/Discoverable/Connectable]"

### 11. Settings (`/settings`)
- Simple placeholder page
- Shows which settings tabs this user would have based on their roles
- Tabs are present but content is just "Coming Soon" placeholders
- VL: Account, Venture, Notifications, Network Visibility
- Coach: + Impact Metrics
- City Leader: + City Admin
- Director: + Org Admin, User Management
- Platform Owner/Admin: + Platform Admin

### 12. Platform Admin (`/platform-admin`)
- Only appears for Platform Owner and Admin
- List of affiliates (LINC + Grace Church) with per-org venture/user counts
- Platform-wide stats (total affiliates, cities, ventures, users)
- Not scoped by context — always shows the full platform view

---

## Nav Structure

Left sidebar, persistent. Icons + labels. Role-adaptive.

```
ALWAYS VISIBLE:
  Dashboard
  Ventures
  Reports
  Network
  Settings

CONDITIONAL:
  Add Impact        → only if user is a Venture Leader
  Training          → only if user is a VL or Coach
  My City           → only if user is a City Leader (platform role)
  All Cities        → only if user is a Director, Platform Owner, or Admin
  Platform Admin    → only if user is Platform Owner or Admin
```

**Sidebar also includes:**
- **Context switcher** (between logo and nav) — only for users with multi-org access. Shows current affiliate name, dropdown to switch. See "Org/Affiliate Context Switcher" section above.
- **User section** at bottom with name, email, "Switch Persona" button

**Top bar:**
- Current user's name + role badges
- "Viewing: [affiliate name]" indicator (only for users with the switcher)
- "Prototype Mode" badge

---

## Visual Direction

- **Clean, minimal.** Varying tech literacy across users — keep it simple.
- Muted, professional color palette. Not churchy/kitschy. Think modern SaaS.
- Clear typography hierarchy. Big labels. Obvious clickable elements.
- Mobile-responsive (many users may not have computers — noted in meeting)
- Placeholder data should feel realistic, not "lorem ipsum" — use real-sounding venture names, real city names, plausible numbers.

---

## Tech Approach

- **Next.js 16 (App Router), TypeScript, Tailwind 4** — deployed on Vercel
- **Frontend only** — no backend, no database, no API
- All data hard-coded in TypeScript constants (`src/lib/data.ts`)
- Two-layer role system: `affiliate_roles` (director, coach, venture_leader) and `platform_roles` (platform_owner, admin, city_leader) — see `ROLES-DEEP-DIVE.md`
- `ActiveContext` state in React context controls which affiliate's data is shown on shared pages
- Component-based — this prototype WILL become production code

---

## What This Intentionally Does NOT Include

- No real authentication / login
- No database or API calls
- No working form submissions (Add Impact save doesn't persist)
- No real map integration (just a placeholder box)
- No file uploads (Signature Stories, Training docs)
- No notifications / email
- No AI summarization
- No report PDF generation
- No search functionality (search bars exist but don't work)

---

## Success Criteria

After seeing this prototype, the team should be able to answer:
1. Does the additive nav model feel right? Or does it get confusing for multi-role users?
2. Is anything missing from the nav that we forgot?
3. Does the dashboard stacked-sections approach work, or is it too much for heavy multi-role users?
4. Do the venture profile and impact input pages feel right at a structural level?
5. Does the overall layout/visual direction feel appropriate for the user base?
6. Does the org switcher feel natural for platform users? Is switching context the right mental model?
7. Does the affiliate isolation feel right? Can Pastor Mike tell he's in a separate world from LINC?
8. When Sarah switches between LINC and Grace Church, does the city view make sense?

---

*Created: 2026-02-25 · Updated: 2026-03-03 (two-layer roles, org switcher, Grace Church test data)*
