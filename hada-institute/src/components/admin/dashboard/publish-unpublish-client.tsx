"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toaster";

export function useCmsPublishToggle() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();


  async function togglePublish(params: {
    entityType: "BlogPost" | "Product" | "SubjectNote";
    entityId: string;
    nextStatus: "DRAFT" | "PUBLISHED";
  }) {
    startTransition(async () => {
      const res = await fetch("/api/admin/cms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({
          title: "Publish failed",
          description: body?.error ?? "Unexpected error",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Saved", description: "Publishing state updated." });
      window.location.reload();
    });
  }

  return { isPending, togglePublish };
}

