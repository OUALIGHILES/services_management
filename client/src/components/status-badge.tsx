import { cn } from "@/lib/utils";

type StatusType = "new" | "pending" | "in_progress" | "picked_up" | "delivered" | "cancelled" | "online" | "offline" | "approved";

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const variants: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    online: "bg-emerald-100 text-emerald-700 border-emerald-200",
    offline: "bg-slate-100 text-slate-700 border-slate-200",
    approved: "bg-teal-100 text-teal-700 border-teal-200",
  };

  const normalizedStatus = status?.toLowerCase() || "pending";
  const styles = variants[normalizedStatus] || variants.pending;

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide", styles, className)}>
      {status?.replace("_", " ")}
    </span>
  );
}
