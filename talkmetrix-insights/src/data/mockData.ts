export const agents = [
  { id: 1, name: "Sarah Chen", score: 94, conversations: 142, compliance: 98, trend: "up", avatar: "SC" },
  { id: 2, name: "Marcus Johnson", score: 87, conversations: 128, compliance: 92, trend: "up", avatar: "MJ" },
  { id: 3, name: "Emily Rodriguez", score: 78, conversations: 95, compliance: 85, trend: "down", avatar: "ER" },
  { id: 4, name: "David Kim", score: 96, conversations: 163, compliance: 99, trend: "up", avatar: "DK" },
  { id: 5, name: "Lisa Thompson", score: 82, conversations: 110, compliance: 88, trend: "stable", avatar: "LT" },
  { id: 6, name: "James Wilson", score: 71, conversations: 87, compliance: 76, trend: "down", avatar: "JW" },
];

export const qualityTrend = [
  { date: "Jan", score: 82, compliance: 88 },
  { date: "Feb", score: 84, compliance: 89 },
  { date: "Mar", score: 83, compliance: 91 },
  { date: "Apr", score: 86, compliance: 90 },
  { date: "May", score: 88, compliance: 93 },
  { date: "Jun", score: 87, compliance: 92 },
  { date: "Jul", score: 89, compliance: 94 },
  { date: "Aug", score: 91, compliance: 95 },
];

export const alerts = [
  { id: 1, type: "critical" as const, message: "Compliance violation detected in call #4521", agent: "James Wilson", time: "2 min ago" },
  { id: 2, type: "warning" as const, message: "Quality score below threshold for 3 consecutive calls", agent: "Emily Rodriguez", time: "15 min ago" },
  { id: 3, type: "info" as const, message: "New audit completed for batch upload #89", agent: "System", time: "1 hr ago" },
  { id: 4, type: "warning" as const, message: "Empathy score drop detected in recent interactions", agent: "Lisa Thompson", time: "2 hr ago" },
  { id: 5, type: "critical" as const, message: "Required disclaimer not provided during call #4498", agent: "James Wilson", time: "3 hr ago" },
];

export const conversations = [
  {
    id: "CONV-4521",
    agent: "James Wilson",
    customer: "Robert Hayes",
    date: "2026-03-03",
    duration: "12:34",
    score: 68,
    compliance: false,
    type: "call" as const,
    summary: "Customer inquiry about billing dispute. Agent failed to follow required escalation procedure.",
  },
  {
    id: "CONV-4520",
    agent: "Sarah Chen",
    customer: "Maria Santos",
    date: "2026-03-03",
    duration: "08:21",
    score: 95,
    compliance: true,
    type: "chat" as const,
    summary: "Product return request handled efficiently with proper empathy and resolution.",
  },
  {
    id: "CONV-4519",
    agent: "David Kim",
    customer: "Thomas Lee",
    date: "2026-03-02",
    duration: "15:02",
    score: 92,
    compliance: true,
    type: "call" as const,
    summary: "Complex technical support issue resolved in single interaction with excellent communication.",
  },
  {
    id: "CONV-4518",
    agent: "Emily Rodriguez",
    customer: "Jennifer Adams",
    date: "2026-03-02",
    duration: "06:45",
    score: 74,
    compliance: true,
    type: "chat" as const,
    summary: "Account upgrade request. Agent missed opportunity for additional product recommendation.",
  },
  {
    id: "CONV-4517",
    agent: "Marcus Johnson",
    customer: "William Chen",
    date: "2026-03-02",
    duration: "10:18",
    score: 88,
    compliance: true,
    type: "call" as const,
    summary: "Warranty claim processed successfully with proper documentation verification.",
  },
  {
    id: "CONV-4516",
    agent: "Lisa Thompson",
    customer: "Amanda Foster",
    date: "2026-03-01",
    duration: "09:55",
    score: 81,
    compliance: true,
    type: "chat" as const,
    summary: "Shipping delay inquiry. Agent provided adequate solution but could improve tone.",
  },
];

export const transcriptMessages = [
  { role: "agent" as const, text: "Thank you for calling TalkMetrix support. My name is James. How can I help you today?", time: "0:00" },
  { role: "customer" as const, text: "Hi, I'm calling about a charge on my account that I don't recognize. It's for $149.99.", time: "0:08" },
  { role: "agent" as const, text: "I understand your concern about the unrecognized charge. Let me pull up your account right away.", time: "0:15" },
  { role: "customer" as const, text: "I've been a customer for three years and never had this issue before. This is really frustrating.", time: "0:25" },
  { role: "agent" as const, text: "I can see the charge was processed on March 1st. It appears to be for an annual subscription renewal.", time: "0:38" },
  { role: "customer" as const, text: "I never agreed to that renewal! I want a full refund immediately.", time: "0:48" },
  { role: "agent" as const, text: "I understand this is frustrating. Let me look into the refund options available for your account.", time: "0:55" },
];

export const reports = [
  { id: "RPT-001", name: "Weekly Quality Summary", date: "2026-03-01", type: "Quality", status: "completed" as const, size: "2.4 MB" },
  { id: "RPT-002", name: "Compliance Audit Report", date: "2026-02-28", type: "Compliance", status: "completed" as const, size: "1.8 MB" },
  { id: "RPT-003", name: "Agent Performance Review", date: "2026-02-25", type: "Performance", status: "completed" as const, size: "3.1 MB" },
  { id: "RPT-004", name: "Monthly Analytics Export", date: "2026-02-20", type: "Analytics", status: "processing" as const, size: "—" },
  { id: "RPT-005", name: "Customer Satisfaction Analysis", date: "2026-02-15", type: "Quality", status: "completed" as const, size: "1.2 MB" },
];

export const empathyTrend = [
  { date: "Week 1", sarah: 92, marcus: 85, emily: 78, david: 94, lisa: 80, james: 70 },
  { date: "Week 2", sarah: 93, marcus: 87, emily: 76, david: 95, lisa: 82, james: 68 },
  { date: "Week 3", sarah: 91, marcus: 86, emily: 80, david: 93, lisa: 79, james: 72 },
  { date: "Week 4", sarah: 95, marcus: 88, emily: 77, david: 96, lisa: 83, james: 69 },
];
