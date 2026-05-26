import { redirect } from "next/navigation";
import { sanitizeAdviceContext } from "@/lib/advice-context";
import { PanelClient } from "./PanelClient";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  company?: string;
  stage?: string;
  traction?: string;
  runway?: string;
  goal?: string;
  constraints?: string;
  lens?: string;
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const question = params.q?.trim() ?? "";
  if (!question) redirect("/");
  if (question.length > 1000) {
    // Server-side hard cap. Client also enforces.
    redirect("/?error=question_too_long");
  }
  const adviceContext = sanitizeAdviceContext(params);
  return <PanelClient question={question} adviceContext={adviceContext} />;
}
