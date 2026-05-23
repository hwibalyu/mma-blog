import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/data";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import PostImageLightbox from "@/components/post-image-lightbox";
import {
  absoluteUrl,
  getPostOgImage,
  normalizeIsoDate,
  SITE_NAME,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

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

  const ogImage = getPostOgImage(post.id, post.raw);

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
              alt: post.title,
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
  const post = getPost(resolvedParams.id, {
    includeHidden: process.env.NODE_ENV !== "production",
  });

  if (!post) {
    notFound();
  }

  // 마크다운 파싱 오류(조사 붙임) 해결을 위한 전처리
  // **텍스트** 형태를 감지하여 강제로 HTML <strong> 태그로 변환합니다.
  const processedContent = post.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const ogImage = getPostOgImage(post.id, post.raw);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
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
      name: SITE_NAME,
    },
    image: ogImage ? [ogImage] : undefined,
  };

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link href="/" className="text-sm font-bold tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors w-fit mb-4">
        ← 목록으로 돌아가기
      </Link>
      
      <header className="flex flex-col gap-6 border-b border-black/10 dark:border-white/10 pb-8 mb-4">
        <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-accent">
          <span>{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
          <time className="text-black/40 dark:text-white/40">{post.date}</time>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight break-keep">
          {post.title}
        </h1>
        <p className="font-serif text-xl text-black/50 dark:text-white/50 leading-relaxed break-keep">
          {post.excerpt}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-sm font-bold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-col">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: (props) => <p className="my-6 font-serif text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/80 break-keep" {...props} />,
            h1: (props) => <h1 className="text-4xl md:text-5xl font-black mt-16 mb-8 tracking-tight" {...props} />,
            h2: (props) => <h2 className="text-3xl md:text-4xl font-black mt-14 mb-6 tracking-tight border-b border-black/10 dark:border-white/10 pb-2" {...props} />,
            h3: (props) => <h3 className="text-2xl md:text-3xl font-black mt-12 mb-5 tracking-tight" {...props} />,
            h4: (props) => <h4 className="text-xl md:text-2xl font-bold mt-10 mb-4 tracking-tight text-black/90 dark:text-white/90" {...props} />,
            h5: (props) => <h5 className="text-lg md:text-xl font-bold mt-8 mb-3" {...props} />,
            blockquote: (props) => (
              <blockquote className="border-l-4 border-accent pl-6 my-8 py-2 font-serif italic text-xl text-black/60 dark:text-white/60 break-keep" {...props} />
            ),
            li: (props) => <li className="my-2 font-serif text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/80 break-keep list-disc ml-6" {...props} />,
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
                const cleanSrc = src.replace(/^\.\//, "");
                finalSrc = `/api/assets/${post.id}/${cleanSrc}`;
              }

              return (
                <span className="my-10 flex flex-col items-center">
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
    </article>
  );
}
