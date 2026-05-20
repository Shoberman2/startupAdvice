import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Server-side founder avatar.
 *
 * Looks for /public/avatars/{slug}.{png,jpg,jpeg,webp} on disk. If found,
 * renders the file. If not, renders a typographic initials placeholder
 * that matches DESIGN.md's /with letterhead spec — circular, accent-soft
 * background, 1px accent border, founder initials in serif accent.
 *
 * To replace any placeholder with a real photo: drop a file at
 *   public/avatars/{slug}.png (or .jpg / .jpeg / .webp)
 * and the next request renders it. No code change needed.
 */
const EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;
const AVATAR_DIR = join(process.cwd(), "public", "avatars");

export interface FounderAvatarProps {
  slug: string;
  name: string;
  /** Diameter in pixels. Defaults to 80. */
  size?: number;
}

function resolveAvatarSrc(slug: string): string | null {
  for (const ext of EXTENSIONS) {
    const filePath = join(AVATAR_DIR, `${slug}.${ext}`);
    if (existsSync(filePath)) {
      return `/avatars/${slug}.${ext}`;
    }
  }
  return null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function FounderAvatar({ slug, name, size = 80 }: FounderAvatarProps) {
  const src = resolveAvatarSrc(slug);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          background: "var(--hairline)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-serif)",
        fontSize: Math.round(size * 0.36),
        fontWeight: 500,
        color: "var(--accent)",
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initials(name)}
    </div>
  );
}
