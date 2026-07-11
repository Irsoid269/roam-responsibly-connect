import { ReactNode } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLoadingProps {
  label?: string;
  className?: string;
}

/** Shared admin loading spinner — Amani tokens only. */
export function AdminLoading({ label = "Chargement…", className }: AdminLoadingProps) {
  return (
    <div className={cn("p-12 text-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface AdminEmptyProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Shared empty table / list state — Amani tokens only. */
export function AdminEmpty({
  title = "Aucun élément",
  description = "Les données apparaîtront ici une fois ajoutées.",
  action,
  className,
}: AdminEmptyProps) {
  return (
    <div className={cn("p-12 text-center", className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-display text-lg font-medium text-foreground">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

interface AdminTableShellProps {
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
}

/** Wrapper for admin data tables with consistent loading / empty states. */
export function AdminTableShell({
  children,
  loading,
  empty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
}: AdminTableShellProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background shadow-sm overflow-hidden",
        className
      )}
    >
      {loading ? (
        <AdminLoading />
      ) : empty ? (
        <AdminEmpty
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
}

/** Status badge classes for moderation queues. */
export const adminStatusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/10 text-primary border-primary/20",
};
