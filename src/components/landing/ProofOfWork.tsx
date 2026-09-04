"use client";
import { Button } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Reveal } from "./Reveal";
import { PresenterBackdrop } from "./PresenterBackdrop";
import { PROOF_MODULES, MODULE_ICONS } from "./data";

export function ProofOfWork() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-y border-line py-24 md:py-32" aria-label="Proof of work">
      {/* Set: tungsten-lit studio with a presenter talking to a cinema camera. */}
      <div className="absolute inset-0 z-0">
        <PresenterBackdrop reduced={reduced} />
        {/* Darker on the right so the cards stay readable, lighter on the left so
            the presenter and the camera rig show through. */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/40 via-bg/68 to-bg/88" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <div className="eyebrow text-gold">Everything inside</div>
          <h2 className="display mt-3 text-6xl leading-[0.85] md:text-8xl">
            Proof
            <br />
            of Work<span className="text-ember">.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROOF_MODULES.map((m, i) => {
            const Icon = MODULE_ICONS[i];
            return (
              <Reveal key={m.num} delay={(i % 3) * 0.08}>
                <div className="glass group flex h-full flex-col rounded-xl2 p-6 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="display text-3xl text-dim tabular-nums">{m.num}</span>
                    {Icon ? <Icon className="h-5 w-5 text-muted transition-colors group-hover:text-cyan" aria-hidden /> : null}
                  </div>
                  <h3 className="display mt-6 text-2xl">
                    {m.title}
                    {m.soon ? <span className="ml-2 align-middle text-xs text-ember">— coming soon</span> : null}
                  </h3>
                  <p className="serif-italic mt-2 text-lg text-muted">{m.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 md:flex-row">
          <p className="display text-3xl md:text-4xl">
            Want tools like these for <span className="serif-italic text-ember">your</span> career?
          </p>
          <div className="flex gap-3">
            <Button href="/analyze" variant="ember">Analyze my resume</Button>
            <Button href="/pricing" variant="outline">See pricing</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
