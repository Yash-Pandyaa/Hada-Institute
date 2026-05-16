import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/input";
import { marketplaceCopy } from "@/config/site";
import { getFilters, getMarketplaceProducts } from "@/lib/data";

type MarketplaceSearchParams = Promise<{
  q?: string;
  category?: string;
  subject?: string;
  maxPrice?: string;
}>;

export const metadata = {
  title: "Notes Marketplace",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: MarketplaceSearchParams;
}) {
  const params = await searchParams;
  const [products, filters] = await Promise.all([
    getMarketplaceProducts({
      q: params.q,
      category: params.category,
      subject: params.subject,
      maxPrice: params.maxPrice ? Number(params.maxPrice) * 100 : undefined,
    }),
    getFilters(),
  ]);

  return (
    <div className="container-shell py-8">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">
              Notes marketplace
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {marketplaceCopy.placeholderNotice}
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <form className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr]">
          <div>
            <Label htmlFor="q">Search</Label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted-foreground" />
              <Input
                className="pl-10"
                defaultValue={params.q}
                id="q"
                name="q"
                placeholder="Search notes, subjects, tags"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              defaultValue={params.category}
              id="category"
              name="category"
            >
              <option value="">All categories</option>
              {filters.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select defaultValue={params.subject} id="subject" name="subject">
              <option value="">All subjects</option>
              {filters.subjects.map((subject) => (
                <option key={subject.slug} value={subject.slug}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="maxPrice">Max price</Label>
            <Input
              defaultValue={params.maxPrice}
              id="maxPrice"
              min="0"
              name="maxPrice"
              placeholder="999"
              type="number"
            />
          </div>
          <div className="flex justify-center items-center lg:col-span-4 md:col-span-4">
            <button
              className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white lg:col-span-4 max-w-lg cursor-pointer"
              type="submit"
            >
              Apply filters
            </button>
          </div>
        </form>
      </div>
      {products.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Try removing filters or add published products from the admin dashboard."
            title="No notes found"
          />
        </div>
      )}
    </div>
  );
}
