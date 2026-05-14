import { Download, FileText, Languages, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type ProductPageParams = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: ProductPageParams;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product?.title ?? "Note",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: ProductPageParams;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container-shell py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
        <section className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100">
            <Image
              alt={`${product.title} cover`}
              className="object-cover"
              fill
              priority
              src={product.thumbnailUrl}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>{product.category}</Badge>
            <Badge variant="secondary">{product.subject}</Badge>
            {product.isPlaceholder ? (
              <Badge variant="warning">Placeholder</Badge>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal md:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Digital PDF", FileText],
              [product.language, Languages],
              ["Secure access", ShieldCheck],
            ].map(([label, Icon]) => (
              <div
                className="rounded-lg border bg-slate-50 p-4 text-sm font-semibold"
                key={label as string}
              >
                <Icon className="mb-3 size-5 text-primary" aria-hidden />
                {label as string}
              </div>
            ))}
          </div>
          {product.previewImages.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Preview</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {product.previewImages.map((image) => (
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-slate-100"
                    key={image}
                  >
                    <Image alt="" className="object-cover" fill src={image} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
              {product.discountPercent > 0 ? (
                <Badge variant="warning">{product.discountPercent}% off</Badge>
              ) : null}
            </div>
            <div className="mt-5 grid gap-3">
              <AddToCartButton
                className="w-full"
                product={{
                  productId: product.id,
                  title: product.title,
                  slug: product.slug,
                  thumbnailUrl: product.thumbnailUrl,
                  price: product.price,
                }}
              />
              {product.samplePdfUrl ? (
                <ButtonLink
                  href={product.samplePdfUrl}
                  target="_blank"
                  variant="outline"
                >
                  <Download className="size-4" aria-hidden />
                  Download sample
                </ButtonLink>
              ) : null}
              <ButtonLink href="/cart" variant="secondary">
                Go to checkout
              </ButtonLink>
            </div>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-muted-foreground">
              Full PDFs unlock after Razorpay payment verification and are tied
              to the purchasing account.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
