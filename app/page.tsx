import Link from "next/link";
import { getPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const posts = getPosts();
  return (
    <div className="flex flex-col gap-16 py-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight break-keep">
          순수하고, <br />
          정제되지 않은 <br />
          <span className="text-accent">종합격투기.</span>
        </h2>
        <p className="font-serif text-xl md:text-2xl text-black/70 dark:text-white/70 max-w-2xl mt-4 leading-relaxed break-keep">
          미니멀하고 타이포그래피가 중심이 되는, 종합격투기(MMA) 세계에 대한 깊이 있는 통찰과 분석을 제공합니다.
        </p>
      </section>

      <section className="flex flex-col gap-12 mt-8">
        {posts.map((post) => (
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
        ))}
      </section>
    </div>
  );
}
