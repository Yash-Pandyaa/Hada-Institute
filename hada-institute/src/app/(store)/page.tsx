import { ArrowRight, BarChart3, Download, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { ProductCard } from "@/components/store/product-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { marketplaceCopy, siteConfig } from "@/config/site";
import { getFeaturedProducts } from "@/lib/data";

// Supabase server client
export default async function HomePage() {
  // Prisma products
  const products = await getFeaturedProducts();

  return (
    <div>
      <section className="surface-grid border-b bg-white">
        <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1fr_420px] lg:items-center lg:py-16">
          <div>
            <Badge variant="secondary">
              Official digital notes marketplace
            </Badge>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 md:text-6xl">
              Buy verified study notes with secure PDF access.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {siteConfig.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/marketplace" size="lg">
                Browse notes
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>

              <ButtonLink href="/account/library" size="lg" variant="outline">
                My downloads
              </ButtonLink>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Secure downloads", Download],
                ["Payment verified", ShieldCheck],
                ["Order analytics", BarChart3],
              ].map(([label, Icon]) => (
                <div
                  className="flex items-center gap-3 rounded-lg border bg-white p-3 text-sm font-semibold shadow-sm"
                  key={label as string}
                >
                  <Icon className="size-5 text-primary" aria-hidden />
                  {label as string}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-xl">
            <div className="grid gap-3">
              {products.slice(0, 2).map((product, index) => (
                <div
                  className="grid grid-cols-[92px_1fr] gap-4 rounded-lg border bg-slate-50 p-3"
                  key={product.id}
                >
                  <Image
                    alt=""
                    className="rounded-md object-cover"
                    height={69}
                    src={product.thumbnailUrl}
                    width={92}
                  />

                  <div>
                    <Badge variant={index === 0 ? "default" : "warning"}>
                      {product.category}
                    </Badge>

                    <h2 className="mt-2 line-clamp-2 font-semibold">
                      {product.title}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {product.subject} · {product.language}
                    </p>
                  </div>
                </div>
              ))}

              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                {marketplaceCopy.noInventedContent}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge>Featured</Badge>

            <h2 className="mt-3 text-3xl font-bold tracking-normal">
              Notes ready for digital delivery
            </h2>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              {marketplaceCopy.placeholderNotice}
            </p>
          </div>

          <ButtonLink href="/marketplace" variant="outline">
            View all
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
