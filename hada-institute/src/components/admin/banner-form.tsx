"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export type BannerFormValues = {
  title: string;
  subtitle: string;
  placement: string;
  isActive: boolean;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  startsAt: string;
  endsAt: string;
  imageUrl: string | null;
};

async function fetchCloudinarySignature(folder: string) {
  const res = await fetch("/api/uploads/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Unable to get upload signature");
  }

  return (await res.json()) as {
    cloudName: string;
    apiKey: string;
    signature: string;
    folder: string;
    resource_type: "auto";
    timestamp: number;
  };
}

function CloudinaryUploadPreview({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-lg border bg-white">
      <Image
        alt="Banner preview"
        src={url}
        width={1200}
        height={300}
        className="h-32 w-full object-cover"
        priority
      />
    </div>
  );
}

export function BannerForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    subtitle: string | null;
    placement: string;
    imageUrl: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    isActive: boolean;
    sortOrder: number;
    startsAt: Date | null;
    endsAt: Date | null;
  };
  onDone?: () => void;
}) {
  const { toast } = useToast();

  const [values, setValues] = useState<BannerFormValues>({
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    placement: initial?.placement ?? "HOME_HERO",
    isActive: initial?.isActive ?? true,
    ctaLabel: initial?.ctaLabel ?? "",
    ctaHref: initial?.ctaHref ?? "",
    sortOrder: initial?.sortOrder ?? 0,
    startsAt: initial?.startsAt
      ? new Date(initial.startsAt).toISOString().slice(0, 16)
      : "",
    endsAt: initial?.endsAt
      ? new Date(initial.endsAt).toISOString().slice(0, 16)
      : "",
    imageUrl: initial?.imageUrl ?? null,
  });

  useEffect(() => {
    setValues({
      title: initial?.title ?? "",
      subtitle: initial?.subtitle ?? "",
      placement: initial?.placement ?? "HOME_HERO",
      isActive: initial?.isActive ?? true,
      ctaLabel: initial?.ctaLabel ?? "",
      ctaHref: initial?.ctaHref ?? "",
      sortOrder: initial?.sortOrder ?? 0,
      startsAt: initial?.startsAt
        ? new Date(initial.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: initial?.endsAt
        ? new Date(initial.endsAt).toISOString().slice(0, 16)
        : "",
      imageUrl: initial?.imageUrl ?? null,
    });
  }, [initial]);

  const canSubmit = useMemo(() => {
    return (
      values.title.trim().length >= 2 && values.placement.trim().length >= 2
    );
  }, [values.title, values.placement]);

  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function uploadBannerImage(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid banner image",
        description: "Upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // 5MB default
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const signature = await fetchCloudinarySignature(
        "hada-institute/banners",
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);
      formData.append("resource_type", "auto");

      const url = `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || "Upload failed");
      }

      const data = await res.json();
      const secureUrl = data.secure_url as string;

      setValues((v) => ({ ...v, imageUrl: secureUrl }));
      toast({ title: "Banner uploaded" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setFileName(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      toast({
        title: "Missing required fields",
        description: "Title and placement are required.",
        variant: "destructive",
      });
      return;
    }

    const endpoint =
      mode === "create"
        ? "/api/admin/banners"
        : `/api/admin/banners/${initial?.id}`;

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        subtitle: values.subtitle || null,
        placement: values.placement,
        isActive: values.isActive,
        imageUrl: values.imageUrl ?? null,
        ctaLabel: values.ctaLabel || null,
        ctaHref: values.ctaHref || null,
        sortOrder: values.sortOrder,
        startsAt: values.startsAt
          ? new Date(values.startsAt).toISOString()
          : null,
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast({
        title:
          mode === "create" ? "Banner create failed" : "Banner update failed",
        description: data?.error || "Try again",
        variant: "destructive",
      });
      return;
    }

    toast({ title: mode === "create" ? "Banner created" : "Banner updated" });
    onDone?.();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create banner" : "Edit banner"}
          </CardTitle>
          <CardDescription>
            Manage homepage/marketing banner content.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={values.subtitle}
              onChange={(e) =>
                setValues((v) => ({ ...v, subtitle: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="placement">Placement</Label>
            <Input
              id="placement"
              value={values.placement}
              onChange={(e) =>
                setValues((v) => ({ ...v, placement: e.target.value }))
              }
              placeholder="HOME_HERO / PROMO_1 / MARKETING_A"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Banner image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center rounded-lg border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50",
                  uploading && "pointer-events-none opacity-70",
                )}
              >
                <span>{uploading ? "Uploading..." : "Upload image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadBannerImage(file);
                  }}
                />
              </label>
              {fileName ? (
                <p className="text-xs text-muted-foreground">{fileName}</p>
              ) : null}
            </div>
            <CloudinaryUploadPreview url={values.imageUrl} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ctaLabel">CTA button text</Label>
              <Input
                id="ctaLabel"
                value={values.ctaLabel}
                onChange={(e) =>
                  setValues((v) => ({ ...v, ctaLabel: e.target.value }))
                }
                placeholder="e.g. Read more"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ctaHref">CTA button link</Label>
              <Input
                id="ctaHref"
                value={values.ctaHref}
                onChange={(e) =>
                  setValues((v) => ({ ...v, ctaHref: e.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Publishing</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={values.isActive ? "default" : "outline"}
                onClick={() => setValues((v) => ({ ...v, isActive: true }))}
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!values.isActive ? "default" : "outline"}
                onClick={() => setValues((v) => ({ ...v, isActive: false }))}
              >
                Inactive
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={values.sortOrder}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    sortOrder: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startsAt">Starts at</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={values.startsAt}
                onChange={(e) =>
                  setValues((v) => ({ ...v, startsAt: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endsAt">Ends at</Label>
            <Input
              id="endsAt"
              type="datetime-local"
              value={values.endsAt}
              onChange={(e) =>
                setValues((v) => ({ ...v, endsAt: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={!canSubmit || uploading}>
              {uploading
                ? "Uploading..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
