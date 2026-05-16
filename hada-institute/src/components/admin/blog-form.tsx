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
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { cn, slugify } from "@/lib/utils";

type BlogStatus = "DRAFT" | "PUBLISHED";

type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: BlogStatus;
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
        alt="Cover preview"
        src={url}
        width={800}
        height={320}
        className="h-40 w-full object-cover"
      />
    </div>
  );
}

export function BlogForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    status: BlogStatus;
  };
  onDone?: () => void;
}) {
  const { toast } = useToast();

  const [values, setValues] = useState<BlogFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    status: initial?.status ?? "DRAFT",
  });

  const [coverUploading, setCoverUploading] = useState(false);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!initial?.slug) {
      setValues((v) => ({ ...v, slug: v.slug || slugify(v.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.slug]);

  useEffect(() => {
    if (!initial) {
      setValues((v) => ({ ...v, slug: v.slug ? v.slug : slugify(v.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const canSubmit = useMemo(() => {
    return (
      values.title.trim().length >= 3 &&
      values.slug.trim().length >= 3 &&
      values.content.trim().length > 0
    );
  }, [values]);

  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid cover image",
        description: "Upload an image file only.",
        variant: "destructive",
      });
      return;
    }

    // 5MB limit (adjust if desired)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setCoverUploading(true);
    setCoverFileName(file.name);

    try {
      const signature = await fetchCloudinarySignature(
        "hada-institute/blog-covers",
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

      setValues((v) => ({ ...v, coverImageUrl: secureUrl }));
      toast({ title: "Cover uploaded" });
    } catch (e) {
      toast({
        title: "Cover upload failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setCoverUploading(false);
      setCoverFileName(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      toast({
        title: "Missing required fields",
        description: "Title, slug, and content are required.",
        variant: "destructive",
      });
      return;
    }

    const endpoint =
      mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial?.id}`;

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt || "",
        content: values.content,
        coverImageUrl: values.coverImageUrl || null,
        seoTitle: values.seoTitle || "",
        seoDescription: values.seoDescription || "",
        status: values.status,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast({
        title: mode === "create" ? "Blog create failed" : "Blog update failed",
        description: data?.error || "Try again",
        variant: "destructive",
      });
      return;
    }

    toast({ title: mode === "create" ? "Blog created" : "Blog updated" });
    onDone?.();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create blog post" : "Edit blog post"}
          </CardTitle>
          <CardDescription>
            Manage content, SEO, and publishing state.
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
              placeholder="e.g. Exam preparation tips"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) =>
                setValues((v) => ({ ...v, slug: e.target.value }))
              }
              placeholder="exam-preparation"
              required
            />
            <p className="text-xs text-muted-foreground">
              Used for /blog/<span className="font-mono">slug</span> URL.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={values.excerpt}
              onChange={(e) =>
                setValues((v) => ({ ...v, excerpt: e.target.value }))
              }
              placeholder="Short summary shown in blog list"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Rich content (HTML)</Label>
            <Textarea
              id="content"
              value={values.content}
              onChange={(e) =>
                setValues((v) => ({ ...v, content: e.target.value }))
              }
              placeholder="Paste HTML content"
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              For production: store safe HTML. This editor saves the HTML you
              provide.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Cover image</Label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center rounded-lg border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50",
                  coverUploading && "pointer-events-none opacity-70",
                )}
              >
                <span>{coverUploading ? "Uploading..." : "Upload cover"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadCover(file);
                  }}
                />
              </label>
              {coverFileName ? (
                <p className="text-xs text-muted-foreground">{coverFileName}</p>
              ) : null}
            </div>

            <CloudinaryUploadPreview url={values.coverImageUrl} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input
                id="seoTitle"
                value={values.seoTitle}
                onChange={(e) =>
                  setValues((v) => ({ ...v, seoTitle: e.target.value }))
                }
                placeholder="SEO title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">SEO description</Label>
              <Textarea
                id="seoDescription"
                value={values.seoDescription}
                onChange={(e) =>
                  setValues((v) => ({ ...v, seoDescription: e.target.value }))
                }
                placeholder="SEO description"
                rows={3}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Publish state</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={values.status === "DRAFT" ? "default" : "outline"}
                onClick={() => setValues((v) => ({ ...v, status: "DRAFT" }))}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={values.status === "PUBLISHED" ? "default" : "outline"}
                onClick={() =>
                  setValues((v) => ({ ...v, status: "PUBLISHED" }))
                }
              >
                Publish
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" disabled={!canSubmit || coverUploading}>
              {coverUploading
                ? "Uploading cover..."
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
