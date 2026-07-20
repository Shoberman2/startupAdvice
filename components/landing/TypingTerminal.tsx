"use client";

import { useEffect, useRef, useState } from "react";

type Step =
  | { kind: "command"; text: string }
  | { kind: "response"; strong: string; rest: string };

const SCRIPT: Step[] = [
  { kind: "command", text: "/founder-conversation paul-graham" },
  { kind: "response", strong: "Paul Graham seated", rest: " · reading your idea memo and 229 essays…" },
  { kind: "command", text: "/board-room naval, garry-tan, patrick-collison" },
  { kind: "response", strong: "3 seats filled", rest: " · every argument cited back to its source…" },
];

const TYPE_MS = 30;
const RESPONSE_DELAY = 480;
const STEP_PAUSE = 600;

function CommandLine({ text, cursor }: { text: string; cursor?: boolean }) {
  return (
    <div className="terminal-line">
      <span className="prompt">›</span>
      <code>
        {text}
        {cursor && <span className="terminal-cursor" aria-hidden="true" />}
      </code>
    </div>
  );
}

function ResponseLine({ strong, rest }: { strong: string; rest: string }) {
  return (
    <p className="terminal-response">
      <span>{strong}</span>
      {rest}
    </p>
  );
}

function Screen({ steps, chars, done }: { steps: number; chars: number; done: boolean }) {
  return (
    <>
      {SCRIPT.slice(0, steps).map((step, i) =>
        step.kind === "command" ? (
          <CommandLine key={i} text={step.text} />
        ) : (
          <ResponseLine key={i} strong={step.strong} rest={step.rest} />
        ),
      )}
      {steps < SCRIPT.length && SCRIPT[steps].kind === "command" && (
        <CommandLine text={(SCRIPT[steps] as { text: string }).text.slice(0, chars)} cursor />
      )}
      {done && <CommandLine text="" cursor />}
    </>
  );
}

export default function TypingTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const [state, setState] = useState({ steps: SCRIPT.length, chars: 0, done: true });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    const play = () => {
      let stepIndex = 0;
      const runStep = () => {
        if (cancelled) return;
        if (stepIndex >= SCRIPT.length) {
          setState({ steps: SCRIPT.length, chars: 0, done: true });
          return;
        }
        const step = SCRIPT[stepIndex];
        if (step.kind === "command") {
          let c = 0;
          const typeChar = () => {
            if (cancelled) return;
            c += 1;
            setState({ steps: stepIndex, chars: c, done: false });
            if (c < step.text.length) {
              later(typeChar, TYPE_MS + Math.random() * 42);
            } else {
              stepIndex += 1;
              later(() => {
                if (cancelled) return;
                setState({ steps: stepIndex, chars: 0, done: false });
                later(runStep, STEP_PAUSE);
              }, 140);
            }
          };
          typeChar();
        } else {
          later(() => {
            if (cancelled) return;
            stepIndex += 1;
            setState({ steps: stepIndex, chars: 0, done: false });
            runStep();
          }, RESPONSE_DELAY);
        }
      };
      setState({ steps: 0, chars: 0, done: false });
      runStep();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || played.current) continue;
          played.current = true;
          observer.disconnect();
          later(play, 200);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="terminal" ref={ref} aria-label="Claude Code command examples">
      <div className="terminal-bar">
        <span>claude</span>
        <span className="terminal-status">source-grounded</span>
      </div>
      <div className="terminal-screen">
        <div className="terminal-sizer" aria-hidden="true">
          <Screen steps={SCRIPT.length} chars={0} done />
        </div>
        <div className="terminal-live">
          <Screen steps={state.steps} chars={state.chars} done={state.done} />
        </div>
        <p className="sr-only">
          Type /founder-conversation to take office hours with one founder, or /board-room to seat
          several. Every answer is cited back to its source.
        </p>
      </div>
    </div>
  );
}
