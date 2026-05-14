import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-teal-50 text-teal-800",
        secondary: "border-transparent bg-blue-50 text-blue-800",
        warning: "border-transparent bg-amber-50 text-amber-800",
        outline: "bg-white text-muted-foreground",
        destructive: "border-transparent bg-red-50 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
