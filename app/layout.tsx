import type { Metadata } from "next";
import "./globals.css";

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Founder Panel · Startup office hours for Claude Code",
  description:
    "Two open-source Claude Code commands for source-grounded conversations with 50 founders and investors.",
  keywords: ["Claude Code", "Claude skills", "startup advice", "founder advice", "open source"],
  openGraph: {
    title: "Founder Panel",
    description: "Put your startup idea in front of the founders who wrote the playbook.",
    type: "website",
    images: [{ url: "/og.png", width: 1728, height: 909, alt: "Founder Panel for Claude Code" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder Panel",
    description: "Source-grounded startup office hours for Claude Code.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <style>{`.reveal{opacity:1;transform:none}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
