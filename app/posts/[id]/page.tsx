import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/data";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LoadingImage from "@/components/loading-image";
import PostImageLightbox from "@/components/post-image-lightbox";
import {
  absoluteUrl,
  getPostAssetUrl,
  getPostCardImageUrl,
  getCategorySlug,
  normalizeIsoDate,
  resolvePostAssetUrl,
  SITE_AUTHOR_NAME,
  SITE_NAME,
} from "@/lib/seo";

// 빌드 시 정적 생성을 위해 추가 (선택사항이지만 권장)
export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(id, {
    includeHidden: process.env.NODE_ENV !== "production",
  });

  if (!post) {
    return {};
  }

  const ogImage = getPostAssetUrl(post.id, post.coverImage);
  const coverImageAlt = post.coverImageAlt || `${post.title} 대표 이미지`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `/posts/${post.id}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/posts/${post.id}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      publishedTime: normalizeIsoDate(post.date),
      modifiedTime: post.updatedAt || undefined,
      tags: post.tags,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: coverImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const posts = getPosts();
  const post = getPost(resolvedParams.id, {
    includeHidden: process.env.NODE_ENV !== "production",
  });

  if (!post) {
    notFound();
  }

  // 마크다운 파싱 오류(조사 붙임) 해결을 위한 전처리
  // **텍스트** 형태를 감지하여 강제로 HTML <strong> 태그로 변환합니다.
  const processedContent = post.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const ogImage = getPostAssetUrl(post.id, post.coverImage);
  const categorySlug = getCategorySlug(post.category);
  const coverImageAlt = post.coverImageAlt || `${post.title} 대표 이미지`;
  const relatedPosts = posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sharedTagCount = candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      const sameCategoryBonus = candidate.category === post.category ? 2 : 0;

      return {
        post: candidate,
        score: sharedTagCount + sameCategoryBonus,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post: relatedPost }) => relatedPost);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: normalizeIsoDate(post.date),
    dateModified: post.updatedAt || normalizeIsoDate(post.date),
    inLanguage: "ko-KR",
    keywords: post.tags,
    mainEntityOfPage: absoluteUrl(`/posts/${post.id}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    author: {
      "@type": "Organization",
      name: SITE_AUTHOR_NAME,
      url: absoluteUrl("/"),
    },
    image: ogImage ? [ogImage] : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: absoluteUrl("/"),
      },
      ...(categorySlug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: post.category,
              item: absoluteUrl(`/category/${categorySlug}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categorySlug ? 3 : 2,
        name: post.title,
        item: absoluteUrl(`/posts/${post.id}`),
      },
    ],
  };

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav
        aria-label="breadcrumb"
        className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40"
      >
        <Link href="/">홈</Link>
        {categorySlug ? (
          <>
            <span>/</span>
            <Link href={`/category/${categorySlug}`}>{post.category}</Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-black/70 dark:text-white/70">{post.title}</span>
      </nav>
      <Link href="/" className="text-sm font-bold tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors w-fit mb-4">
        ← 목록으로 돌아가기
      </Link>
      
      <header className="flex flex-col gap-6 border-b border-black/10 dark:border-white/10 pb-8 mb-4">
        <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-accent">
          <span>{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
          <time className="text-black/40 dark:text-white/40">{post.date}</time>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight break-keep">
          {post.title}
        </h1>
        <p className="font-serif text-lg text-black/50 dark:text-white/50 leading-relaxed break-keep md:text-xl">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-sm font-medium text-black/45 dark:text-white/45">
          <span>{SITE_AUTHOR_NAME}</span>
          <span className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
          <span>{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("ko-KR") : post.date}</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-sm font-bold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {ogImage ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
            <LoadingImage
              src={ogImage}
              alt={coverImageAlt}
              wrapperClassName="w-full"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}
      </header>

      <div className="flex flex-col">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: (props) => <p className="my-3 font-serif text-base leading-relaxed text-black/80 dark:text-white/80 break-keep md:my-6 md:text-xl" {...props} />,
            h1: (props) => <h1 className="mt-8 mb-8 text-3xl font-black tracking-tight md:mt-16 md:text-5xl" {...props} />,
            h2: (props) => <h2 className="mt-7 mb-6 border-b border-black/10 pb-2 text-2xl font-black tracking-tight dark:border-white/10 md:mt-14 md:text-4xl" {...props} />,
            h3: (props) => <h3 className="mt-6 mb-5 text-xl font-black tracking-tight md:mt-12 md:text-3xl" {...props} />,
            h4: (props) => <h4 className="mt-5 mb-4 text-lg font-bold tracking-tight text-black/90 dark:text-white/90 md:mt-10 md:text-2xl" {...props} />,
            h5: (props) => <h5 className="mt-4 mb-3 text-base font-bold md:mt-8 md:text-xl" {...props} />,
            blockquote: (props) => (
              <blockquote className="my-8 border-l-4 border-accent py-2 pl-6 font-serif text-lg italic text-black/60 break-keep dark:text-white/60 md:text-xl" {...props} />
            ),
            li: (props) => <li className="my-2 ml-6 list-disc font-serif text-base leading-relaxed text-black/80 break-keep dark:text-white/80 md:text-xl" {...props} />,
            ol: (props) => <ol className="my-6 list-decimal ml-6" {...props} />,
            strong: (props) => <strong className="font-black text-black dark:text-white" {...props} />,
            mark: (props) => (
              <mark
                className="rounded-sm bg-[#ffe680] px-1 py-0.5 text-black shadow-[inset_0_-0.45em_0_rgba(255,210,63,0.55)] dark:bg-[#f3d35b] dark:text-black dark:shadow-[inset_0_-0.45em_0_rgba(255,232,130,0.45)]"
                {...props}
              />
            ),
            u: (props) => (
              <u
                className="decoration-2 underline underline-offset-4 decoration-accent text-black dark:text-white"
                {...props}
              />
            ),
            ins: (props) => (
              <ins
                className="no-underline border-b-2 border-accent/70 pb-0.5 text-black dark:text-white"
                {...props}
              />
            ),
            img: ({ src, ...props }) => {
              let finalSrc = src;
              if (typeof src === "string" && !src.startsWith("http") && !src.startsWith("/")) {
                finalSrc = resolvePostAssetUrl(post.id, src).replace(absoluteUrl("/"), "/");
              }

              return (
                <span className="my-5 flex flex-col items-center md:my-10">
                  <span className="inline-flex max-w-full flex-col items-center">
                    <PostImageLightbox
                      src={typeof finalSrc === "string" ? finalSrc : ""}
                      alt={props.alt || "Post image"}
                    />
                    {props.alt && (
                      <span className="mt-3 block w-full rounded-xl bg-black/5 px-4 py-3 text-center text-sm font-medium text-black/50 dark:bg-white/5 dark:text-white/50">
                        {props.alt}
                      </span>
                    )}
                  </span>
                </span>
              );
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {relatedPosts.length > 0 ? (
        <section className="mt-8 border-t border-black/10 pt-10 dark:border-white/10">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">관련 글</h2>
            {categorySlug ? (
              <Link
                href={`/category/${categorySlug}`}
                className="text-sm font-bold tracking-widest text-black/40 transition-colors hover:text-black dark:text-white/40 dark:hover:text-white"
              >
                {post.category} 더 보기
              </Link>
            ) : null}
          </div>
          <div className="grid gap-6 md:gap-8">
            {relatedPosts.map((relatedPost) => {
              const relatedCoverImage = getPostCardImageUrl(
                relatedPost.id,
                relatedPost.coverImage,
              );

              return (
                <Link key={relatedPost.id} href={`/posts/${relatedPost.id}`} className="group block">
                  <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4 md:items-start">
                    {relatedCoverImage ? (
                      <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                        <LoadingImage
                          src={relatedCoverImage}
                          alt={relatedPost.coverImageAlt || `${relatedPost.title} 대표 이미지`}
                          wrapperClassName="h-full"
                          className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] md:aspect-[4/3]"
                        />
                      </div>
                    ) : null}
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-accent">
                        <span>{relatedPost.category}</span>
                        <span className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
                        <time className="text-black/40 dark:text-white/40">{relatedPost.date}</time>
                      </div>
                      <h3 className="text-lg font-black tracking-tight group-hover:underline decoration-2 underline-offset-4 break-keep md:text-xl">
                        {relatedPost.title}
                      </h3>
                      <p className="hidden font-serif text-base leading-relaxed text-black/65 break-keep dark:text-white/65 md:block">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </article>
  );
}
