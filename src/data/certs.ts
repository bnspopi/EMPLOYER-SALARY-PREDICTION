/**
 * Certifications that measurably move pay, each mapped to the canonical roles it applies to.
 * `uplift` is the median salary bump (%) attributed to holding the credential in a relevant role.
 * All `roles` strings must match canonical role names in src/data/roles.ts.
 */
import type { CertDef } from "./types";

function c(name: string, provider: string, duration: string, uplift: number, roles: string[], url?: string): CertDef {
  return { name, provider, duration, uplift, roles, url };
}

export const CERTS: CertDef[] = [
  // ---------------- Cloud & infrastructure ----------------
  c("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "3-4 months", 18,
    ["Cloud Architect", "Solutions Architect", "DevOps Engineer", "Backend Engineer", "Site Reliability Engineer", "Software Engineer"],
    "https://aws.amazon.com/certification/certified-solutions-architect-associate/"),
  c("AWS Certified Solutions Architect – Professional", "Amazon Web Services", "4-6 months", 21,
    ["Cloud Architect", "Solutions Architect", "DevOps Engineer"]),
  c("AWS Certified Developer – Associate", "Amazon Web Services", "2-3 months", 14,
    ["Backend Engineer", "API Developer", "Software Engineer", "Integration Engineer"]),
  c("AWS Certified DevOps Engineer – Professional", "Amazon Web Services", "4-5 months", 17,
    ["DevOps Engineer", "Site Reliability Engineer", "Cloud Architect"]),
  c("Google Professional Cloud Architect", "Google Cloud", "3-4 months", 16,
    ["Cloud Architect", "Solutions Architect", "DevOps Engineer"]),
  c("Google Professional Data Engineer", "Google Cloud", "2-3 months", 14,
    ["Data Engineer", "Data Scientist", "Machine Learning Engineer"]),
  c("Microsoft Azure Solutions Architect Expert", "Microsoft", "3-4 months", 15,
    ["Cloud Architect", "Solutions Architect", "DevOps Engineer"]),
  c("Microsoft Azure Administrator Associate", "Microsoft", "2-3 months", 11,
    ["DevOps Engineer", "Site Reliability Engineer", "Technical Support Engineer"]),
  c("Microsoft Azure Fundamentals", "Microsoft", "3-5 weeks", 5,
    ["Software Engineer", "Technical Support Engineer", "Business Analyst"]),
  c("Certified Kubernetes Administrator (CKA)", "Cloud Native Computing Foundation", "2-3 months", 15,
    ["DevOps Engineer", "Site Reliability Engineer", "Cloud Architect", "Backend Engineer"]),
  c("Certified Kubernetes Application Developer (CKAD)", "Cloud Native Computing Foundation", "6-8 weeks", 12,
    ["DevOps Engineer", "Backend Engineer", "Software Engineer"]),
  c("HashiCorp Terraform Associate", "HashiCorp", "4-6 weeks", 10,
    ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"]),

  // ---------------- Security ----------------
  c("CISSP", "(ISC)²", "4-6 months", 19,
    ["Security Engineer", "Cloud Architect", "Solutions Architect"]),
  c("Certified Information Security Manager (CISM)", "ISACA", "3-4 months", 16,
    ["Security Engineer", "Cloud Architect"]),
  c("Certified Ethical Hacker (CEH)", "EC-Council", "2-3 months", 11,
    ["Security Engineer"]),
  c("CompTIA Security+", "CompTIA", "6-8 weeks", 9,
    ["Security Engineer", "Technical Support Engineer", "QA Engineer"]),
  c("CompTIA Network+", "CompTIA", "6-8 weeks", 6,
    ["Technical Support Engineer", "DevOps Engineer", "Security Engineer"]),
  c("CompTIA A+", "CompTIA", "4-6 weeks", 4,
    ["Technical Support Specialist", "Technical Support Engineer", "Customer Service Specialist"]),

  // ---------------- Data, analytics & AI ----------------
  c("SnowPro Core Certification", "Snowflake", "6-8 weeks", 12,
    ["Data Engineer", "Data Analyst", "Data Scientist"]),
  c("Databricks Certified Data Engineer Associate", "Databricks", "6-8 weeks", 13,
    ["Data Engineer", "Machine Learning Engineer"]),
  c("Databricks Certified Machine Learning Professional", "Databricks", "3-4 months", 15,
    ["Machine Learning Engineer", "AI Engineer", "Data Scientist"]),
  c("TensorFlow Developer Certificate", "Google", "2-3 months", 10,
    ["Machine Learning Engineer", "AI Engineer", "Data Scientist"]),
  c("Google Data Analytics Professional Certificate", "Google", "3-6 months", 8,
    ["Data Analyst", "Business Analyst"]),
  c("Tableau Desktop Specialist", "Tableau", "4-6 weeks", 7,
    ["Data Analyst", "Business Analyst", "Data Scientist"]),
  c("Microsoft Power BI Data Analyst Associate", "Microsoft", "6-8 weeks", 7,
    ["Data Analyst", "Business Analyst"]),

  // ---------------- Product, project & agile ----------------
  c("PMP (Project Management Professional)", "Project Management Institute", "3-6 months", 11,
    ["Project Manager", "Program Manager", "Product Manager", "Engineering Manager", "General Manager"]),
  c("Certified ScrumMaster (CSM)", "Scrum Alliance", "2-4 weeks", 7,
    ["Scrum Master", "Project Manager", "Product Manager", "Program Manager"]),
  c("Professional Scrum Master (PSM I)", "Scrum.org", "2-4 weeks", 7,
    ["Scrum Master", "Technical Product Manager", "Project Manager"]),
  c("PMI Agile Certified Practitioner (PMI-ACP)", "Project Management Institute", "2-3 months", 8,
    ["Program Manager", "Project Manager", "Scrum Master"]),
  c("Pragmatic Institute Product Management Certification", "Pragmatic Institute", "4-6 weeks", 9,
    ["Product Manager", "Technical Product Manager"]),

  // ---------------- CRM, marketing & sales ----------------
  c("Salesforce Certified Administrator", "Salesforce", "2-3 months", 10,
    ["Technical Sales", "Account Executive", "Operations Specialist"]),
  c("Salesforce Certified Platform Developer I", "Salesforce", "3-4 months", 12,
    ["API Developer", "Integration Engineer", "Backend Engineer"]),
  c("HubSpot Inbound Marketing Certification", "HubSpot Academy", "1-2 weeks", 5,
    ["Digital Marketing Specialist", "Marketing Manager", "Content Strategist"]),
  c("Google Ads Certification", "Google", "1-2 weeks", 5,
    ["Digital Marketing Specialist", "Marketing Manager"]),

  // ---------------- People & finance ----------------
  c("SHRM-CP", "Society for Human Resource Management", "3-4 months", 9,
    ["HR Manager", "Recruiter", "Director of Administration"]),
  c("Professional in Human Resources (PHR)", "HR Certification Institute", "3-4 months", 8,
    ["HR Manager", "Recruiter"]),
  c("CPA (Certified Public Accountant)", "AICPA", "9-18 months", 15,
    ["Accountant", "Financial Analyst"]),
  c("CFA (Chartered Financial Analyst)", "CFA Institute", "18-36 months", 17,
    ["Financial Analyst", "Accountant"]),

  // ---------------- Operations & service ----------------
  c("Lean Six Sigma Green Belt", "ASQ", "2-3 months", 7,
    ["Operations Specialist", "Operations Manager", "Warehouse Operations Manager", "Business Analyst"]),
  c("Lean Six Sigma Black Belt", "ASQ", "4-6 months", 11,
    ["Operations Manager", "General Manager", "Warehouse Operations Manager"]),
  c("ITIL 4 Foundation", "Axelos", "3-4 weeks", 6,
    ["Technical Support Engineer", "Technical Support Specialist", "Operations Manager", "Site Reliability Engineer"]),
  c("Certified Supply Chain Professional (CSCP)", "APICS/ASCM", "3-5 months", 9,
    ["Warehouse Operations Manager", "Operations Manager"]),

  // ---------------- Design ----------------
  c("Nielsen Norman Group UX Certification", "Nielsen Norman Group", "1-3 months", 9,
    ["UX Designer", "Product Designer", "UI Designer"]),
  c("Google UX Design Professional Certificate", "Google", "3-6 months", 6,
    ["UX Designer", "UI Designer", "Product Designer"]),

  // ---------------- Healthcare ----------------
  c("Registered Nurse (RN) Licensure — NCLEX-RN", "NCSBN", "State licensure", 20,
    ["Registered Nurse"]),
  c("Certified Professional in Healthcare Quality (CPHQ)", "NAHQ", "2-4 months", 10,
    ["Healthcare Administrator", "Registered Nurse"]),
];

export default CERTS;
