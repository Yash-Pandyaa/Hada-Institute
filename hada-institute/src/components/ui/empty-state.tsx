import { FileSearch } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-white px-6 py-10 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-teal-50 text-primary">
        <FileSearch className="size-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-5">
        {action ?? <ButtonLink href="/marketplace">Browse notes</ButtonLink>}
      </div>
    </div>
  );
}
