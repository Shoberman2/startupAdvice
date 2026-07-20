import Image from "next/image";

const GITHUB_URL = "https://github.com/Shoberman2/startupAdvice";

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
  return (
    <main>
      <header className="site-header page-shell">
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
      </header>

      <section className="hero page-shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Open-source Claude Code skills</p>
          <h1>Put your startup idea in a room with the people who shaped the playbook.</h1>
          <p className="hero-dek">
            Two commands turn public founder writing into rigorous, cited conversations—one voice at a time,
            or a board that challenges itself.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
              Get the commands on GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#commands">
              See them in action <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero-proof" aria-label="Product facts">
          <div>
            <strong>43</strong>
            <span>founder and investor voices</span>
          </div>
          <div>
            <strong>3,436</strong>
            <span>public sources indexed</span>
          </div>
          <div>
            <strong>2</strong>
            <span>commands, no app or account</span>
          </div>
        </div>

        <div className="terminal" aria-label="Claude Code command examples">
          <div className="terminal-bar">
            <span>claude</span>
            <span className="terminal-status">source-grounded</span>
          </div>
          <div className="terminal-line">
            <span className="prompt">›</span>
            <code>/founder-conversation paul-graham</code>
          </div>
          <p className="terminal-response">
            <span>Paul Graham selected</span> · reading your idea memo and the most relevant essays…
          </p>
          <div className="terminal-line terminal-line-secondary">
            <span className="prompt">›</span>
            <code>/board-room naval, garry-tan, patrick-collison</code>
          </div>
        </div>
      </section>

      <section className="commands-section page-shell" id="commands">
        <div className="section-intro">
          <p className="eyebrow">Two modes of thinking</p>
          <h2>Office hours when you need focus. A board room when you need friction.</h2>
        </div>

        <article className="command-feature conversation-feature">
          <div className="command-copy">
            <div className="command-number">01</div>
            <code className="command-name">/founder-conversation</code>
            <h3>Choose one mind. Go deep.</h3>
            <p>
              Pick any voice from the full roster. The command reads your current idea memo, retrieves the most
              relevant writing, and runs a focused office-hours conversation with receipts.
            </p>
            <ul className="feature-list">
              <li>One founder or investor at a time</li>
              <li>Persistent idea context between sessions</li>
              <li>Canonical links and verified quotations</li>
            </ul>
          </div>

          <div className="product-preview conversation-preview" aria-label="Founder conversation preview">
            <div className="preview-topline">
              <span>Founder conversation</span>
              <code>idea/vertical-ai.md</code>
            </div>
            <div className="founder-letterhead">
              <Image src="/founders/paul-graham.jpg" alt="Paul Graham" width={240} height={320} />
              <div>
                <strong>Paul Graham</strong>
                <span>Y Combinator · 2005—</span>
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
        </article>

        <article className="command-feature board-feature">
          <div className="command-copy">
            <div className="command-number">02</div>
            <code className="command-name">/board-room</code>
            <h3>Seat a board that disagrees usefully.</h3>
            <p>
              Choose two to five people. Each member researches only their own corpus, opens with a distinct view,
              cross-examines the others, and leaves you with concrete next actions.
            </p>
            <ul className="feature-list">
              <li>Two to five independently grounded voices</li>
              <li>Openings, tensions, cross-examination, synthesis</li>
              <li>Agreements and dissents saved to your memo</li>
            </ul>
          </div>

          <div className="product-preview board-preview" aria-label="Board room preview">
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
              Is the wedge a high-touch learning loop—or a product-led distribution advantage?
            </div>
          </div>
        </article>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-shell how-grid">
          <div className="section-intro">
            <p className="eyebrow">Public writing in. Receipts out.</p>
            <h2>Built to sharpen your judgment, not impersonate anyone.</h2>
          </div>
          <ol className="steps">
            <li>
              <span>01</span>
              <div>
                <h3>Bring an idea</h3>
                <p>Start fresh or reopen a private Markdown memo. Your context stays in your local workspace.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Choose your room</h3>
                <p>Select one voice for depth, or assemble a board of two to five for productive disagreement.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Follow every claim</h3>
                <p>Advice links to the original essays and public sources. Silence is reported instead of invented.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="install-section page-shell" id="install">
        <div className="install-copy">
          <p className="eyebrow">Open source · free forever</p>
          <h2>Clone it. Open Claude. Start the conversation.</h2>
          <p>
            The skills live in the repository and are discovered automatically by Claude Code. No account, hosted
            dashboard, or API key beyond your existing Claude access. Requires Claude Code, Git, and Bun.
          </p>
        </div>
        <div className="install-block">
          <div className="install-block-header">
            <span>Terminal</span>
            <span>macOS · Linux · Windows</span>
          </div>
          <pre><code><span className="code-muted"># 1. Get the workspace</span>{"\n"}git clone https://github.com/Shoberman2/startupAdvice.git founder-panel{"\n"}cd founder-panel{"\n\n"}<span className="code-muted"># 2. Install and open Claude Code</span>{"\n"}bun install{"\n"}claude{"\n\n"}<span className="code-muted"># 3. Run either command</span>{"\n"}/founder-conversation{"\n"}/board-room</code></pre>
        </div>
        <a className="button button-primary install-cta" href={GITHUB_URL} target="_blank" rel="noreferrer">
          View installation on GitHub <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="disclosure page-shell" aria-labelledby="disclosure-title">
        <p className="eyebrow">A clear line</p>
        <h2 id="disclosure-title">The founders are sources—not participants.</h2>
        <p>
          Founder Panel produces AI syntheses grounded in public writing. It is not affiliated with, endorsed by,
          or speaking on behalf of any featured person or company. Every response says so.
        </p>
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
          Portraits via Wikimedia Commons: <a href="https://commons.wikimedia.org/wiki/File:Paulgraham_240x320.jpg">Paul Graham · Sarah Harlin · public domain</a>;{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Naval2019.png">Naval Ravikant · Edmund Hillary Fellowship · CC BY 3.0</a>;{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Garry_Tan,_Web_Summit_2018,_November_6_SD5_6949_(45700698642)(portrait_4x3_crop).jpg">Garry Tan · Web Summit · CC BY 2.0</a>; and{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Patrick_Collison.jpg">Patrick Collison · JD Lasica · CC BY 2.0</a>.
        </div>
      </footer>
    </main>
  );
}
