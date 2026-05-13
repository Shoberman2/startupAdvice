"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatCitation } from "@/lib/chats";
import { splitCitations } from "@/lib/panel/render-citations";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";

interface ChatViewProps {
  founderSlug: string;
  founderName: string;
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

export function ChatView({ founderSlug, founderName }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<StreamingMessage | null>(null);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing chat on mount.
  useEffect(() => {
    const storedId = localStorage.getItem(chatIdKey(founderSlug));
    if (!storedId) return;
    fetch(`/api/chat/${founderSlug}?id=${encodeURIComponent(storedId)}`)
      .then(async (r) => {
        if (!r.ok) {
          // Stale chat id — clear it.
          if (r.status === 404) localStorage.removeItem(chatIdKey(founderSlug));
          return;
        }
        const data = (await r.json()) as { id: string; messages: ChatMessage[] };
        setChatId(data.id);
        setMessages(data.messages);
      })
      .catch(() => {
        /* network problem — start fresh */
      });
  }, [founderSlug]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming?.answer]);

  async function sendMessage(message: string) {
    if (!message || submitting) return;
    setSubmitting(true);
    setError(null);

    // Optimistic: show the user message immediately.
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setStreaming({ retrieved: [], answer: "" });

    try {
      const res = await fetch(`/api/chat/${founderSlug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { user_message?: string };
        };
        throw new Error(body.error?.user_message ?? `HTTP ${res.status}`);
      }

      // Capture the server-assigned chatId.
      const newChatId = res.headers.get("x-chat-id");
      if (newChatId) {
        setChatId(newChatId);
        localStorage.setItem(chatIdKey(founderSlug), newChatId);
      }

      // Some responses are non-streaming JSON (opted_out from no_relevant_chunks).
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as ServerResponse;
        finalizeAssistantMessage(data);
        return;
      }

      // Stream the partial JSON from streamObject.
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const partial = parsePartial(buffer);
        if (partial) {
          setStreaming({
            retrieved: partial.retrieved ?? [],
            answer: partial.answer ?? "",
            opted_out: partial.opted_out,
          });
        }
      }

      // Final parse.
      const final = parsePartial(buffer) ?? { answer: "", retrieved: [] };
      finalizeAssistantMessage({
        retrieved: final.retrieved ?? [],
        answer: final.answer ?? "",
        opted_out: final.opted_out,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStreaming(null);
    } finally {
      setSubmitting(false);
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
          padding: "var(--space-3) 0",
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
            }}
          >
            Ask {founderName} something hard.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <UserBubble key={i} content={m.content} />
          ) : (
            <AssistantBubble
              key={i}
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
          ),
        )}

        {streaming && (
          <AssistantBubble
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
          <div role="alert" style={{ color: "var(--muted)", fontStyle: "italic" }}>
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
            placeholder={`Ask ${founderName}…`}
            disabled={submitting}
            maxLength={2000}
            aria-label={`Message ${founderName}`}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={submitting || !input.trim()}>
            {submitting ? "…" : "Send"}
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

function UserBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: "85%",
        padding: "var(--space-2) var(--space-2)",
        background: "var(--text)",
        color: "var(--bg)",
        borderRadius: 2,
        fontFamily: "var(--font-serif)",
        fontSize: "var(--type-scale-body)",
        lineHeight: 1.45,
      }}
    >
      {content}
    </div>
  );
}

function AssistantBubble(props: {
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
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--type-scale-meta)",
          color: "var(--muted)",
          fontStyle: "italic",
          paddingLeft: 4,
        }}
      >
        {reasonText}
      </div>
    );
  }

  const parts = splitCitations(content);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: "0.04em",
          color: "var(--muted)",
          textTransform: "uppercase",
        }}
      >
        {founderName}
      </div>
      <div
        style={{
          maxWidth: "85%",
          padding: "var(--space-2) 0",
          fontFamily: "var(--font-serif)",
          fontSize: "var(--type-scale-body)",
          lineHeight: 1.55,
          color: "var(--text)",
          borderLeft: "2px solid var(--accent)",
          paddingLeft: "var(--space-2)",
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
        {streaming && <span aria-hidden="true">▍</span>}
      </div>
    </div>
  );
}

function CitationMark(props: {
  num: number;
  streaming?: boolean;
  onClick: () => void;
}) {
  return (
    <sup style={{ fontFamily: "var(--font-mono)", fontSize: "0.7em", margin: "0 1px" }}>
      <button
        type="button"
        onClick={props.onClick}
        disabled={props.streaming}
        style={{
          background: "transparent",
          color: "var(--accent)",
          border: "none",
          padding: 0,
          font: "inherit",
          cursor: props.streaming ? "default" : "pointer",
          opacity: props.streaming ? 0.6 : 1,
        }}
        aria-label={`Open source for citation ${props.num + 1}`}
      >
        [{props.num + 1}]
      </button>
    </sup>
  );
}

function parsePartial(buffer: string): Partial<ServerResponse> | null {
  // Try as-is.
  try {
    return JSON.parse(buffer) as Partial<ServerResponse>;
  } catch {
    /* fall through */
  }
  // Walk and synthesize closers (similar to lib/panel/partial-json.ts but
  // inlined here to keep this file self-contained for the chat surface).
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

