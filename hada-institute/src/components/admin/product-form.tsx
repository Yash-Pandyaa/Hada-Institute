"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { slugify } from "@/lib/utils";

export function ProductForm({
  categories,
  subjects,
}: {
  categories: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const price = Number(formData.get("price") || 0);
    const compareAtPrice = Number(formData.get("compareAtPrice") || 0);
    const payload = {
      title,
      slug: String(formData.get("slug") || slugify(title)),
      description: formData.get("description"),
      subjectId: formData.get("subjectId") || null,
      categoryId: formData.get("categoryId") || null,
      classLevel: formData.get("classLevel"),
      examType: formData.get("examType"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      previewImages: String(formData.get("previewImages") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      samplePdfUrl: formData.get("samplePdfUrl"),
      fullPdfKey: formData.get("fullPdfKey"),
      fullPdfUrl: formData.get("fullPdfUrl"),
      price: Math.round(price * 100),
      compareAtPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : null,
      discountPercent: Number(formData.get("discountPercent") || 0),
      tags: String(formData.get("tags") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      language: formData.get("language") || "English",
      stockStatus: formData.get("stockStatus") || "AVAILABLE",
      featured: formData.get("featured") === "on",
      status: formData.get("status") || "DRAFT",
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      toast({
        title: "Product not saved",
        description: data.error || "Check product details.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Product created" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder={slugify(title)} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId">
            <option value="">Unassigned</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="subjectId">Subject</Label>
          <Select id="subjectId" name="subjectId">
            <option value="">Unassigned</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Input defaultValue="English" id="language" name="language" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="classLevel">Class</Label>
          <Input id="classLevel" name="classLevel" />
        </div>
        <div>
          <Label htmlFor="examType">Exam type</Label>
          <Input id="examType" name="examType" />
        </div>
        <div>
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            min="0"
            name="price"
            required
            step="1"
            type="number"
          />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare price</Label>
          <Input
            id="compareAtPrice"
            min="0"
            name="compareAtPrice"
            step="1"
            type="number"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="discountPercent">Discount %</Label>
          <Input
            defaultValue="0"
            id="discountPercent"
            max="95"
            min="0"
            name="discountPercent"
            type="number"
          />
        </div>
        <div>
          <Label htmlFor="stockStatus">Stock</Label>
          <Select defaultValue="AVAILABLE" id="stockStatus" name="stockStatus">
            <option value="AVAILABLE">Available</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select defaultValue="DRAFT" id="status" name="status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input
            id="thumbnailUrl"
            name="thumbnailUrl"
            placeholder="Cloudinary image URL"
          />
        </div>
        <div>
          <Label htmlFor="previewImages">Preview images</Label>
          <Input
            id="previewImages"
            name="previewImages"
            placeholder="Comma-separated URLs"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="samplePdfUrl">Sample PDF URL</Label>
          <Input id="samplePdfUrl" name="samplePdfUrl" />
        </div>
        <div>
          <Label htmlFor="fullPdfKey">Full PDF key</Label>
          <Input
            id="fullPdfKey"
            name="fullPdfKey"
            placeholder="Cloudinary authenticated key"
          />
        </div>
        <div>
          <Label htmlFor="fullPdfUrl">Full PDF URL</Label>
          <Input id="fullPdfUrl" name="fullPdfUrl" />
        </div>
      </div>
      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" name="tags" placeholder="Comma-separated tags" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input className="size-4" name="featured" type="checkbox" />
        Featured product
      </label>
      <Button disabled={loading} type="submit">
        {loading ? "Saving..." : "Create product"}
      </Button>
    </form>
  );
}
