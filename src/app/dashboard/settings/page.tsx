import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account, report display name, plan, and privacy. Your data stays in your browser and is never sold.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
