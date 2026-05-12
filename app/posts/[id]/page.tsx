import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/data";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// 빌드 시 정적 생성을 위해 추가 (선택사항이지만 권장)
export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = getPost(resolvedParams.id);

  if (!post) {
    notFound();
  }

  // 마크다운 파싱 오류(조사 붙임) 해결을 위한 전처리
  // **텍스트** 형태를 감지하여 강제로 HTML <strong> 태그로 변환합니다.
  const processedContent = post.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 max-w-3xl mx-auto">
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
            p: ({ node, ...props }) => <p className="my-6 font-serif text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/80 break-keep" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-4xl font-black mt-12 mb-6" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-3xl font-black mt-10 mb-5" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-2xl font-black mt-8 mb-4" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-accent pl-6 my-8 py-2 font-serif italic text-xl text-black/60 dark:text-white/60 break-keep" {...props} />
            ),
            li: ({ node, ...props }) => <li className="my-2 font-serif text-lg md:text-xl leading-relaxed text-black/80 dark:text-white/80 break-keep list-disc ml-6" {...props} />,
            ol: ({ node, ...props }) => <ol className="my-6 list-decimal ml-6" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-black text-black dark:text-white" {...props} />,
            img: ({ node, src, ...props }) => {
              let finalSrc = src;
              if (src && !src.startsWith('http') && !src.startsWith('/')) {
                const cleanSrc = src.replace(/^\.\//, '');
                finalSrc = `/api/assets/${post.id}/${cleanSrc}`;
              }
              
              return (
                <span className="block my-10 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={finalSrc} className="w-full h-auto object-cover max-h-[600px]" {...props} alt={props.alt || "Post image"} />
                  {props.alt && (
                    <span className="block text-center text-sm font-medium text-black/50 dark:text-white/50 py-3 bg-black/5 dark:bg-white/5">
                      {props.alt}
                    </span>
                  )}
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
