import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const hasContact =
    Boolean(siteConfig.supportEmail) ||
    Boolean(siteConfig.supportPhone) ||
    Boolean(siteConfig.address);

  return (
    <div className="container-shell grid gap-6 py-10 lg:grid-cols-[1fr_420px]">
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-normal">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Send a message to the institute admin team.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
      <aside className="h-fit rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Official details</h2>
        {hasContact ? (
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            {siteConfig.supportEmail ? <p>{siteConfig.supportEmail}</p> : null}
            {siteConfig.supportPhone ? <p>{siteConfig.supportPhone}</p> : null}
            {siteConfig.address ? <p>{siteConfig.address}</p> : null}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            Official contact details are hidden until verified official sources
            are configured.
          </p>
        )}
      </aside>
    </div>
  );
}
