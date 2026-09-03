"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui";
import { Field, EMAIL_RE } from "@/components/marketing/Field";
import { safeCallback } from "@/components/marketing/format";
import { Accent } from "@/components/marketing/PageHero";

type Errors = { name?: string; email?: string };

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const signIn = useApp((s) => s.signIn);

  const isSignup = mode === "signup";
  const isRecruiter = params.get("type") === "recruiter";
  const callbackUrl = safeCallback(params.get("callbackUrl"), isRecruiter ? "/for-recruiters" : "/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
    setErrors(e);
    if (Object.keys(e).length) return;
    signIn({ name: name.trim(), email: email.trim() });
    router.push(callbackUrl);
  }

  return (
    <div className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-5 py-28">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_5%,transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-xl2 border border-line bg-panel p-7 shadow-panel md:p-8"
      >
        <div className="eyebrow text-cyan">{isRecruiter ? "Recruiter access" : "PayLens account"}</div>
        <h1 className="mt-2 display text-4xl leading-none">
          {isSignup ? (
            <>
              Create your <Accent tone="gold">account</Accent>.
            </>
          ) : (
            <>
              Welcome <Accent tone="gold">back</Accent>.
            </>
          )}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {isSignup
            ? "Save resume versions, track your pipeline and unlock your full analysis. Stored locally in your browser — no password required."
            : "Sign in to pick up where you left off. Your data lives in this browser."}
        </p>

        {isRecruiter ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-md border border-gold/30 bg-gold/5 p-3 text-xs text-muted">
            <Building2 size={15} className="mt-0.5 shrink-0 text-gold" />
            <span>
              You&apos;re signing {isSignup ? "up" : "in"} for the recruiter track — 14-day free trial, no card. We&apos;ll take
              you straight to the benchmarking tools.
            </span>
          </div>
        ) : null}

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field id="auth-name" label="Name" error={errors.name}>
            <input
              id="auth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.name}
              placeholder="Jordan Ellis"
              className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
            />
          </Field>
          <Field id="auth-email" label="Email" error={errors.email}>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={!!errors.email}
              placeholder="you@example.com"
              className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
            />
          </Field>
          <Button type="submit" size="md" className="w-full">
            {isSignup ? "Create account" : "Sign in"} <ArrowRight size={15} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href={authHref("/auth/signin", params)} className="text-cyan hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to PayLens?{" "}
              <Link href={authHref("/auth/signup", params)} className="text-cyan hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}

function authHref(base: string, params: ReturnType<typeof useSearchParams>) {
  const qs = new URLSearchParams();
  const cb = params.get("callbackUrl");
  const type = params.get("type");
  if (cb) qs.set("callbackUrl", cb);
  if (type) qs.set("type", type);
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}
