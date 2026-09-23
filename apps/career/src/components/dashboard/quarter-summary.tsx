import { SectionHeading } from "@/components/dashboard/section-heading";

export function QuarterSummary({ items }: { items: readonly { label: string; value: number }[] }) {
  return (
    <section aria-labelledby="quarter-title">
      <SectionHeading title="本季度" titleId="quarter-title" description="用少量真实指标观察持续行动是否正在形成成长证据。" />
      <dl className="quarter-summary">
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
