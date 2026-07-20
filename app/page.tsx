import Image from "next/image";
import type { CSSProperties } from "react";
import CountUp from "@/components/landing/CountUp";
import FounderMarquee from "@/components/landing/FounderMarquee";
import Reveal from "@/components/landing/Reveal";
import TypingTerminal from "@/components/landing/TypingTerminal";
import { loadPortraits } from "@/lib/portraits";
import { rosterStats } from "@/lib/roster";

const GITHUB_URL = "https://github.com/Shoberman2/startupAdvice";

const stagger = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const boardMembers = [
  {
    name: "Naval Ravikant",
    company: "AngelList",
    image: "/founders/naval-ravikant.png",
    take: "Start with the leverage: what gets cheaper or more valuable every time another customer joins?",
  },
  {
    name: "Garry Tan",
    company: "Y Combinator",
    image: "/founders/garry-tan.jpg",
    take: "Your first job is narrower. Find ten people who feel this problem every week, then watch them use it.",
  },
  {
    name: "Patrick Collison",
    company: "Stripe",
    image: "/founders/patrick-collison.jpg",
    take: "The interesting question is whether your product makes a hard workflow disappear, not merely faster.",
  },
];

export default function HomePage() {
  const stats = rosterStats();
  const portraits = loadPortraits();
  return (
    <main id="top">
      <header className="site-header">
        <div className="page-shell header-inner">
          <a className="wordmark" href="#top" aria-label="Founder Panel home">
            Founder Panel<span className="wordmark-mark">/</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#commands">Commands</a>
            <a href="#how-it-works">How it works</a>
            <a className="nav-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>

      <section className="hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow fade-up" style={stagger(0)}>
            Free, open-source Claude Code skills
          </p>
          <h1 className="fade-up" style={stagger(90)}>
            Put your startup idea in front of the founders who wrote the{" "}
            <em className="hl">playbook</em>.
          </h1>
          <p className="hero-dek fade-up" style={stagger(190)}>
            Two Claude Code commands for source-grounded startup advice. Take office hours with one
            founder, or seat a board that debates your idea. Every answer is drawn from what they
            actually wrote and cited back to the source.
          </p>
          <div className="hero-actions fade-up" style={stagger(290)}>
            <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
              Get it free on GitHub <span className="button-arrow" aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#commands">
              Watch it work <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="cta-note fade-up" style={stagger(360)}>
            Open source · Works with the Claude Code you already have · 2-minute setup
          </p>
        </div>

        <aside className="hero-rail fade-up" style={stagger(420)} aria-label="Product facts">
          <div className="rail-avatars">
            <div className="avatar-stack" aria-hidden="true">
              <Image src="/founders/paul-graham.jpg" alt="" width={240} height={320} />
              <Image src="/founders/naval-ravikant.png" alt="" width={220} height={220} />
              <Image src="/founders/garry-tan.jpg" alt="" width={220} height={220} />
              <Image src="/founders/patrick-collison.jpg" alt="" width={220} height={220} />
              <span className="avatar-more">+{stats.voices - 4}</span>
            </div>
            <p>
              Paul Graham, Naval Ravikant, Garry Tan, Patrick Collison and {stats.voices - 4}{" "}
              more, argued from their own writing only.
            </p>
          </div>
          <div className="rail-stats">
            <div>
              <strong>
                <CountUp value={stats.voices} />
              </strong>
              <span>founder and investor voices</span>
            </div>
            <div>
              <strong>
                <CountUp value={stats.posts} />
              </strong>
              <span>essays and posts indexed</span>
            </div>
            <div>
              <strong>{stats.millionWords}M</strong>
              <span>words of primary sources</span>
            </div>
            <div>
              <strong>2</strong>
              <span>commands, no app, no account</span>
            </div>
          </div>
        </aside>

        <div className="hero-terminal fade-up" style={stagger(520)}>
          <TypingTerminal />
        </div>
      </section>

      <FounderMarquee />

      <section className="commands-section page-shell" id="commands">
        <Reveal className="section-intro">
          <p className="eyebrow">Two modes of thinking</p>
          <h2>Office hours when you need focus. A board room when you need friction.</h2>
        </Reveal>

        <article className="command-feature conversation-feature">
          <Reveal className="command-copy">
            <div className="command-number">01</div>
            <code className="command-name">/founder-conversation</code>
            <h3>Choose one mind. Go deep.</h3>
            <p>
              Pick any of the {stats.voices} voices. Claude reads your idea memo, pulls that
              person&apos;s most relevant writing, and runs a focused office-hours conversation with
              receipts.
            </p>
            <ul className="feature-list">
              <li>One founder or investor at a time</li>
              <li>Persistent idea context between sessions</li>
              <li>Canonical links and verified quotations</li>
            </ul>
          </Reveal>

          <Reveal className="product-preview conversation-preview" delay={120}>
            <div aria-label="Founder conversation preview">
              <div className="preview-topline">
                <span>Founder conversation</span>
                <code>idea/vertical-ai.md</code>
              </div>
              <div className="founder-letterhead">
                <Image src="/founders/paul-graham.jpg" alt="Paul Graham" width={240} height={320} />
                <div>
                  <strong>Paul Graham</strong>
                  <span>Y Combinator · since 2005</span>
                </div>
              </div>
              <blockquote>
                <span>Q ·</span> We have early users, but they all use the product differently. Is that a warning sign?
              </blockquote>
              <div className="letter-response">
                <p>
                  At this stage, variety is less dangerous than indifference. The useful signal is whether a small
                  group would be genuinely upset if you stopped. Graham&apos;s advice is to do things that let you learn
                  directly from those first users.<sup>[1]</sup>
                </p>
                <p className="source-line">[1] Do Things that Don&apos;t Scale · paulgraham.com ↗</p>
              </div>
              <div className="preview-composer">Ask a follow-up… <span>Send →</span></div>
            </div>
          </Reveal>
        </article>

        <article className="command-feature board-feature">
          <Reveal className="command-copy">
            <div className="command-number">02</div>
            <code className="command-name">/board-room</code>
            <h3>Seat a board that disagrees usefully.</h3>
            <p>
              Choose two to five people. Each member argues only from their own corpus: opening
              views, cross-examination, and a chair who names the real tension before you get
              concrete next actions.
            </p>
            <ul className="feature-list">
              <li>Two to five independently grounded voices</li>
              <li>Openings, tensions, cross-examination, synthesis</li>
              <li>Agreements and dissents saved to your memo</li>
            </ul>
          </Reveal>

          <Reveal className="product-preview board-preview" delay={120}>
            <div aria-label="Board room preview">
              <div className="preview-topline">
                <span>Board room · Round 1</span>
                <code>3 members</code>
              </div>
              <h4>Should we sell to operators first, or go bottom-up?</h4>
              <div className="board-columns">
                {boardMembers.map((member, index) => (
                  <div className="board-member" key={member.name}>
                    <div className="member-heading">
                      <Image src={member.image} alt={member.name} width={220} height={220} />
                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.company}</span>
                      </div>
                    </div>
                    <p>{member.take}<sup>[{index + 1}]</sup></p>
                  </div>
                ))}
              </div>
              <div className="board-tension">
                <span>Chair&apos;s tension</span>
                Is the wedge a high-touch learning loop, or a product-led distribution advantage?
              </div>
            </div>
          </Reveal>
        </article>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-shell how-grid">
          <Reveal className="section-intro">
            <p className="eyebrow">Public writing in. Receipts out.</p>
            <h2>Built to sharpen your judgment, not impersonate anyone.</h2>
          </Reveal>
          <ol className="steps">
            <li>
              <Reveal className="step-inner">
                <span>01</span>
                <div>
                  <h3>Bring an idea</h3>
                  <p>Start fresh or reopen a private Markdown memo. Your context never leaves your local workspace.</p>
                </div>
              </Reveal>
            </li>
            <li>
              <Reveal className="step-inner" delay={110}>
                <span>02</span>
                <div>
                  <h3>Choose your room</h3>
                  <p>Select one voice for depth, or assemble a board of two to five for productive disagreement.</p>
                </div>
              </Reveal>
            </li>
            <li>
              <Reveal className="step-inner" delay={220}>
                <span>03</span>
                <div>
                  <h3>Follow every claim</h3>
                  <p>Advice links to the original essays. When the sources are silent, it says so instead of inventing.</p>
                </div>
              </Reveal>
            </li>
          </ol>
        </div>
      </section>

      <section className="install-band" id="install">
        <div className="page-shell install-section">
          <Reveal className="install-copy">
            <p className="eyebrow">Open source · free forever</p>
            <h2>Clone it. Open Claude Code. Start the conversation.</h2>
            <p>
              The skills live in the repository and are discovered automatically by Claude Code. No
              account, hosted dashboard, or API key beyond your existing Claude access. Requires
              Claude Code, Git, and Bun.
            </p>
            <div className="install-cta">
              <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
                View installation on GitHub <span className="button-arrow" aria-hidden="true">↗</span>
              </a>
              <p className="cta-note">Free forever · AGPL-3.0 · Star it if it sharpens your thinking</p>
            </div>
          </Reveal>
          <Reveal className="install-block-wrap" delay={120}>
            <div className="install-block">
              <div className="install-block-header">
                <span>Terminal</span>
                <span>macOS · Linux · Windows</span>
              </div>
              <pre><code><span className="code-muted"># 1. Get the workspace</span>{"\n"}git clone https://github.com/Shoberman2/startupAdvice.git founder-panel{"\n"}cd founder-panel{"\n\n"}<span className="code-muted"># 2. Install and open Claude Code</span>{"\n"}bun install{"\n"}claude{"\n\n"}<span className="code-muted"># 3. Run either command</span>{"\n"}/founder-conversation{"\n"}/board-room</code></pre>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="disclosure-band page-shell" aria-labelledby="disclosure-title">
        <Reveal className="disclosure">
          <p className="eyebrow">A clear line</p>
          <h2 id="disclosure-title">The founders are sources, not participants.</h2>
          <p>
            Founder Panel produces AI syntheses grounded in public writing. It is not affiliated with, endorsed by,
            or speaking on behalf of any featured person or company. Every response says so.
          </p>
        </Reveal>
      </section>

      <footer className="site-footer page-shell">
        <div>
          <a className="wordmark" href="#top">Founder Panel<span className="wordmark-mark">/</span></a>
          <p>Open-source startup office hours for Claude Code.</p>
        </div>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License ↗</a>
          <a href="#image-credits">Portrait credits</a>
        </div>
        <div className="image-credits" id="image-credits">
          Portraits via Wikimedia Commons:{" "}
          {portraits.map((portrait, index) => (
            <span key={portrait.slug}>
              <a href={portrait.sourceFilePage}>
                {portrait.name} · {portrait.author} · {portrait.license}
              </a>
              {index < portraits.length - 1 ? "; " : "."}
            </span>
          ))}{" "}
          Members without a licensed portrait are shown as initials.
        </div>
      </footer>
    </main>
  );
}
