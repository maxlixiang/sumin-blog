import { ChevronIcon } from "@/components/icons";
import { SectionHeading } from "@/components/dashboard/section-heading";
import {
  CAPABILITY_DEFINITIONS,
  CAPABILITY_LEVEL_DEFINITIONS,
  type CapabilityLevel,
  type CapabilitySlug,
} from "@/lib/constants/career";
import { formatChineseDate } from "@/lib/date";
import Link from "next/link";

export interface DashboardCapability {
  slug: CapabilitySlug;
  level: CapabilityLevel;
  quarterEvidence: number;
  lastUpgraded: string;
  nextLevelRequirement: string;
}

export function CapabilityGrid({ capabilities }: { capabilities: readonly DashboardCapability[] }) {
  return (
    <section aria-labelledby="capabilities-title">
      <SectionHeading
        title="六项核心能力"
        titleId="capabilities-title"
        description="看清当前等级、近期证据，以及下一等级的要求。"
      />
      <div className="capability-grid">
        {capabilities.map((capability) => {
          const definition = CAPABILITY_DEFINITIONS.find(({ slug }) => slug === capability.slug);
          if (!definition) return null;
          return (
            <Link className="capability-card" href="/capabilities" key={capability.slug}>
              <div className="capability-card__header">
                <div>
                  <span className="capability-card__initial" aria-hidden="true">{definition.name[0]}</span>
                  <div>
                    <h3>{definition.name}</h3>
                    <p>L{capability.level} · {CAPABILITY_LEVEL_DEFINITIONS[capability.level]}</p>
                  </div>
                </div>
                <ChevronIcon className="capability-card__chevron" />
              </div>
              <dl className="capability-card__facts">
                <div>
                  <dt>本季度</dt>
                  <dd>{capability.quarterEvidence} 条证据</dd>
                </div>
                <div>
                  <dt>最近升级</dt>
                  <dd>{formatChineseDate(capability.lastUpgraded)}</dd>
                </div>
              </dl>
              <div className="capability-card__requirement">
                <span>下一等级要求</span>
                <p>{capability.nextLevelRequirement}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
