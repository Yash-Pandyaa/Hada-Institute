import { CouponForm } from "@/components/admin/coupon-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";

export const metadata = {
  title: "Coupons",
};

export default async function AdminCouponsPage() {
  const coupons = hasDatabaseUrl
    ? await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <CouponForm />
      <Table>
        <THead>
          <TR>
            <TH>Code</TH>
            <TH>Type</TH>
            <TH>Value</TH>
            <TH>Usage</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {coupons.map((coupon) => (
            <TR key={coupon.id}>
              <TD className="font-semibold">{coupon.code}</TD>
              <TD>{coupon.type}</TD>
              <TD>{coupon.value}</TD>
              <TD>
                {coupon.usageCount}/{coupon.usageLimit ?? "∞"}
              </TD>
              <TD>
                <Badge variant={coupon.isActive ? "default" : "outline"}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
