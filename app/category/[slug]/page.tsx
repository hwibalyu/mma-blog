import type { Metadata } from "next";
import PostCard from "@/components/post-card";
import { getPosts } from "@/lib/data";
import { notFound } from "next/navigation";
import { CATEGORY_MAP } from "@/lib/seo";

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = CATEGORY_MAP[slug];

  if (!categoryName) {
    return {};
  }

  const description = `${categoryName} 카테고리의 MMA 분석과 칼럼을 모아보세요.`;

  return {
    title: categoryName,
    description,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: categoryName,
      description,
      url: `/category/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: categoryName,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const categoryName = CATEGORY_MAP[resolvedParams.slug];

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
            <PostCard key={post.id} post={post} />
          ))
        )}
      </section>
    </div>
  );
}
