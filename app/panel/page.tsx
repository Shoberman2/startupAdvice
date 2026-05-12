import { redirect } from "next/navigation";
import { PanelClient } from "./PanelClient";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
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
  return <PanelClient question={question} />;
}
