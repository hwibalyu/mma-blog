import Link from "next/link";
import type { PostSummary } from "@/lib/data";
import LoadingImage from "@/components/loading-image";
import LinkPendingIndicator from "@/components/link-pending-indicator";
import { getPostCardImageUrl } from "@/lib/seo";

type PostCardProps = {
  post: PostSummary;
  imageLoading?: "eager" | "lazy";
  imageFetchPriority?: "high" | "low" | "auto";
};

export default function PostCard({
  post,
  imageLoading = "lazy",
  imageFetchPriority = "auto",
}: PostCardProps) {
  const coverImage = getPostCardImageUrl(post.id, post.coverImage);
  const mobileCoverImage = getPostCardImageUrl(post.id, post.coverImage, {
    width: 176,
    height: 176,
    quality: 68,
  });
  const coverImageAlt = post.coverImageAlt || `${post.title} 대표 이미지`;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group relative block transition-transform duration-150 active:scale-[0.995]"
    >
      <LinkPendingIndicator />
      <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-3 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5 md:items-start">
        {coverImage ? (
          <div className="row-span-2 overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 md:row-span-3">
            <LoadingImage
              src={coverImage}
              srcSet={
                mobileCoverImage && coverImage
                  ? `${mobileCoverImage} 176w, ${coverImage} 440w`
                  : undefined
              }
              sizes="(max-width: 767px) 88px, 220px"
              alt={coverImageAlt}
              loading={imageLoading}
              fetchPriority={imageFetchPriority}
              decoding="async"
              width={880}
              height={660}
              wrapperClassName="h-full"
              className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] md:aspect-[4/3]"
            />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-col gap-2 md:gap-3">
          <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-accent">
            <span>{post.category}</span>
            <span className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
            <time className="text-black/40 dark:text-white/40">{post.date}</time>
          </div>
          <h3 className="text-xl font-black tracking-tight group-hover:underline decoration-2 underline-offset-4 break-keep md:text-3xl">
            {post.title}
          </h3>
        </div>
        <p className="col-span-2 max-w-2xl font-serif text-base leading-relaxed text-black/70 break-keep dark:text-white/70 md:col-auto md:text-lg">
          {post.excerpt}
        </p>
        {post.tags && post.tags.length > 0 ? (
          <div className="col-span-2 mt-1 flex flex-wrap gap-2 md:col-auto md:mt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-black/5 px-2 py-1 text-xs font-bold text-black/60 dark:bg-white/5 dark:text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </Link>
  );
}
