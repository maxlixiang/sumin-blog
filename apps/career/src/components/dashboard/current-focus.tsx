import { SectionHeading } from "@/components/dashboard/section-heading";
import { CAPABILITY_DEFINITIONS, type CapabilityLevel, type CapabilitySlug } from "@/lib/constants/career";

interface FocusItem {
  slug: CapabilitySlug;
  targetLevel: CapabilityLevel;
  proofPrompt: string;
}

export function CurrentFocus({ items }: { items: readonly FocusItem[] }) {
  return (
    <section className="focus-section" aria-labelledby="focus-title">
      <SectionHeading title="当前重点" titleId="focus-title" description="本季度最值得刻意训练的能力。" />
      <div className="focus-panel">
        <div className="focus-panel__targets">
          {items.map((item) => {
            const capability = CAPABILITY_DEFINITIONS.find(({ slug }) => slug === item.slug);
            return (
              <div className="focus-target" key={item.slug}>
                <span className="focus-target__initial" aria-hidden="true">{capability?.name[0]}</span>
                <div>
                  <h3>{capability?.name} <span>→ L{item.targetLevel}</span></h3>
                  <p>{item.proofPrompt}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="focus-panel__question">
          <span>引导问题</span>
          <p>什么证据能够真正证明进步？</p>
        </div>
      </div>
    </section>
  );
}
