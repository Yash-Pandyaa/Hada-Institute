import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Reviews",
};

export default async function AdminTestimonialsPage() {
  const reviews = hasDatabaseUrl
    ? await prisma.review.findMany({
        include: { user: true, product: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-normal">
        Reviews and testimonials
      </h1>
      <p className="mt-2 text-muted-foreground">
        Public testimonials remain hidden until approved and sourced from real
        student reviews.
      </p>
      <div className="mt-5">
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>User</TH>
              <TH>Rating</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {reviews.map((review) => (
              <TR key={review.id}>
                <TD>{review.product.title}</TD>
                <TD>{review.user.email}</TD>
                <TD>{review.rating}</TD>
                <TD>
                  <Badge variant={review.approved ? "default" : "outline"}>
                    {review.approved ? "Approved" : "Pending"}
                  </Badge>
                </TD>
                <TD>{formatDate(review.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
