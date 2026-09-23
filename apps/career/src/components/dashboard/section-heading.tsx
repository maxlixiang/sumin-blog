import type { ReactNode } from "react";

export function SectionHeading({
  title,
  titleId,
  description,
  action,
}: {
  title: string;
  titleId?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
