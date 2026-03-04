# Impact360 — Project Document (v2)

> Living document. Not final — expect holes. Open questions are flagged inline.
> Review line by line, push back on everything, and we'll iterate.

---

## 0. Hard Deadline

**April 19–21, 2026 — Board Meeting Demo.** A working demo with a purchased URL must be ready. ~8 weeks from now.

---

## 1. What Is This?

**Impact360** is a management platform for **LINC (Leaders in Every Community)** — an organization that incubates grassroots ministry ventures across multiple US cities. Think of it as a spiritual VC: LINC invests in leaders, coaches them, and tracks the impact of their ventures.

The app helps LINC's hierarchy — from venture leaders on the ground to the CEO — input data, generate reports, track progress, and stay connected.

**North star question:** *Does this tool meaningfully advance gospel impact in our city — not just function as a database?*

**Long-term vision:** The platform should be duplicatable — other ministries or churches can adopt it as their own (called "affiliates"). LINC (Ben) remains the platform owner.

---

## 2. User Roles & Hierarchy

> Full details in `ROLES-DEEP-DIVE.md`. Summary below.

There are two separate role systems:

### Affiliate Roles (the product template)

Every organization using Impact360 gets exactly 3 roles. Affiliates are fully isolated — they never see other affiliates or the platform layer.

```
Director (can have multiple per affiliate)
  └── Coach
        └── Venture Leader
```

| Role | What they do | What they see |
|------|-------------|---------------|
| **Director** | Runs the org. Manages coaches, views all ventures, generates org-wide reports, invites users. | Everything inside their affiliate. |
| **Coach** | Manages assigned venture leaders. Writes private notes, tracks check-ins, helps with training. | Their assigned VLs and those ventures' data. |
| **Venture Leader** | Runs a venture. Submits impact data, updates venture profile, writes stories. | Their own venture only. |

### Platform Roles (LINC-specific)

These exist because LINC operates the Impact360 platform. They sit above/across affiliates and are NOT part of the affiliate template.

```
Platform Owner (Ben)
  ├── Admin (developers, onboarding staff)
  └── City Leader (LINC staff, one per city)
```

| Role | What they do | What they see |
|------|-------------|---------------|
| **Platform Owner** | Runs the entire platform. Manages platform config, onboards affiliates. | Everything. All affiliates, all data. |
| **Admin** | Platform-level worker — developers, onboarding staff, ops. | Configurable per need. |
| **City Leader** | LINC employee who runs a city. Oversees LINC ventures in their city, may recruit/onboard affiliates. | LINC ventures in their city + recruited affiliates. |

### LINC as an affiliate

LINC is both the platform operator AND an affiliate. Ben is both Platform Owner (platform layer) and Director of LINC (affiliate layer). LINC coaches and VLs are normal affiliate users with no platform awareness. City Leaders may also hold affiliate roles inside LINC — their city-level view blends LINC ventures with recruited affiliates. See `ROLES-DEEP-DIVE.md` for details and open questions on that overlap.

---

## 3. Dual-Role Architecture (DECIDED: Additive Permissions)

### The approach
**No toggle. No switching. One app, one login.** Each role adds surface area to the same experience. A user with multiple roles sees the union of everything they have access to.

### How it works in practice

**The nav is shared.** Most pages exist for everyone — the *content* on each page scales based on your roles. Only a few nav items are role-gated.

#### Shared pages (all roles see these, content scales):

**Dashboard**
- Stacked sections, top to bottom, based on roles held:
  - "My Venture" section (if you're a VL) — your impact summary, deadlines
  - "My Leaders" section (if you're a Coach) — who's submitted, who hasn't, flags
  - "My City" section (if you're a City Leader, platform role) — city-level rollup, coach activity
  - "All Ventures" section (if you're a Director) — org-wide health within your affiliate
- You only see the sections relevant to your roles
- A VL-only user sees a clean, simple dashboard. A Coach + VL sees two sections. No clutter for people who don't need it.

> **Open question:** Should these dashboard sections be collapsible cards? Tabs? Just stacked vertically? Need to prototype and see what feels right. Probably stacked cards for now — tabs would hide information that multi-role users might want at a glance.

**Ventures**
- VL sees: their single venture (goes directly to venture profile)
- Coach sees: a list of their assigned ventures (click into any one)
- Director sees: all ventures in their affiliate
- City Leader (platform): all LINC ventures in their city
- Same page, same component — just a different query scope
- Clicking into any venture shows the same venture profile page from the wireframes

> **Open question:** When a Coach who is also a VL opens "Ventures" — do they see their own venture mixed in with their coached ventures? Or is their own venture visually distinguished (pinned to top, different styling, "My Venture" label)? Probably distinguish it somehow.

**Add Impact**
- VL: submits for their own venture (no selector needed — it's just "my venture")
- Coach+VL: defaults to their own venture, but can also submit on behalf of a coached venture (via a venture selector dropdown that only appears if you have >1 venture in scope)
- Director: can submit on behalf of any venture in their affiliate
- Alternative: instead of a dropdown on the Add Impact page, the "submit on behalf of" action could live on the venture profile page itself — you're looking at a venture, you see they haven't submitted, you click "add impact for this venture" right there. More contextual.

> **Open question:** Which approach is better — dropdown on Add Impact page, or contextual action on venture profile? Leaning toward: keep Add Impact simple (just your own venture), and put the "on behalf of" action on the venture profile page. Cleaner separation.

**Reports**
- VL: can generate reports for their own venture only
- Coach: can generate for any assigned venture, or a rolled-up report across all their ventures
- Director: can generate org-wide reports for their affiliate, filter by venture/cause
- City Leader (platform): can generate city-level reports across LINC ventures
- Same page — the filter options just expand with your role scope

**Training**
- VL: sees their program track, documents, tasks/reminders from coach
- Coach: can see and manage training for their assigned ventures, add docs/tasks
- City Leader+: read-only view of training across their scope (or not visible — TBD)

**Network**
- Same for everyone — the public/discoverable map view
- Privacy tiers from wireframes: (1) Private, (2) Discoverable, (3) Connectable
- Higher roles can see private ventures; VLs only see opted-in ventures

**Profiles (People)**
- Everyone has a profile with basic info
- City Leader and above can see extended personal details (spouse, kids, birthdays) on profiles of people they oversee — for relationship building
- Coach and above can see/write private notes on the profiles of people they manage

**Settings**
- Scales by role:
  - VL: Account, Venture settings, Notifications, Network Visibility
  - Coach: + impact metric configuration for their ventures?
  - Director: + org-wide admin, user management, invites (within their affiliate)
  - City Leader (platform): + city-level admin
  - Platform Owner: + affiliate management, platform config

#### Role-gated nav items (only appear if you have the role):

| Nav item | Who sees it | Layer | What it is |
|----------|------------|-------|------------|
| **My City** | City Leader | Platform | City-level view: LINC ventures + recruited affiliates in their city |
| **All Cities** | Platform Owner | Platform | All cities at a glance, drill into any |
| **Platform Admin** | Platform Owner, Admin | Platform | All affiliates, platform-level config |

> **Open question:** Do "My City" and "All Cities" deserve their own nav items, or are they just sections within the Dashboard? Leaning toward separate nav items — they're rich enough to be their own pages. The dashboard shows a summary; the dedicated page shows the full detail.

#### Full nav by role:

```
Affiliate roles (any org including LINC):

  Venture Leader:
    Dashboard | Ventures | Add Impact | Reports | Training | Network | Settings

  Coach (also a VL):
    Dashboard | Ventures | Add Impact | Reports | Training | Network | Settings
    (same nav — but Dashboard has "My Leaders" section, Ventures shows a list, Reports has wider scope)

  Director:
    Dashboard | Ventures | Reports | Network | Settings
    (sees all ventures/data in their affiliate; Add Impact/Training appear if also a VL)

Platform roles (LINC only):

  City Leader:
    Dashboard | Ventures | My City | Reports | Network | Settings
    (+ any affiliate roles they hold within LINC)

  Admin:
    Dashboard | Platform Admin | Settings

  Platform Owner (Ben):
    Dashboard | Ventures | All Cities | Platform Admin | Reports | Network | Settings
    (+ Director nav from LINC affiliate role)
```

### Why this works
- No context switching. Josh in Milwaukee logs in and sees everything he has access to.
- A VL-only user gets a dead-simple experience — clean nav, focused pages, no noise.
- Adding a role to someone doesn't require them to learn a new app. They just see more.
- The DB model is clean: a user has roles, each role is scoped to a context (venture, city, org). Permissions are checked per-resource.

### DB implication

Two separate role tables reflecting the two layers:

- `affiliate_roles`: user_id, affiliate_id, role (director | coach | venture_leader)
- `platform_roles`: user_id, role (platform_owner | admin | city_leader), scope_id (city_id for city_leaders, null for others)
- `city_leader_affiliates`: links city leaders to recruited affiliates they can see
- A user can have entries in both tables. The app checks both to determine what to show.

> See `ROLES-DEEP-DIVE.md` for the full schema.

> **Open question:** If a coach gets reassigned, do their old notes transfer to the new coach? Or does the new coach just see them because notes are tied to the venture, not the coach relationship? Probably tie notes to the venture (with author attribution) so they persist regardless of coach changes.

---

## 4. The 3-Bucket System (Impact Data Model)

### The 3 buckets
From wireframes and discussion: **Social, Spiritual, Economic** (wireframe says "Economic," meeting notes say "Financial" — same thing).

### How input works (from wireframes)
- Choose month/year (default: current)
- Choose venture (if you have access to multiple)
- Stacked tabs: Social | Spiritual | Economic
- Each tab has **predefined metric options** with checkboxes:
  - **Social:** people fed, kids tutored, etc.
  - **Spiritual:** baptisms, conversions, gospel conversations, etc.
  - **Economic:** $ into upside, new jobs, etc.
- Each selected metric gets: a **number field**, an optional **story field**, an optional **photo**
- Separate **Stewardship section** (optional/foldable): $ raised, $ spent

### The messy part (acknowledged)
The lines between Social and Spiritual blur. "People affected" could be either. A barbershop ministry tracks haircuts (Social) but might also track gospel conversations during those haircuts (Spiritual). The same person could appear in both buckets.

**Proposed approach:** The buckets are **labels/categories**, not hard boundaries. Each venture defines their own metrics during setup (or their coach helps them). Each metric gets tagged to a bucket. The numbers roll up by bucket for dashboards and reports, even though the underlying units differ across ventures. At the aggregate level, you're saying "X social touches, Y spiritual touches, Z dollars" — not comparing haircuts to meals directly.

> **Open question:** Who defines the predefined metric options? Is there a master list that LINC maintains, and ventures choose from it? Or can ventures create custom metrics? The wireframe shows predefined options (people fed, kids tutored, baptisms, conversions, etc.) which suggests a master list. But if a venture has a unique metric (e.g., "showers provided" for a homeless shower ministry), can they add it?

> **Open question:** Are metrics set once during venture setup, or can they change over time? What if a venture pivots and starts tracking different things?

> **Open question:** The "optional story field" per metric entry — is this the same as Signature Stories, or separate? It seems like this is a mini-story attached to a specific data point ("we baptized 20 people, here's the story"), while Signature Stories are bigger standalone narratives. Need to clarify whether these are the same system or two different things.

> **Open question:** Stewardship ($ raised / $ spent) — is this always present for every venture, or only for ventures that handle money? Is it part of the Economic bucket or a separate fourth thing?

### Venture lifecycle stages (from wireframes)
Ventures have a status: **Accelerate → Build → Scale → Multiply**
(The training page shows: Accelerate → Builder → Sustainer → Multiplier → Network)

> **Open question:** These two lists don't match. Which is the real one? Does the stage affect what metrics are available or expected?

---

## 5. Page-by-Page Breakdown (Wireframe-Informed)

### 5a. Login
- Email + password
- Google SSO, Microsoft SSO
- "Forgot password" flow
- Error state: "invalid email or password"
- **Invite-only for MVP** — no self-registration
- Future: public registration flow where applicants choose affiliate → city → apply

> **Open question:** For MVP, who creates accounts? Ben manually? A coach? An admin panel? What's the invite mechanism — email link?

### 5b. Dashboard
- Role-adaptive stacked sections (see Section 3)
- "Venture Name" Impact circles (Social, Spiritual, Economic) — for your venture
- Network Wide Impact circles — aggregate across all ventures in your scope
- Map view embedded
- Action buttons: Add Impact, Update Venture, Generate Report
- Search bar (scope: Network vs My Venture)

> **Open question:** The wireframe shows "Network Wide Impact" even on what looks like a VL view. Should VLs see network-wide stats? That aligns with the "ventures can see what others are tracking" idea. But does that reveal too much? Or is it intentionally transparent to foster community?

### 5c. Venture Profile
- Venture name, ID, cause, address
- Leader name, ID, role, email, phone, address
- Status dropdown (Accelerate / Build / Scale / Multiply)
- "Last updated" timestamp
- Photo of leader
- Short venture story/mission (editable by leader)
- Venture photos (optional, up to ~4)
- Impact summary circles (Social, Spiritual, Economic)
- Milestones Unlocked (Phase 2 — tied to data input, e.g., grant eligibility) — with progress bar
- "See Venture Docs" button → training page
- "Generate Report" button
- **Admin-only visibility toggle** — opt in/out for network/map visibility
- **Private notes section (bottom of page):**
  - Director/City Leader notes: static profile notes
  - Coach notes: rolling, timestamped, attributed
  - AI Summary of Notes
  - **Not visible to venture leaders** — only coach, city leader, CEO

> **Open question:** "Admin visibility opt-in for switching one off for network" — who controls this? The VL? Or a coach/admin? If the VL controls it, they could hide from the network. If admin controls it, the VL might not want to be hidden. Wireframe note suggests VL opts in.

### 5d. Impact Input (Add Data)
- Context bar at top
- "Add Impact" header
- Dropdown: month/year (default current)
- Choose venture (smart type-ahead dropdown — only shows if user has multiple)
- Stacked tabs: Social | Spiritual | Economic
- Predefined metrics with checkboxes under each tab
- Each metric: number field + optional story + optional photo
- Stewardship section (foldable?): $ raised / $ spent
- Save button → review card popup confirming what you're submitting
- Progress message after save: "Congrats! You've added X impact!"

> **Open question:** Can you save a partial report and come back? Or is it all-or-nothing per month? What if you add social data today and spiritual data next week?

> **Open question:** Can you edit after submission? The review popup suggests a "confirm" step, implying finality. But mistakes happen.

### 5e. Venture Training
- Context bar
- **Program Track** progress indicator: Accelerate → Builder → Sustainer → Multiplier → Network
- "My Venture Documents" section — documents that coaches/leaders work on together
  - Documents open and are fillable
  - Example: "Blueprint document," "Builder map"
  - Other documents listed by ID (1-4-1-4 format?)
- Documents contain any doc a leader/coach/facilitator is working on — they can click in, fill, save
- **Actions / Reminders section:**
  - Rolling notes from coach (public to VL)
  - Reminders from Director (public to VL)
  - Visible to leader/coach/admins

> **Open question:** These "rolling notes from coach" on the training page are *public* (the VL can see them). But the coach notes on the venture profile are *private*. So there are two types of coach notes: public (training-related, actionable) and private (internal observations). Need to make this distinction clear in the UI so coaches don't accidentally put private thoughts in the public notes.

> **Open question:** "Validate with leaders before replacing existing system" — what system are they currently using for training documents? Paper? Google Docs? Notion? Understanding this helps design the transition.

### 5f. Reports
- Left sidebar (same as all pages)
- "Select Report by" dropdowns: venture, cause, zip, city, region, national — cascading filters (e.g., choosing "zip" reveals a search for specific zip codes)
- Date range: 1 year / 1 month / custom range
- View options: 1-page PDF, wrapped version
- "Generate Report" button → confirmation popup:
  - "This report: Venture: Hope House, City: Chicago, Date Range: Jan 25 – Jan 26, View: 1 pg PDF"
  - Confirm → Generate
- Empty state: "Reports become available when data is added"

> **Open question:** "Wrapped version" — what does this mean? A longer, more detailed format vs the 1-page summary?

### 5g. Network Page
- Purpose: "Help leaders & partners discover & connect with others"
- Status banner: "You are currently not publicly visible" (if private)
- Search bar — by name, venture, city
- Map: clickable, interactive
- Clicking a pin or dropdown shows a **Basic Public Card**:
  - Venture name, cause, address (if opted in), leader name, role, photo
  - Short venture story / "Public Bio"
  - Contact preferences: email, message form (if opted in)
  - "Report from public" option
- Three privacy levels:
  1. **Private** — not visible at all
  2. **Discoverable** — view venture, role, leader, city (no contact)
  3. **Connectable** — view basic profile + contact info
- Leaders and partners choose to opt in

### 5h. Settings
- Tabs: Account, Venture, Access & Permissions, Impact Metrics, Notifications, Data & Reports, Admin (as per role), Network Visibility
- Wireframe note: "Is this needed? Or will this be editable on the actual pages?"

> **Open question:** I'd lean toward: most settings editable on their actual pages (venture settings on venture profile, notifications in a notifications panel, etc.), with Settings as a fallback/central place. Duplicating settings in two places is a maintenance headache. For MVP, maybe skip the dedicated Settings page entirely and just put controls where they naturally live?

---

## 6. Open Questions (consolidated)

### Architecture & Roles
| # | Question | Status |
|---|----------|--------|
| 1 | Is "Director" = "City Leader"? | **Resolved.** No — Director is an affiliate role (top of an org). City Leader is a platform role (LINC staff, one per city). See `ROLES-DEEP-DIVE.md`. |
| 2 | Can roles be skipped? (e.g., small affiliate with no coaches) | **Partially answered.** City Leader doesn't apply to affiliates (it's platform-only). An affiliate can have just Directors + VLs with no Coaches — the hierarchy flexes. |
| 3 | Who assigns coach ↔ VL relationships? Director? Self-serve? | **Needs answer** |
| 4 | When a coach is reassigned, do notes transfer? | **Leaning: notes tied to venture, not coach relationship** |

### Data & Impact
| # | Question | Status |
|---|----------|--------|
| 5 | What are the predefined metrics per bucket? Need the master list. | **Needs Ben/Kate** |
| 6 | Can ventures create custom metrics beyond the master list? | **Needs answer** |
| 7 | Are metrics fixed at venture setup or changeable? | **Needs answer** |
| 8 | Is the per-entry "story field" the same as Signature Stories? | **Needs answer** |
| 9 | Is Stewardship ($/raised, $/spent) always shown or venture-dependent? | **Needs answer** |
| 10 | Venture lifecycle stages: "Accelerate/Build/Scale/Multiply" vs "Accelerate/Builder/Sustainer/Multiplier/Network" — which is real? | **Contradictory — needs confirmation** |
| 11 | Can you save partial impact data and return later? | **Needs answer** |
| 12 | Can submitted impact data be edited after the fact? | **Needs answer** |

### Privacy & Visibility
| # | Question | Status |
|---|----------|--------|
| 13 | Who controls a venture's map/network visibility — the VL or an admin? | **Wireframe suggests VL** |
| 14 | Should VLs see "Network Wide Impact" stats on their dashboard? | **Needs answer** |
| 15 | Privacy rules for Signature Stories — which roles see what? | **Needs definition** |
| 16 | Public coach notes (training page) vs private coach notes (profile page) — is this distinction clear to coaches? Risk of accidental disclosure. | **Design concern** |

### Operational
| # | Question | Status |
|---|----------|--------|
| 17 | For MVP invite-only auth — who creates accounts and how? | **Needs answer** |
| 18 | What system is currently used for training documents? | **Needs answer for transition planning** |
| 19 | What does "check-in" mean — report submission, or a separate action? | **Needs definition** |
| 20 | Notification escalation rules — timeline, who gets notified? | **Needs definition** |
| 21 | "Wrapped version" of reports — what is this? | **Needs clarification** |
| 22 | Do we need a Settings page, or should settings live on their respective pages? | **Leaning: skip dedicated settings for MVP** |
| 23 | What are the ~6 cities? | **Need list from Ben** |
| 24 | Tech stack preferences from the 4-person team? | **TBD** |

---

## 7. MVP Slicing (revised for April 19 deadline)

~8 weeks. Must be demoable at board meeting.

### MVP 0 — Foundation (Week 1–2)
- Auth (invite-based login, email+password minimum)
- DB schema with multi-tenant awareness + additive role model
- Layout with role-adaptive sidebar nav
- Seed data: a few test ventures, coaches, city leader, CEO account

### MVP 1 — Ventures + Impact Input (Week 2–4)
- Venture profile page (view + edit)
- People profile page (basic)
- Impact data input page with 3-bucket tabs (even with placeholder metrics)
- Venture list view (for coaches/city leaders/CEO)
- The core data flow: VL submits impact → coach sees it → CEO sees it

### MVP 2 — Dashboard + Reports (Week 4–6)
- Role-adaptive dashboard with stacked sections
- Basic report generation (1-page summary, date range + venture selector)
- Check-in tracking: who has/hasn't submitted this period
- Map view with venture pins (privacy-aware)

### MVP 3 — Notes, Stories, Polish (Week 6–8)
- Coach notes on venture profiles (attributed, private, persistent)
- Signature Stories (story + photo upload)
- Email notifications (submission confirmations, overdue reminders)
- Demo prep and polish for board meeting

### Phase 2 (Post-Demo)
- Public registration flow
- Training page with documents and program track
- Gamification / milestones
- Year-end wraps
- AI-powered summarization
- Multi-language support
- Full multi-tenant onboarding for new affiliates
- Notification escalation system
- Report customization (choose what to display)

---

## 8. Edge Cases

- **Venture with no coach assigned** — what do they see? Who do they report to? Does their data just go to the Director?
- **Coach leaves** — notes persist (tied to venture, attributed to author). New coach inherits full history.
- **VL stops reporting** — at what point do reminders trigger? Who gets notified? What if they ghost completely?
- **City with no city leader** — platform-layer concern. Does Platform Owner absorb that city, or does it just have no LINC oversight?
- **Venture spans two cities** — possible? Or does a venture strictly belong to one city?
- **Report corrections** — can a VL edit submitted data? Is there a window? Does an edit notify the coach?
- **Director inputs data for a VL** — does the VL see that someone else submitted on their behalf? Can they dispute or overwrite?
- **Private ventures** — hidden from map and network, but coaches and Directors can still see them. Can other VLs see that a private venture exists?
- **Small affiliate** — only 2 ventures, no need for coaches. Can the hierarchy flex? (Yes — City Leader doesn't apply, it's platform-only. An affiliate can skip the Coach layer.)
- **Seasonal ventures** — summer camps, holiday ministries. Active 3 months, dormant 9. How does check-in tracking handle this?
- **Venture closure / graduation** — what's the lifecycle? Active → Inactive → Archived? What triggers transitions? Who decides?
- **Signature Story mentions a person** — any consent needed? Privacy implications?
- **Notification fatigue** — too many "you haven't submitted" emails → people unsubscribe → defeats the purpose
- **Two coaches for one VL** — possible? Or strictly 1:1? If 1:1, what about during transitions?
- **Same metric name, different meaning** — one venture's "people fed" is weekly, another's is monthly. Aggregation becomes misleading.
- **A VL who is also a Director** — extreme case, but the additive model handles it. They just see everything. Dashboard has many sections.

---

## 9. Beta Testers

| Name | Location | Notes |
|------|----------|-------|
| Josh | Milwaukee | Dual-role user (VL + LINC employee) — tests additive permissions |
| Muluneh | — | Church context |
| Berhanu | — | Homeless shower ministry |

Goal: Have testers at every level of the hierarchy.

---

## 10. Team & Workflow

- **Vercel** for continuous web app visibility (deploy previews)
- **Standard Git workflow** on shared repo (4 people)
- Andrea reviewing security considerations
- Sprint structure and accountability cadence TBD
- URL needs to be purchased before April 19

---

*Last updated: 2026-03-03 — v3 (roles updated to match ROLES-DEEP-DIVE.md)*
