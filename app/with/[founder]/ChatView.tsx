"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatCitation } from "@/lib/chats";
import { splitCitations } from "@/lib/panel/render-citations";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";
import { PinButton } from "@/components/PinButton";

interface ChatViewProps {
  founderSlug: string;
  founderName: string;
  founderFirstName: string;
}

interface ServerResponse {
  retrieved: { index: number; title: string; url: string; paragraph_idx: number }[];
  answer: string;
  opted_out?: { reason: string };
}

interface StreamingMessage {
  retrieved: ServerResponse["retrieved"];
  answer: string;
  opted_out?: { reason: string };
}

function chatIdKey(slug: string): string {
  return `founder-panel:chat:${slug}`;
}

export function ChatView({ founderSlug, founderName, founderFirstName }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<StreamingMessage | null>(null);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const loadAbortRef = useRef<AbortController | null>(null);
  const sendAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadAbortRef.current?.abort();
      sendAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem(chatIdKey(founderSlug));
    if (!storedId) return;
    const ctrl = new AbortController();
    loadAbortRef.current?.abort();
    loadAbortRef.current = ctrl;

    fetch(`/api/chat/${founderSlug}?id=${encodeURIComponent(storedId)}`, {
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 404) localStorage.removeItem(chatIdKey(founderSlug));
          return;
        }
        const data = (await r.json()) as { id: string; messages: ChatMessage[] };
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setChatId(data.id);
        setMessages(data.messages);
      })
      .catch((e) => {
        if (e instanceof Error && e.name === "AbortError") return;
        /* network problem — start fresh */
      });

    return () => ctrl.abort();
  }, [founderSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming?.answer]);

  async function sendMessage(message: string) {
    if (!message || submitting) return;
    setSubmitting(true);
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setStreaming({ retrieved: [], answer: "" });
    sendAbortRef.current?.abort();
    const ctrl = new AbortController();
    sendAbortRef.current = ctrl;

    try {
      const res = await fetch(`/api/chat/${founderSlug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chatId, message }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { user_message?: string };
        };
        throw new Error(body.error?.user_message ?? `HTTP ${res.status}`);
      }

      const newChatId = res.headers.get("x-chat-id");
      if (newChatId) {
        if (!mountedRef.current || ctrl.signal.aborted) return;
        setChatId(newChatId);
        localStorage.setItem(chatIdKey(founderSlug), newChatId);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as ServerResponse;
        if (!mountedRef.current || ctrl.signal.aborted) return;
        finalizeAssistantMessage(data);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const partial = parsePartial(buffer);
        if (partial && mountedRef.current && !ctrl.signal.aborted) {
          setStreaming({
            retrieved: partial.retrieved ?? [],
            answer: partial.answer ?? "",
            opted_out: partial.opted_out,
          });
        }
      }

      const final = parsePartial(buffer) ?? { answer: "", retrieved: [] };
      if (!mountedRef.current || ctrl.signal.aborted) return;
      finalizeAssistantMessage({
        retrieved: final.retrieved ?? [],
        answer: final.answer ?? "",
        opted_out: final.opted_out,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : String(e));
      setStreaming(null);
    } finally {
      if (sendAbortRef.current === ctrl) sendAbortRef.current = null;
      if (mountedRef.current) setSubmitting(false);
    }
  }

  function finalizeAssistantMessage(data: ServerResponse) {
    setStreaming(null);
    const citations: ChatCitation[] = data.retrieved.map((r) => ({
      index: r.index,
      post_url: r.url,
      post_title: r.title,
      paragraph_idx: r.paragraph_idx,
    }));
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.answer,
        citations,
        ...(data.opted_out ? { opted_out: data.opted_out } : {}),
      },
    ]);
  }

  async function clearConversation() {
    if (!chatId) {
      setMessages([]);
      return;
    }
    await fetch(`/api/chat/${founderSlug}?id=${encodeURIComponent(chatId)}`, {
      method: "DELETE",
    });
    if (!mountedRef.current) return;
    localStorage.removeItem(chatIdKey(founderSlug));
    setChatId(null);
    setMessages([]);
    setStreaming(null);
    setError(null);
  }

  return (
    <>
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          padding: "var(--space-4) 0 var(--space-3)",
          overflowY: "auto",
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 && !streaming && (
          <div
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              padding: "var(--space-4) 0",
              textAlign: "center",
              fontSize: 17,
            }}
          >
            Ask the AI researcher what public sources by {founderFirstName} suggest.
          </div>
        )}

        {messages.map((m, i) => {
          if (m.role === "user") {
            return <UserQuestion key={i} content={m.content} />;
          }
          // Look back for the most recent user question for the pin context.
          let questionText = "";
          for (let j = i - 1; j >= 0; j--) {
            if (messages[j].role === "user") {
              questionText = messages[j].content;
              break;
            }
          }
          const canPin = !m.opted_out && m.content && m.content.trim().length > 0;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FounderReply
                founderName={founderName}
                content={m.content}
                citations={m.citations}
                optedOut={m.opted_out}
                onCitationClick={(c) =>
                  setDrawer({
                    panelistSlug: founderSlug,
                    postUrl: c.post_url,
                    paragraphIndex: c.paragraph_idx,
                  })
                }
              />
              {canPin && (
                <PinButton
                  founderSlug={founderSlug}
                  founderName={founderName}
                  questionText={questionText}
                  answerText={m.content}
                  source="/with"
                />
              )}
            </div>
          );
        })}

        {streaming && (
          <FounderReply
            streaming
            founderName={founderName}
            content={streaming.answer}
            citations={streaming.retrieved.map((r) => ({
              index: r.index,
              post_url: r.url,
              post_title: r.title,
              paragraph_idx: r.paragraph_idx,
            }))}
            optedOut={streaming.opted_out}
            onCitationClick={() => {
              /* citations not clickable mid-stream */
            }}
          />
        )}

        {error && (
          <div
            role="alert"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              color: "var(--text)",
              borderLeft: "2px solid var(--accent)",
              paddingLeft: "var(--space-2)",
            }}
          >
            <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
              Error
            </div>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input.trim());
        }}
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--bg)",
          paddingBottom: "var(--space-3)",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-1)" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${founderFirstName}…`}
            disabled={submitting}
            maxLength={2000}
            aria-label={`Message ${founderName}`}
            style={{
              flex: 1,
              fontFamily: "var(--font-serif)",
              fontStyle: input ? "normal" : "italic",
              fontSize: 17,
              padding: "10px 14px",
            }}
          />
          <button type="submit" disabled={submitting || !input.trim()}>
            {submitting ? "…" : "Ask"}
          </button>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearConversation}
            style={{
              alignSelf: "flex-end",
              background: "transparent",
              color: "var(--muted)",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              cursor: "pointer",
              padding: 4,
            }}
          >
            Clear conversation
          </button>
        )}
      </form>

      <SourceDrawer
        request={drawer}
        panelistName={founderName}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}

function UserQuestion({ content }: { content: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 19,
        lineHeight: 1.5,
        color: "var(--muted)",
        margin: 0,
        paddingLeft: "var(--space-2)",
        borderLeft: "2px solid var(--hairline)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-mono)",
          fontStyle: "normal",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginRight: 6,
          verticalAlign: 2,
        }}
      >
        Q ·
      </span>
      {content}
    </p>
  );
}

function FounderReply(props: {
  founderName: string;
  content: string;
  citations: ChatCitation[];
  optedOut?: { reason: string };
  streaming?: boolean;
  onCitationClick: (c: ChatCitation) => void;
}) {
  const { founderName, content, citations, optedOut, streaming, onCitationClick } = props;

  if (optedOut) {
    const reasonText =
      optedOut.reason === "citation_validation_failed"
        ? "Withheld — couldn't verify a citation."
        : optedOut.reason === "no_relevant_chunks"
          ? `${founderName} hasn't written on this.`
          : "Stepped back from this one.";
    return (
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 17,
          color: "var(--muted)",
          margin: 0,
        }}
      >
        {reasonText}
      </p>
    );
  }

  const parts = splitCitations(content);

  return (
    <p
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: 18,
        lineHeight: 1.65,
        color: "var(--text)",
        margin: 0,
        whiteSpace: "pre-wrap",
      }}
    >
      {parts.map((p, i) =>
        p.kind === "text" ? (
          <span key={i}>{p.text}</span>
        ) : (
          <CitationMark
            key={i}
            num={p.num}
            streaming={streaming}
            onClick={() => {
              const c = citations.find((x) => x.index === p.num);
              if (c) onCitationClick(c);
            }}
          />
        ),
      )}
      {streaming && <span className="stream-caret" aria-hidden="true" />}
    </p>
  );
}

function CitationMark(props: {
  num: number;
  streaming?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.streaming}
      className="cite-mark"
      aria-label={`Open source for citation ${props.num + 1}`}
    >
      [{props.num + 1}]
    </button>
  );
}

function parsePartial(buffer: string): Partial<ServerResponse> | null {
  try {
    return JSON.parse(buffer) as Partial<ServerResponse>;
  } catch {
    /* fall through */
  }
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < buffer.length; i++) {
    const c = buffer[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") {
      if (stack.pop() !== c) return null;
    }
  }
  let closers = "";
  if (inString) closers += '"';
  while (stack.length) closers += stack.pop();
  try {
    return JSON.parse(buffer + closers) as Partial<ServerResponse>;
  } catch {
    return null;
  }
}
