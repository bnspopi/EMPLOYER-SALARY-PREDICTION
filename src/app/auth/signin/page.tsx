import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your PayLens account to pick up your analyses, pipeline and offers where you left off.",
  robots: { index: false },
  alternates: { canonical: "/auth/signin" },
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
