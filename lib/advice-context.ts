export interface AdviceContext {
  company: string;
  stage: string;
  traction: string;
  runway: string;
  goal: string;
  constraints: string;
  lens: string;
}

export type AdviceContextKey = keyof AdviceContext;

export const EMPTY_ADVICE_CONTEXT: AdviceContext = {
  company: "",
  stage: "",
  traction: "",
  runway: "",
  goal: "",
  constraints: "",
  lens: "",
};

const FIELD_LIMITS: Record<AdviceContextKey, number> = {
  company: 280,
  stage: 80,
  traction: 180,
  runway: 120,
  goal: 180,
  constraints: 180,
  lens: 80,
};

const LABELS: Record<AdviceContextKey, string> = {
  company: "Company",
  stage: "Stage",
  traction: "Traction",
  runway: "Runway",
  goal: "Goal",
  constraints: "Constraint",
  lens: "Advice lens",
};

export function sanitizeAdviceContext(raw: Partial<Record<AdviceContextKey, unknown>>): AdviceContext {
  return {
    company: clean(raw.company, FIELD_LIMITS.company),
    stage: clean(raw.stage, FIELD_LIMITS.stage),
    traction: clean(raw.traction, FIELD_LIMITS.traction),
    runway: clean(raw.runway, FIELD_LIMITS.runway),
    goal: clean(raw.goal, FIELD_LIMITS.goal),
    constraints: clean(raw.constraints, FIELD_LIMITS.constraints),
    lens: clean(raw.lens, FIELD_LIMITS.lens),
  };
}

export function parseAdviceContextJson(value: string | null): AdviceContext {
  if (!value) return EMPTY_ADVICE_CONTEXT;
  try {
    const parsed = JSON.parse(value) as Partial<Record<AdviceContextKey, unknown>>;
    return sanitizeAdviceContext(parsed);
  } catch {
    return EMPTY_ADVICE_CONTEXT;
  }
}

export function hasAdviceContext(context: AdviceContext): boolean {
  return Object.values(context).some(Boolean);
}

export function formatAdviceContext(context: AdviceContext): string {
  const lines = (Object.keys(LABELS) as AdviceContextKey[])
    .map((key) => {
      const value = context[key];
      return value ? `${LABELS[key]}: ${value}` : "";
    })
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "No additional startup context provided.";
}

export function adviceRetrievalText(question: string, context: AdviceContext): string {
  if (!hasAdviceContext(context)) return question;
  return `Question: ${question}\n\nStartup context:\n${formatAdviceContext(context)}`;
}

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}
