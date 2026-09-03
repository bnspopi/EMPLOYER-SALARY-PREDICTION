import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free PayLens account to save resume versions, track your pipeline and unlock your full analysis.",
  robots: { index: false },
  alternates: { canonical: "/auth/signup" },
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
