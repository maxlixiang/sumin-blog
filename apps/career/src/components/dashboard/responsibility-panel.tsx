import { RESPONSIBILITY_DEFINITIONS, type ResponsibilityLevel } from "@/lib/constants/career";

function getResponsibility(level: ResponsibilityLevel) {
  const definition = RESPONSIBILITY_DEFINITIONS.find((item) => item.level === level);
  if (!definition) throw new Error(`Missing responsibility definition for R${level}`);
  return definition;
}

export function ResponsibilityPanel({ current, next }: { current: ResponsibilityLevel; next: ResponsibilityLevel }) {
  const currentDefinition = getResponsibility(current);
  const nextDefinition = getResponsibility(next);

  return (
    <section className="responsibility-panel" aria-labelledby="responsibility-title">
      <div className="responsibility-panel__current">
        <div className="responsibility-panel__label-row">
          <p className="eyebrow" id="responsibility-title">当前责任等级</p>
        </div>
        <h2>R{current} — {currentDefinition.name}</h2>
        <p>{currentDefinition.shortDefinition}</p>
      </div>
      <div className="responsibility-panel__next">
        <p className="responsibility-panel__next-label">下一阶段</p>
        <h3>R{next} — {nextDefinition.name}</h3>
        <p>{nextDefinition.definition}</p>
      </div>
    </section>
  );
}

