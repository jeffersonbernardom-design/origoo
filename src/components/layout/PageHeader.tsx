import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader = ({ eyebrow, title, description, action }: PageHeaderProps) => (
  <header className="mb-5 flex items-start justify-between gap-3 animate-fade-in">
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
);

export default PageHeader;
