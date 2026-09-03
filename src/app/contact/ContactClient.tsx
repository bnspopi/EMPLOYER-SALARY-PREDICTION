"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui";
import { Field, EMAIL_RE } from "@/components/marketing/Field";

const TOPICS = ["General question", "Billing & plans", "Recruiter enquiry", "Bug report", "Feedback"] as const;

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

export function ContactClient() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate(f: FormState): Errors {
    const e: Errors = {};
    if (f.name.trim().length < 2) e.name = "Please tell us your name.";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (f.message.trim().length < 12) e.message = "A little more detail helps us help you (12+ characters).";
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl2 border border-green/30 bg-panel p-8 text-center"
        role="status"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green/15 text-green">
          <Check size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Message sent.</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Thanks, {form.name.split(" ")[0]}. We&apos;ve got your note about &ldquo;{form.topic}&rdquo; and will reply to{" "}
          <span className="text-fg">{form.email}</span> within one business day.
        </p>
        <Button
          variant="secondary"
          size="md"
          className="mt-6"
          onClick={() => {
            setForm({ name: "", email: "", topic: TOPICS[0], message: "" });
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-xl2 border border-line bg-panel p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" label="Your name" error={errors.name}>
          <input
            id="contact-name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.name}
            placeholder="Jordan Ellis"
            className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
            placeholder="you@example.com"
            className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field id="contact-topic" label="Topic">
          <select
            id="contact-topic"
            value={form.topic}
            onChange={(e) => set("topic")(e.target.value)}
            className="w-full appearance-none rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg focus:border-cyan/60 focus:outline-none"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Field id="contact-message" label="Message" error={errors.message} hint={`${form.message.trim().length} chars`}>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(e) => set("message")(e.target.value)}
            rows={6}
            aria-invalid={!!errors.message}
            placeholder="Tell us what you need — the more context, the faster we can help."
            className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm leading-relaxed text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
          />
        </Field>
      </div>
      <Button type="submit" size="md" className="mt-6 w-full sm:w-auto">
        <Send size={15} /> Send message
      </Button>
    </form>
  );
}
