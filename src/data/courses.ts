/**
 * Recommended courses that build a single canonical skill (see src/data/skills.ts).
 * `uplift` is the median salary bump (%) attributed to demonstrably acquiring the skill.
 * Every `skill` value must match a SkillDef name exactly so the roadmap can join on it.
 */
import type { CourseDef } from "./types";

function co(name: string, provider: string, duration: string, skill: string, uplift: number, url?: string): CourseDef {
  return { name, provider, duration, skill, uplift, url };
}

export const COURSES: CourseDef[] = [
  // ---------------- Programming languages ----------------
  co("Python for Everybody", "Coursera", "8 weeks", "Python", 7),
  co("Advanced Python: Idiomatic Patterns", "Pluralsight", "6 weeks", "Python", 5),
  co("The Complete TypeScript Bootcamp", "Udemy", "5 weeks", "TypeScript", 8),
  co("Modern React with Hooks & Suspense", "Udemy", "6 weeks", "React", 8),
  co("Next.js: The Full-Stack Path", "Coursera", "5 weeks", "Next.js", 9),
  co("Node.js Microservices at Scale", "Pluralsight", "6 weeks", "Node.js", 7),
  co("Go: Building Scalable Services", "Udacity", "8 weeks", "Go", 9),
  co("Rust Programming Fundamentals", "edX", "8 weeks", "Rust", 9),
  co("Java Enterprise Development", "Coursera", "10 weeks", "Java", 6),
  co("SQL for Data Analysis", "DataCamp", "4 weeks", "SQL", 7),

  // ---------------- Core engineering ----------------
  co("System Design Interview Masterclass", "Educative", "6 weeks", "System Design", 10),
  co("Distributed Systems Deep Dive", "edX", "12 weeks", "Distributed Systems", 11),
  co("Data Structures & Algorithms in Depth", "Coursera", "10 weeks", "Data Structures & Algorithms", 8),
  co("Test Automation with Playwright & Cypress", "Test Automation University", "4 weeks", "Test Automation", 6),
  co("Web Performance Optimization", "Frontend Masters", "3 weeks", "Performance Optimization", 6),

  // ---------------- Cloud & DevOps ----------------
  co("AWS Certified Solutions Architect Prep", "A Cloud Guru", "8 weeks", "AWS", 12),
  co("Docker & Kubernetes: The Complete Guide", "Udemy", "6 weeks", "Kubernetes", 11),
  co("Infrastructure as Code with Terraform", "HashiCorp Learn", "5 weeks", "Terraform", 9),
  co("CI/CD Pipelines with GitHub Actions", "Pluralsight", "4 weeks", "CI/CD", 7),
  co("Cloud Architecture on AWS", "Coursera", "8 weeks", "Cloud Architecture", 12),
  co("Observability with Prometheus & Grafana", "Udemy", "4 weeks", "Observability", 8),
  co("Site Reliability Engineering Foundations", "Coursera", "6 weeks", "Site Reliability Engineering", 10),

  // ---------------- Data engineering & analytics ----------------
  co("Data Engineering with Apache Spark", "Databricks Academy", "8 weeks", "Apache Spark", 11),
  co("Streaming Data with Apache Kafka", "Confluent Developer", "5 weeks", "Apache Kafka", 10),
  co("Analytics Engineering with dbt", "DataCamp", "5 weeks", "dbt", 9),
  co("Building Data Pipelines with Airflow", "Udacity", "6 weeks", "Apache Airflow", 9),
  co("Snowflake Data Warehousing", "Coursera", "5 weeks", "Snowflake", 10),
  co("Dimensional Data Modeling for Analytics", "DataCamp", "4 weeks", "Data Modeling", 7),
  co("Data Visualization with Tableau", "DataCamp", "4 weeks", "Tableau", 7),
  co("Statistics for Data Science", "DataCamp", "6 weeks", "Statistics", 8),
  co("A/B Testing & Experimentation", "Udacity", "4 weeks", "A/B Testing", 8),
  co("Excel to Advanced Analytics", "Coursera", "4 weeks", "Microsoft Excel", 4),

  // ---------------- AI / ML ----------------
  co("Machine Learning Specialization", "Coursera", "12 weeks", "Machine Learning", 12),
  co("Deep Learning with PyTorch", "Udacity", "10 weeks", "PyTorch", 12),
  co("TensorFlow in Practice", "Coursera", "8 weeks", "TensorFlow", 10),
  co("Natural Language Processing Specialization", "Coursera", "10 weeks", "Natural Language Processing", 11),
  co("Building LLM Applications", "DeepLearning.AI", "4 weeks", "Large Language Models", 14),
  co("ChatGPT Prompt Engineering for Developers", "DeepLearning.AI", "2 weeks", "Prompt Engineering", 12),
  co("Retrieval-Augmented Generation in Production", "DeepLearning.AI", "4 weeks", "Retrieval-Augmented Generation", 14),
  co("LangChain: Build LLM-Powered Apps", "Udemy", "3 weeks", "LangChain", 12),
  co("MLOps Engineering on the Cloud", "Coursera", "8 weeks", "MLOps", 12),
  co("Computer Vision Fundamentals", "Udacity", "8 weeks", "Computer Vision", 10),

  // ---------------- Product & design ----------------
  co("Product Management Foundations", "Coursera", "6 weeks", "Product Strategy", 8),
  co("Product Analytics with SQL & Amplitude", "Reforge", "4 weeks", "Product Analytics", 8),
  co("User Research Methods", "Interaction Design Foundation", "6 weeks", "User Research", 7),
  co("Agile & Scrum Mastery", "Udemy", "4 weeks", "Scrum", 6),
  co("Roadmapping & Prioritization", "Reforge", "4 weeks", "Product Roadmapping", 7),
  co("UX Design Professional Certificate", "Coursera", "12 weeks", "User Experience Design", 8),
  co("Figma for Product Designers", "Udemy", "4 weeks", "Figma", 7),
  co("Design Systems with Figma", "DesignLab", "6 weeks", "Design Systems", 8),
  co("Interaction Design Principles", "Interaction Design Foundation", "6 weeks", "Interaction Design", 7),

  // ---------------- Marketing & sales ----------------
  co("SEO Fundamentals", "Semrush Academy", "3 weeks", "SEO", 6),
  co("Google Ads & SEM Mastery", "Udemy", "4 weeks", "SEM", 6),
  co("Content Marketing Strategy", "HubSpot Academy", "4 weeks", "Content Marketing", 5),
  co("Marketing Analytics with GA4", "Coursera", "4 weeks", "Marketing Analytics", 6),
  co("Salesforce CRM Administration", "Trailhead", "6 weeks", "Salesforce", 9),
  co("Enterprise Sales Methodology", "LinkedIn Learning", "4 weeks", "Enterprise Sales", 7),
  co("Solution Selling Bootcamp", "Udemy", "3 weeks", "Solution Selling", 6),

  // ---------------- Finance, ops, people & security ----------------
  co("Financial Modeling & Valuation", "Wall Street Prep", "8 weeks", "Financial Modeling", 10),
  co("FP&A Masterclass", "Corporate Finance Institute", "6 weeks", "FP&A", 9),
  co("Accounting Fundamentals", "Coursera", "6 weeks", "Accounting", 6),
  co("Lean Six Sigma Green Belt", "Udemy", "8 weeks", "Six Sigma", 7),
  co("Supply Chain Analytics", "edX", "6 weeks", "Supply Chain Management", 7),
  co("Project Management Professional Prep", "Coursera", "8 weeks", "Project Management", 9),
  co("Technical Recruiting Bootcamp", "LinkedIn Learning", "3 weeks", "Technical Recruiting", 6),
  co("Cybersecurity Fundamentals", "edX", "8 weeks", "Cybersecurity", 10),
  co("Penetration Testing & Ethical Hacking", "TryHackMe", "8 weeks", "Penetration Testing", 11),
];

export default COURSES;
