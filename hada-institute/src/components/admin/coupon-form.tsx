"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

export function CouponForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.get("code"),
        description: formData.get("description"),
        type: formData.get("type"),
        value: Number(formData.get("value") || 0),
        minOrderValue: Number(formData.get("minOrderValue") || 0) * 100,
        maxDiscount: formData.get("maxDiscount")
          ? Number(formData.get("maxDiscount")) * 100
          : null,
        usageLimit: formData.get("usageLimit")
          ? Number(formData.get("usageLimit"))
          : null,
        perUserLimit: Number(formData.get("perUserLimit") || 1),
        isActive: formData.get("isActive") === "on",
      }),
    });
    setLoading(false);

    if (!response.ok) {
      toast({
        title: "Coupon not created",
        description: "Check details and try again.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Coupon created" });
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select defaultValue="PERCENTAGE" id="type" name="type">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="value">Value</Label>
          <Input id="value" min="1" name="value" required type="number" />
        </div>
        <div>
          <Label htmlFor="minOrderValue">Min order INR</Label>
          <Input
            defaultValue="0"
            id="minOrderValue"
            min="0"
            name="minOrderValue"
            type="number"
          />
        </div>
        <div>
          <Label htmlFor="maxDiscount">Max discount INR</Label>
          <Input id="maxDiscount" min="0" name="maxDiscount" type="number" />
        </div>
        <div>
          <Label htmlFor="usageLimit">Usage limit</Label>
          <Input id="usageLimit" min="1" name="usageLimit" type="number" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          className="size-4"
          defaultChecked
          name="isActive"
          type="checkbox"
        />
        Active
      </label>
      <input defaultValue="1" name="perUserLimit" type="hidden" />
      <Button disabled={loading} type="submit">
        {loading ? "Creating..." : "Create coupon"}
      </Button>
    </form>
  );
}
