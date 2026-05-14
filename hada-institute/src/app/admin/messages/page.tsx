import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Contact Messages",
};

export default async function AdminMessagesPage() {
  const messages = hasDatabaseUrl
    ? await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-normal">Contact messages</h1>
      <div className="mt-5">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Subject</TH>
              <TH>Status</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {messages.map((message) => (
              <TR key={message.id}>
                <TD>{message.name}</TD>
                <TD>{message.email}</TD>
                <TD>{message.subject ?? "General"}</TD>
                <TD>
                  <Badge variant={message.resolved ? "default" : "outline"}>
                    {message.resolved ? "Resolved" : "Open"}
                  </Badge>
                </TD>
                <TD>{formatDate(message.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
