import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="container-shell py-10">
      <h1 className="text-3xl font-bold tracking-normal">Blog and updates</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Publish verified institute updates, notices, and academic guidance from
        the admin dashboard.
      </p>
      {posts.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              className="rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/blog/${post.slug}`}
              key={post.id}
            >
              <p className="text-sm text-muted-foreground">
                {formatDate(post.publishedAt)}
              </p>
              <h2 className="mt-3 font-semibold">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="No official posts are published yet."
            title="No blog posts"
          />
        </div>
      )}
    </div>
  );
}
