import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Blog Management",
};

export default async function AdminBlogPage() {
  const posts = hasDatabaseUrl
    ? await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-normal">Blog management</h1>
      <p className="mt-2 text-muted-foreground">
        Publish only official institute updates and verified academic content.
      </p>
      <div className="mt-5">
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Status</TH>
              <TH>Published</TH>
            </TR>
          </THead>
          <TBody>
            {posts.map((post) => (
              <TR key={post.id}>
                <TD className="font-semibold">{post.title}</TD>
                <TD>
                  <Badge
                    variant={
                      post.status === "PUBLISHED" ? "default" : "outline"
                    }
                  >
                    {post.status}
                  </Badge>
                </TD>
                <TD>{formatDate(post.publishedAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
