export const BRAND = {
  name: "PayLens",
  tagline: "Career intelligence powered by real market data.",
  eyebrow: "Salary · Offers · Job Search · Career Growth",
  domain: "paylens.app",
  supportEmail: "hello@paylens.app",
  markets: ["United States", "Canada", "United Kingdom"] as const,
  stats: [
    { value: "5.0★", label: "Average user rating" },
    { value: "3", label: "Countries covered" },
    { value: "12K+", label: "Analyses completed" },
    { value: "93%", label: "Would recommend" },
    { value: "100%", label: "Data stays private" },
  ],
} as const;
