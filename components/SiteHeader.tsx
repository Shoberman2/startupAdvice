import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface SiteHeaderProps {
  /** Right-aligned content. If omitted, the standard nav renders. */
  rightSlot?: React.ReactNode;
  /** Which top-level link is the current section. */
  active?: "ask" | "think" | "with" | "watch" | "founders" | "pinned";
}

export function SiteHeader({ rightSlot, active }: SiteHeaderProps) {
  const items = [
    { key: "founders", label: "Founders", href: "/founders" },
    { key: "think", label: "Think", href: "/think" },
    { key: "with", label: "Talk", href: "/with" },
  ] as const;

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-2)",
      }}
    >
      <Link href="/" className="wordmark">
        Founder Panel
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {rightSlot ?? (
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              gap: "var(--space-3)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
            }}
          >
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  color: active === item.key ? "var(--text)" : "var(--muted)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
