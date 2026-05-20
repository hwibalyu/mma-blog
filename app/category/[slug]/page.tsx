import { getPosts } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const categoryMap: Record<string, string> = {
  "column": "컬럼",
  "global-news": "해외컬럼/뉴스",
  "match-analysis": "매치분석",
};

export async function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({
    slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const categoryName = categoryMap[resolvedParams.slug];

  if (!categoryName) {
    notFound();
  }

  const posts = getPosts().filter((post) => post.category === categoryName);

  return (
    <div className="flex flex-col gap-12 py-8">
      <header className="border-b border-black/10 dark:border-white/10 pb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
          {categoryName}
        </h1>
        <p className="mt-4 font-serif text-xl text-black/60 dark:text-white/60">
          {posts.length}개의 아티클이 있습니다.
        </p>
      </header>

      <section className="flex flex-col gap-12 mt-4">
        {posts.length === 0 ? (
          <p className="text-black/50 dark:text-white/50 font-serif text-lg">이 카테고리에 아직 등록된 글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <Link href={`/posts/${post.id}`} key={post.id} className="group block">
              <article className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-accent">
                  <span>{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                  <time className="text-black/40 dark:text-white/40">{post.date}</time>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:underline decoration-2 underline-offset-4 break-keep">
                  {post.title}
                </h3>
                <p className="font-serif text-lg text-black/70 dark:text-white/70 max-w-2xl leading-relaxed break-keep">
                  {post.excerpt}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs font-bold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
