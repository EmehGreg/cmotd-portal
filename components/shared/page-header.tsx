import * as React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-2 text-slate-600">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}