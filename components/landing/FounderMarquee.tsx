import Image from "next/image";
import { initials, portraitsBySlug } from "@/lib/portraits";
import { loadRoster } from "@/lib/roster";

export default function FounderMarquee() {
  const members = loadRoster();
  const portraits = portraitsBySlug();
  return (
    <section className="marquee" aria-label={`The full roster of ${members.length} voices`}>
      <p className="sr-only">The roster includes {members.map((m) => m.name).join(", ")}.</p>
      <div className="marquee-track" aria-hidden="true">
        {[...members, ...members].map((member, i) => {
          const portrait = portraits.get(member.slug);
          return (
            <span className="marquee-item" key={i}>
              {portrait ? (
                <Image src={portrait.file} alt="" width={68} height={68} />
              ) : (
                <span className="marquee-initials">{initials(member.name)}</span>
              )}
              {member.name}
              <em>/</em>
            </span>
          );
        })}
      </div>
    </section>
  );
}
