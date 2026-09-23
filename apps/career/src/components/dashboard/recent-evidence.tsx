import Link from "next/link";

import { ArrowIcon, EvidenceIcon } from "@/components/icons";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { CAPABILITY_DEFINITIONS } from "@/lib/constants/career";
import type { EvidenceFixture } from "@/lib/fixtures/dashboard";
import { formatChineseDate } from "@/lib/date";

export function RecentEvidence({ evidence }: { evidence: readonly EvidenceFixture[] }) {
  return (
    <section className="evidence-section" aria-labelledby="evidence-title">
      <SectionHeading
        title="最近成长证据"
        titleId="evidence-title"
        description="近期在真实工作与复盘中留下的能力证明。"
        action={<Link className="section-link" href="/evidence">查看全部 <ArrowIcon /></Link>}
      />
      <div className="evidence-list">
        {evidence.map((item) => {
          const capabilityNames = item.capabilities.map((slug) =>
            CAPABILITY_DEFINITIONS.find((definition) => definition.slug === slug)?.name,
          ).filter(Boolean).join(" · ");
          return (
            <Link className="evidence-row" href={`/evidence/${item.id}`} key={item.id}>
              <span className="evidence-row__icon"><EvidenceIcon /></span>
              <div className="evidence-row__main">
                <h3>{item.title}</h3>
                <p>{capabilityNames}</p>
              </div>
              <span className="evidence-level">E{item.level} — {item.levelLabel}</span>
              <time dateTime={item.occurredOn}>{formatChineseDate(item.occurredOn, false)}</time>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
