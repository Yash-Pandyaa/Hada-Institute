"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

export function QuickCreateForm({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
      }),
    });
    setLoading(false);

    if (!response.ok) {
      toast({
        title: `${label} not created`,
        description: "Check details and try again.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: `${label} created` });
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <Button disabled={loading} type="submit">
        {loading ? "Creating..." : `Create ${label.toLowerCase()}`}
      </Button>
    </form>
  );
}
