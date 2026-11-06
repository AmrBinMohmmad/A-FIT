/**
 * Query-key factory (Rakaya D10.10): `[resource]`, `[resource, params]`, `[resource, id]`,
 * `[resource, id, nested]`. The resource segment equals the API path segment; mutations
 * invalidate the resource root.
 */
export const queryKeys = {
  me: ["me"] as const,
  profile: ["me", "profile"] as const,
  dashboard: {
    all: ["dashboard"] as const,
    day: (date: string) => ["dashboard", { date }] as const,
  },
  meals: {
    all: ["meals"] as const,
    day: (date: string) => ["meals", { date }] as const,
    summary: (from: string, to: string) => ["meals", "summary", { from, to }] as const,
    frequent: ["meals", "frequent"] as const,
  },
  steps: {
    all: ["steps"] as const,
    history: (from: string, to: string) => ["steps", { from, to }] as const,
  },
  water: {
    all: ["water"] as const,
    day: (date: string) => ["water", date] as const,
  },
  weights: {
    all: ["weights"] as const,
    history: (from: string, to: string) => ["weights", { from, to }] as const,
  },
  groups: {
    all: ["groups"] as const,
    list: ["groups", "list"] as const,
    detail: (id: number) => ["groups", id] as const,
    leaderboard: (id: number, period: string, date: string) =>
      ["groups", id, "leaderboard", { period, date }] as const,
    challenges: (id: number) => ["groups", id, "challenges"] as const,
  },
  challenges: {
    all: ["challenges"] as const,
    detail: (id: number) => ["challenges", id] as const,
  },
} as const;
