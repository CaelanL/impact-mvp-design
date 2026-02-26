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

| # | Name | Roles | Description |
|---|------|-------|-------------|
| 1 | **Maria** | Venture Leader | Runs "Hope Kitchen" — a meal ministry in Chicago. She's new, in the Accelerate stage. Simple, clean experience. |
| 2 | **James** | Coach | Coaches 3 venture leaders in Chicago. Doesn't run his own venture. Sees his leaders, their data, his notes. |
| 3 | **Josh** | Venture Leader + Coach | Runs "Milwaukee Barbers" AND coaches 2 other venture leaders. The dual-role test case. |
| 4 | **Sarah** | City Leader | Leads the Chicago city. Oversees all coaches and ventures there. Doesn't run her own venture. |
| 5 | **David** | City Leader + Venture Leader | Leads Milwaukee city AND runs his own tutoring venture. Another dual-role test. |
| 6 | **Ben** | CEO + Platform Owner | Sees everything. The "god view." All cities, all ventures, all affiliates. |

> These personas should be enough to test every role and the key dual-role combos. We can add more if needed.

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
  - **"All Cities" card** — shows if the user is CEO. Grid of city cards, each showing city name, # ventures, health indicator.
  - **"Platform" card** — shows if the user is Platform Owner. List of affiliates (just "LINC" for now) with stats.
- **Map placeholder** — a box that says "Map View — Coming Soon" or a static image
- **Quick action buttons:** Add Impact, Generate Report (non-functional, just present)

### 3. Ventures (`/ventures`)
- **If user has 1 venture (VL only):** redirects straight to that venture's profile
- **If user has multiple ventures in scope (Coach, City Leader, CEO):** shows a list/grid of venture cards
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
- **This page does NOT appear for coaches/city leaders/CEO in the nav.** If they need to add data on behalf of a VL, that action would be on the venture profile page (a button that says "Add Impact for This Venture" — present but non-functional in MVP 0).

### 6. My City (`/my-city`)
- Only appears in nav for City Leaders
- City name header
- **Coaches section:** list of coaches in this city with # of assigned ventures, activity indicator
- **Ventures section:** all ventures in this city, sortable/filterable (placeholder)
- **City impact rollup:** 3 circles aggregated across all ventures
- Click any coach → see their profile. Click any venture → venture profile page.

### 7. All Cities (`/all-cities`)
- Only appears in nav for CEO+
- Grid of city cards (one per city)
- Each card: city name, city leader name, # coaches, # ventures, health indicator
- Click a city → goes to that city's view (same as My City page but for the selected city)

### 8. Reports (`/reports`)
- Mirrors wireframe (page 6):
  - Filter controls: by venture / city / region (dropdowns, functional enough to show different scopes)
  - Date range selector
  - "Generate Report" button → mock popup → placeholder PDF-like view
- **Filter scope adapts to role:** VL only sees their venture. Coach sees their ventures. City leader sees their city. CEO sees everything.

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
- CEO: + Org Admin, User Management
- Platform Owner: + Platform Admin

### 12. Platform Admin (`/platform-admin`)
- Only appears for Platform Owner
- List of affiliates (just "LINC" for now)
- Placeholder stats per affiliate
- "This is where you'd manage all organizations using Impact360"

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
  My City           → only if user is a City Leader
  All Cities        → only if user is CEO+
  Platform Admin    → only if user is Platform Owner
```

**Top bar:**
- Current user's name + role badges
- "Switch Persona" button → returns to persona selector (for demo purposes)

---

## Visual Direction

- **Clean, minimal.** Varying tech literacy across users — keep it simple.
- Muted, professional color palette. Not churchy/kitschy. Think modern SaaS.
- Clear typography hierarchy. Big labels. Obvious clickable elements.
- Mobile-responsive (many users may not have computers — noted in meeting)
- Placeholder data should feel realistic, not "lorem ipsum" — use real-sounding venture names, real city names, plausible numbers.

---

## Tech Approach

- **Frontend only** — no backend, no database, no API
- All data hard-coded in JSON files or constants
- Routing for all pages
- Role-checking logic that reads from the selected persona's role array
- Component-based — even though it's a prototype, build it in a way that the components carry forward into production

> **Open question for Caelan:** Tech stack preference? The team uses Vercel for deploys, so Next.js is the natural fit. But open to React + Vite, or whatever the 4-person team is comfortable with. This decision affects everything downstream since this prototype becomes production code.

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

---

*Created: 2026-02-25*
