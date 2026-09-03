/** Industry pay multipliers applied on top of role × city. 1.0 = market neutral. */
import type { IndustryDef } from "./types";

export const INDUSTRIES: IndustryDef[] = [
  { name: "Technology", multiplier: 1.06, aliases: ["tech", "software", "saas", "it", "information technology", "internet", "cloud", "startup", "big tech", "semiconductors", "hardware"] },
  { name: "Finance", multiplier: 1.05, aliases: ["financial services", "banking", "bank", "investment", "asset management", "hedge fund", "private equity", "capital markets", "wealth management", "trading"] },
  { name: "Fintech", multiplier: 1.07, aliases: ["payments", "crypto", "blockchain", "neobank", "lending", "insurtech", "digital banking"] },
  { name: "Healthcare", multiplier: 0.98, aliases: ["health", "hospital", "medical", "clinical", "healthtech", "health tech", "provider", "care", "nursing"] },
  { name: "Pharma & Biotech", multiplier: 1.04, aliases: ["pharma", "pharmaceutical", "biotech", "life sciences", "biopharma", "medtech", "medical devices", "genomics"] },
  { name: "E-commerce", multiplier: 1.0, aliases: ["ecommerce", "e commerce", "marketplace", "online retail", "d2c", "dtc", "direct to consumer"] },
  { name: "Retail", multiplier: 0.92, aliases: ["retailer", "stores", "grocery", "consumer goods", "cpg", "fmcg", "apparel", "fashion"] },
  { name: "Consulting", multiplier: 1.03, aliases: ["professional services", "advisory", "management consulting", "agency", "big four", "big 4", "systems integrator"] },
  { name: "Media & Entertainment", multiplier: 0.97, aliases: ["media", "entertainment", "gaming", "games", "publishing", "streaming", "music", "film", "advertising", "adtech"] },
  { name: "Education", multiplier: 0.88, aliases: ["edtech", "university", "school", "academic", "higher education", "learning", "training"] },
  { name: "Government & Public Sector", multiplier: 0.9, aliases: ["government", "public sector", "federal", "state", "municipal", "civil service", "defense", "defence", "military", "nonprofit", "non-profit", "ngo"] },
  { name: "Manufacturing", multiplier: 0.95, aliases: ["industrial", "factory", "automotive", "aerospace", "machinery", "electronics manufacturing", "supply chain", "plant"] },
  { name: "Logistics & Transportation", multiplier: 0.94, aliases: ["logistics", "transportation", "shipping", "freight", "warehouse", "warehousing", "distribution", "3pl", "trucking", "airline", "aviation"] },
  { name: "Energy & Utilities", multiplier: 1.02, aliases: ["energy", "oil and gas", "oil & gas", "utilities", "renewables", "solar", "wind", "power", "climate tech", "cleantech"] },
  { name: "Telecommunications", multiplier: 0.99, aliases: ["telecom", "telco", "wireless", "isp", "networks", "5g", "broadband"] },
  { name: "Real Estate & Construction", multiplier: 0.96, aliases: ["real estate", "construction", "proptech", "property", "architecture", "engineering firm", "aec", "homebuilder"] },
  { name: "Insurance", multiplier: 1.0, aliases: ["insurer", "underwriting", "actuarial", "claims", "reinsurance"] },
  { name: "Hospitality & Travel", multiplier: 0.9, aliases: ["hospitality", "travel", "hotel", "restaurant", "tourism", "leisure", "food service"] },
];

export const DEFAULT_INDUSTRY = INDUSTRIES[0];
