import { BookMarked } from "lucide-react";
import Link from "next/link";
import { getFilters } from "@/lib/data";

export const metadata = {
  title: "Courses and Categories",
};

export default async function CategoriesPage() {
  const filters = await getFilters();

  return (
    <div className="container-shell py-10">
      <h1 className="text-3xl font-bold tracking-normal">
        Courses and categories
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Course/category names should be replaced with verified official catalog
        data from the admin dashboard.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filters.categories.map((category) => (
          <Link
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            href={`/marketplace?category=${category.slug}`}
            key={category.slug}
          >
            <BookMarked className="size-6 text-primary" aria-hidden />
            <h2 className="mt-4 font-semibold">{category.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse digital notes in this category.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
