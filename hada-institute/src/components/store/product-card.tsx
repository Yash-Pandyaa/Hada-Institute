import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import type { StorefrontProduct } from "@/lib/placeholders";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        className="relative block aspect-[4/3] bg-slate-100"
        href={`/notes/${product.slug}`}
      >
        <Image
          alt={`${product.title} cover`}
          className="object-cover transition group-hover:scale-[1.02]"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={product.thumbnailUrl}
        />
        {product.isPlaceholder ? (
          <span className="absolute left-3 top-3 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
            Placeholder
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{product.subject}</Badge>
          <Badge variant="outline">{product.language}</Badge>
        </div>
        <Link href={`/notes/${product.slug}`}>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          {product.discountPercent > 0 ? (
            <Badge variant="warning">{product.discountPercent}% off</Badge>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <AddToCartButton
            product={{
              productId: product.id,
              title: product.title,
              slug: product.slug,
              thumbnailUrl: product.thumbnailUrl,
              price: product.price,
            }}
          />
          <Link
            className="inline-flex size-10 items-center justify-center rounded-lg border bg-white text-sm font-semibold hover:bg-muted"
            href={`/notes/${product.slug}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
