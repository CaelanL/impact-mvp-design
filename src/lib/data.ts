// ============================================================
// Hard-coded mock data for MVP 0
// All personas, ventures, cities, and relationships
// ============================================================

import {
  User,
  Venture,
  City,
  Org,
  CoachAssignment,
  Note,
  ImpactEntry,
  ImpactMetricOption,
} from "./types";

// --- Organizations (Affiliates) ---
export const orgs: Org[] = [
  { id: "org-linc", name: "LINC", slug: "linc" },
  { id: "org-grace", name: "Grace Church Chicago", slug: "grace-church" },
];

// --- Cities ---
export const cities: City[] = [
  { id: "city-chicago", name: "Chicago", state: "IL", leaderId: "user-sarah", orgId: "org-linc" },
  { id: "city-milwaukee", name: "Milwaukee", state: "WI", leaderId: "user-david", orgId: "org-linc" },
  { id: "city-dallas", name: "Dallas", state: "TX", leaderId: null, orgId: "org-linc" },
  { id: "city-atlanta", name: "Atlanta", state: "GA", leaderId: null, orgId: "org-linc" },
  { id: "city-denver", name: "Denver", state: "CO", leaderId: null, orgId: "org-linc" },
  { id: "city-phoenix", name: "Phoenix", state: "AZ", leaderId: null, orgId: "org-linc" },
];

// --- City Leader → Affiliate visibility (platform-level relationship) ---
// Which affiliates can each city leader see?
export const cityLeaderAffiliates: Record<string, string[]> = {
  "user-sarah": ["org-linc", "org-grace"], // Chicago has both LINC and Grace Church
  "user-david": ["org-linc"],              // Milwaukee only has LINC
};

// --- Users (Personas — selectable in persona picker) ---
export const users: User[] = [
  // 1. Maria — Venture Leader only (LINC)
  {
    id: "user-maria",
    name: "Maria Torres",
    email: "maria@hopekitchen.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-hope-kitchen" },
    ],
  },
  // 2. James — Coach only, no venture (LINC)
  {
    id: "user-james",
    name: "James Carter",
    email: "james@linc.org",
    roles: [
      { role: "coach", affiliateId: "org-linc", scopeType: "city", scopeId: "city-chicago" },
    ],
  },
  // 3. Josh — Venture Leader + Coach dual role (LINC)
  {
    id: "user-josh",
    name: "Josh Williams",
    email: "josh@milwaukeebarbers.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-mke-barbers" },
      { role: "coach", affiliateId: "org-linc", scopeType: "city", scopeId: "city-milwaukee" },
    ],
  },
  // 4. Sarah — City Leader for Chicago (platform role)
  {
    id: "user-sarah",
    name: "Sarah Mitchell",
    email: "sarah@linc.org",
    roles: [
      { role: "city_leader", scopeType: "city", scopeId: "city-chicago" },
    ],
  },
  // 5. David — City Leader (platform) + Venture Leader (LINC)
  {
    id: "user-david",
    name: "David Okonkwo",
    email: "david@linc.org",
    roles: [
      { role: "city_leader", scopeType: "city", scopeId: "city-milwaukee" },
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-bright-futures" },
    ],
  },
  // 6. Ben — Director of LINC (affiliate) + Platform Owner (platform)
  {
    id: "user-ben",
    name: "Ben Harper",
    email: "ben@linc.org",
    roles: [
      { role: "director", affiliateId: "org-linc", scopeType: "org", scopeId: "org-linc" },
      { role: "platform_owner", scopeType: "platform", scopeId: "platform" },
    ],
  },
  // 7. Pastor Mike — Director at Grace Church (affiliate-only user)
  {
    id: "user-mike",
    name: "Mike Rivera",
    email: "mike@gracechicago.org",
    roles: [
      { role: "director", affiliateId: "org-grace", scopeType: "org", scopeId: "org-grace" },
    ],
  },
];

// --- Additional users (not personas, but needed for coach/city data) ---
export const allUsers: User[] = [
  ...users,
  // LINC venture leaders
  {
    id: "user-elena",
    name: "Elena Ruiz",
    email: "elena@freshharvest.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-fresh-harvest" },
    ],
  },
  {
    id: "user-marcus",
    name: "Marcus Lee",
    email: "marcus@streetlight.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-streetlight" },
    ],
  },
  {
    id: "user-grace-ndaba",
    name: "Grace Ndaba",
    email: "grace@communitybridge.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-community-bridge" },
    ],
  },
  {
    id: "user-tom",
    name: "Tom Becker",
    email: "tom@newroots.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-linc", scopeType: "venture", scopeId: "venture-new-roots" },
    ],
  },
  // Grace Church venture leaders
  {
    id: "user-rachel",
    name: "Rachel Kim",
    email: "rachel@gracechicago.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-grace", scopeType: "venture", scopeId: "venture-grace-meals" },
    ],
  },
  {
    id: "user-kevin",
    name: "Kevin Brooks",
    email: "kevin@gracechicago.org",
    roles: [
      { role: "venture_leader", affiliateId: "org-grace", scopeType: "venture", scopeId: "venture-grace-youth" },
    ],
  },
];

// --- Ventures ---
export const ventures: Venture[] = [
  // LINC ventures
  {
    id: "venture-hope-kitchen",
    name: "Hope Kitchen",
    cause: "Food & Meal Ministry",
    address: "1234 W Division St, Chicago, IL",
    cityId: "city-chicago",
    affiliateId: "org-linc",
    leaderId: "user-maria",
    stage: "accelerate",
    privacy: "connectable",
    story: "Hope Kitchen serves hot meals to families in the West Side of Chicago three times a week. What started as Maria cooking for her neighbors has grown into a community gathering point where people find both food and fellowship.",
    lastSubmission: "2026-01-15",
    impact: { social: 340, spiritual: 45, economic: 2800 },
  },
  {
    id: "venture-fresh-harvest",
    name: "Fresh Harvest",
    cause: "Urban Agriculture & Food Access",
    address: "890 N Kedzie Ave, Chicago, IL",
    cityId: "city-chicago",
    affiliateId: "org-linc",
    leaderId: "user-elena",
    stage: "build",
    privacy: "discoverable",
    story: "Fresh Harvest transforms vacant lots into community gardens, providing fresh produce to food deserts while teaching sustainable agriculture skills.",
    lastSubmission: "2026-02-02",
    impact: { social: 210, spiritual: 30, economic: 5200 },
  },
  {
    id: "venture-streetlight",
    name: "Streetlight Tutoring",
    cause: "Youth Education",
    address: "456 S Ashland Ave, Chicago, IL",
    cityId: "city-chicago",
    affiliateId: "org-linc",
    leaderId: "user-marcus",
    stage: "scale",
    privacy: "connectable",
    story: "Streetlight provides free after-school tutoring and mentorship to middle schoolers in Pilsen. Every session opens and closes with a short devotional.",
    lastSubmission: null,
    impact: { social: 180, spiritual: 60, economic: 0 },
  },
  {
    id: "venture-mke-barbers",
    name: "Milwaukee Barbers",
    cause: "Community Services & Outreach",
    address: "321 W Center St, Milwaukee, WI",
    cityId: "city-milwaukee",
    affiliateId: "org-linc",
    leaderId: "user-josh",
    stage: "multiply",
    privacy: "connectable",
    story: "Free haircuts and gospel conversations. What started as Josh cutting hair on his front porch now operates out of two locations with five volunteer barbers.",
    lastSubmission: "2026-02-10",
    impact: { social: 520, spiritual: 150, economic: 0 },
  },
  {
    id: "venture-community-bridge",
    name: "Community Bridge",
    cause: "Refugee & Immigrant Services",
    address: "700 N Water St, Milwaukee, WI",
    cityId: "city-milwaukee",
    affiliateId: "org-linc",
    leaderId: "user-grace-ndaba",
    stage: "build",
    privacy: "private",
    story: "Community Bridge helps newly arrived refugees navigate housing, employment, and community integration through one-on-one mentorship.",
    lastSubmission: "2026-01-28",
    impact: { social: 95, spiritual: 20, economic: 3400 },
  },
  {
    id: "venture-new-roots",
    name: "New Roots Milwaukee",
    cause: "Housing & Financial Literacy",
    address: "1500 W National Ave, Milwaukee, WI",
    cityId: "city-milwaukee",
    affiliateId: "org-linc",
    leaderId: "user-tom",
    stage: "accelerate",
    privacy: "discoverable",
    story: "New Roots runs financial literacy workshops and connects families with affordable housing resources. Just getting started but already seeing momentum.",
    lastSubmission: null,
    impact: { social: 40, spiritual: 10, economic: 1200 },
  },
  {
    id: "venture-bright-futures",
    name: "Bright Futures Tutoring",
    cause: "Youth Education",
    address: "250 E Brady St, Milwaukee, WI",
    cityId: "city-milwaukee",
    affiliateId: "org-linc",
    leaderId: "user-david",
    stage: "scale",
    privacy: "connectable",
    story: "David started Bright Futures to give Milwaukee kids the academic support he wished he'd had growing up. Now serving 60+ students weekly.",
    lastSubmission: "2026-02-18",
    impact: { social: 310, spiritual: 85, economic: 1500 },
  },
  // Grace Church ventures
  {
    id: "venture-grace-meals",
    name: "Grace Meals Ministry",
    cause: "Food & Meal Ministry",
    address: "4501 N Magnolia Ave, Chicago, IL",
    cityId: "city-chicago",
    affiliateId: "org-grace",
    leaderId: "user-rachel",
    stage: "build",
    privacy: "connectable",
    story: "Grace Meals serves weekly community dinners from the church kitchen. What started as a potluck has grown into a full meal program serving 60+ families every Wednesday.",
    lastSubmission: "2026-02-20",
    impact: { social: 180, spiritual: 55, economic: 1200 },
  },
  {
    id: "venture-grace-youth",
    name: "Grace Youth Mentors",
    cause: "Youth Mentorship",
    address: "4501 N Magnolia Ave, Chicago, IL",
    cityId: "city-chicago",
    affiliateId: "org-grace",
    leaderId: "user-kevin",
    stage: "accelerate",
    privacy: "discoverable",
    story: "Pairing college students with at-risk teens for weekly mentorship sessions. Building relationships that go beyond homework help.",
    lastSubmission: null,
    impact: { social: 45, spiritual: 20, economic: 0 },
  },
];

// --- Coach Assignments ---
export const coachAssignments: CoachAssignment[] = [
  // James (LINC Chicago coach) → Maria, Elena, Marcus
  { coachId: "user-james", ventureLeaderId: "user-maria", ventureId: "venture-hope-kitchen" },
  { coachId: "user-james", ventureLeaderId: "user-elena", ventureId: "venture-fresh-harvest" },
  { coachId: "user-james", ventureLeaderId: "user-marcus", ventureId: "venture-streetlight" },
  // Josh (LINC Milwaukee coach) → Grace, Tom
  { coachId: "user-josh", ventureLeaderId: "user-grace-ndaba", ventureId: "venture-community-bridge" },
  { coachId: "user-josh", ventureLeaderId: "user-tom", ventureId: "venture-new-roots" },
  // Mike (Grace Church director) coaches his own VLs
  { coachId: "user-mike", ventureLeaderId: "user-rachel", ventureId: "venture-grace-meals" },
  { coachId: "user-mike", ventureLeaderId: "user-kevin", ventureId: "venture-grace-youth" },
];

// --- Notes ---
export const notes: Note[] = [
  {
    id: "note-1",
    authorId: "user-james",
    ventureId: "venture-hope-kitchen",
    content: "Maria is doing incredible work but struggling with volunteer retention. We talked about creating a more structured onboarding process for new volunteers. She's open to it but needs help with the planning.",
    createdAt: "2026-02-10T14:30:00Z",
  },
  {
    id: "note-2",
    authorId: "user-james",
    ventureId: "venture-hope-kitchen",
    content: "Follow-up from last week — Maria implemented the volunteer sign-up sheet and already has 3 new recurring volunteers. Energy is high.",
    createdAt: "2026-02-18T10:15:00Z",
  },
  {
    id: "note-3",
    authorId: "user-james",
    ventureId: "venture-streetlight",
    content: "Marcus hasn't submitted impact data in 2 months. Reached out twice via text. Going to try a face-to-face this week. May be dealing with personal stuff.",
    createdAt: "2026-02-20T09:00:00Z",
  },
  {
    id: "note-4",
    authorId: "user-josh",
    ventureId: "venture-community-bridge",
    content: "Grace mentioned she's looking for a Swahili-speaking volunteer to help with a new family from Congo. Connected her with someone at church.",
    createdAt: "2026-02-12T16:45:00Z",
  },
  {
    id: "note-5",
    authorId: "user-sarah",
    ventureId: "venture-fresh-harvest",
    content: "Elena's work is getting city attention — a local alderman visited the garden last week. Potential for a city partnership. Worth exploring in next coach check-in.",
    createdAt: "2026-02-15T11:00:00Z",
  },
];

// --- Impact Entries (sample data) ---
export const impactEntries: ImpactEntry[] = [
  {
    id: "ie-1",
    ventureId: "venture-hope-kitchen",
    category: "social",
    metricId: "meals-served",
    metricLabel: "Meals Served",
    metricSource: "preset",
    value: 455,
    valueType: "count",
    startDate: "2026-03-04",
    endDate: "2026-03-22",
    story: "Community dinner service expanded through spring break and the response stayed strong all month.",
    createdAt: "2026-03-04T16:00:00.000Z",
    updatedAt: "2026-03-04T16:00:00.000Z",
  },
  {
    id: "ie-2",
    ventureId: "venture-hope-kitchen",
    category: "spiritual",
    metricId: "gospel-conversations",
    metricLabel: "Gospel Conversations",
    metricSource: "preset",
    value: 14,
    valueType: "count",
    startDate: "2026-03-10",
    endDate: "2026-03-10",
    createdAt: "2026-03-10T20:15:00.000Z",
    updatedAt: "2026-03-10T20:15:00.000Z",
  },
  {
    id: "ie-3",
    ventureId: "venture-hope-kitchen",
    category: "economic",
    metricId: "donations-received",
    metricLabel: "Donations Received",
    metricSource: "preset",
    value: 1200,
    valueType: "currency",
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    story: "Two partner churches covered pantry restock costs for the first half of the month.",
    createdAt: "2026-03-01T13:00:00.000Z",
    updatedAt: "2026-03-01T13:00:00.000Z",
  },
  {
    id: "ie-4",
    ventureId: "venture-hope-kitchen",
    category: "social",
    metricId: "people-fed",
    metricLabel: "People Fed",
    metricSource: "preset",
    value: 87,
    valueType: "count",
    startDate: "2026-03-10",
    endDate: "2026-03-10",
    createdAt: "2026-03-10T20:10:00.000Z",
    updatedAt: "2026-03-10T20:10:00.000Z",
  },
  {
    id: "ie-5",
    ventureId: "venture-hope-kitchen",
    category: "spiritual",
    metricId: "prayer-meetings",
    metricLabel: "Prayer Meetings",
    metricSource: "preset",
    value: 3,
    valueType: "count",
    startDate: "2026-03-17",
    endDate: "2026-03-24",
    createdAt: "2026-03-17T23:00:00.000Z",
    updatedAt: "2026-03-17T23:00:00.000Z",
  },
  {
    id: "ie-6",
    ventureId: "venture-mke-barbers",
    category: "social",
    metricId: "haircuts-given",
    metricLabel: "Haircuts Given",
    metricSource: "preset",
    value: 185,
    valueType: "count",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    createdAt: "2026-02-28T18:30:00.000Z",
    updatedAt: "2026-02-28T18:30:00.000Z",
  },
  {
    id: "ie-7",
    ventureId: "venture-mke-barbers",
    category: "spiritual",
    metricId: "gospel-conversations",
    metricLabel: "Gospel Conversations",
    metricSource: "preset",
    value: 90,
    valueType: "count",
    startDate: "2026-02-05",
    endDate: "2026-02-21",
    createdAt: "2026-02-21T22:00:00.000Z",
    updatedAt: "2026-02-21T22:00:00.000Z",
  },
  {
    id: "ie-8",
    ventureId: "venture-mke-barbers",
    category: "spiritual",
    metricId: "baptisms",
    metricLabel: "Baptisms",
    metricSource: "preset",
    value: 5,
    valueType: "count",
    startDate: "2026-02-18",
    endDate: "2026-02-18",
    createdAt: "2026-02-18T18:00:00.000Z",
    updatedAt: "2026-02-18T18:00:00.000Z",
  },
  {
    id: "ie-9",
    ventureId: "venture-bright-futures",
    category: "social",
    metricId: "kids-tutored",
    metricLabel: "Kids Tutored",
    metricSource: "preset",
    value: 62,
    valueType: "count",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    createdAt: "2026-02-28T17:00:00.000Z",
    updatedAt: "2026-02-28T17:00:00.000Z",
  },
  {
    id: "ie-10",
    ventureId: "venture-bright-futures",
    category: "spiritual",
    metricId: "gospel-conversations",
    metricLabel: "Gospel Conversations",
    metricSource: "preset",
    value: 25,
    valueType: "count",
    startDate: "2026-02-12",
    endDate: "2026-02-26",
    createdAt: "2026-02-26T18:00:00.000Z",
    updatedAt: "2026-02-26T18:00:00.000Z",
  },
  {
    id: "ie-11",
    ventureId: "venture-bright-futures",
    category: "economic",
    metricId: "grants-received",
    metricLabel: "Grants Received",
    metricSource: "preset",
    value: 1500,
    valueType: "currency",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    createdAt: "2026-02-28T17:30:00.000Z",
    updatedAt: "2026-02-28T17:30:00.000Z",
  },
];

// --- Predefined metrics per bucket ---
export const metricOptions: Record<"social" | "spiritual" | "economic", ImpactMetricOption[]> = {
  social: [
    { id: "people-fed", label: "People Fed", category: "social", valueType: "count" },
    { id: "meals-served", label: "Meals Served", category: "social", valueType: "count" },
    { id: "kids-tutored", label: "Kids Tutored", category: "social", valueType: "count" },
    { id: "haircuts-given", label: "Haircuts Given", category: "social", valueType: "count" },
    { id: "families-housed", label: "Families Housed", category: "social", valueType: "count" },
    { id: "people-served", label: "People Served", category: "social", valueType: "count" },
    { id: "events-held", label: "Events Held", category: "social", valueType: "count" },
  ],
  spiritual: [
    { id: "baptisms", label: "Baptisms", category: "spiritual", valueType: "count" },
    { id: "conversions", label: "Conversions", category: "spiritual", valueType: "count" },
    { id: "gospel-conversations", label: "Gospel Conversations", category: "spiritual", valueType: "count" },
    { id: "bible-studies-led", label: "Bible Studies Led", category: "spiritual", valueType: "count" },
    { id: "prayer-meetings", label: "Prayer Meetings", category: "spiritual", valueType: "count" },
  ],
  economic: [
    { id: "donations-received", label: "Donations Received", category: "economic", valueType: "currency" },
    { id: "grants-received", label: "Grants Received", category: "economic", valueType: "currency" },
    { id: "new-jobs-created", label: "New Jobs Created", category: "economic", valueType: "count" },
    { id: "financial-literacy-graduates", label: "Financial Literacy Graduates", category: "economic", valueType: "count" },
  ],
};
