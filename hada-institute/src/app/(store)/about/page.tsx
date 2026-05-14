import { Badge } from "@/components/ui/badge";
import { marketplaceCopy, siteConfig } from "@/config/site";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="container-shell py-10">
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <Badge>About</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-normal">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          {siteConfig.description}
        </p>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {marketplaceCopy.noInventedContent}
        </div>
      </section>
      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          [
            "Digital notes",
            "Products are delivered as secure PDFs after payment.",
          ],
          [
            "Student accounts",
            "Purchases remain available in each student's library.",
          ],
          [
            "Admin managed",
            "Catalog, coupons, orders, and analytics are controlled from the dashboard.",
          ],
        ].map(([title, description]) => (
          <div className="rounded-lg border bg-white p-5 shadow-sm" key={title}>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
