import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  currency,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  currency?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-normal">
        {currency ? formatCurrency(value) : value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
