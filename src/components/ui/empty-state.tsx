import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="animate-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {description && (
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
