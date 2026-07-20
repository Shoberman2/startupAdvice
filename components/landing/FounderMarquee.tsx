import { loadRoster } from "@/lib/roster";

export default function FounderMarquee() {
  const names = loadRoster().map((member) => member.name);
  return (
    <section className="marquee" aria-label={`The full roster of ${names.length} voices`}>
      <p className="sr-only">The roster includes {names.join(", ")}.</p>
      <div className="marquee-track" aria-hidden="true">
        {[...names, ...names].map((name, i) => (
          <span className="marquee-item" key={i}>
            {name}
            <em>/</em>
          </span>
        ))}
      </div>
    </section>
  );
}
