"use client";
import { useState, useEffect } from "react";

type Post = { id: string; title: string; category: string; date: string; raw: string };

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<"list" | "edit" | "create">("list");
  
  const [currentId, setCurrentId] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("프롬프트를 입력해주세요.");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent(data.content);
        if (data.slug) {
          setCurrentId(data.slug);
        } else if (!currentId) {
          setCurrentId("ai-generated-post");
        }
        if (data.imagePrompt) {
          setImagePrompt(data.imagePrompt);
        }
      } else {
        alert("생성 실패: " + data.error);
      }
    } catch (e) {
      alert("네트워크 오류");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!currentId) return alert("이미지를 생성하려면 먼저 Post ID가 필요합니다.");
    
    // 만약 AI가 생성한 전용 프롬프트가 없다면, 본문 상단 100자나 제목을 이용해 생성
    let targetPrompt = imagePrompt;
    if (!targetPrompt) {
      // 마크다운에서 제목 추출 시도
      const titleMatch = content.match(/title:\s*"(.*)"/);
      const title = titleMatch ? titleMatch[1] : "";
      targetPrompt = `Cinematic premium sports photography of ${title || currentId}, MMA theme, high resolution, 8k, professional lighting`;
    }

    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt, postId: currentId }),
      });
      const data = await res.json();
      if (res.ok) {
        const imgTag = `\n\n![AI 생성 이미지](./${data.fileName})\n\n`;
        setContent(prev => prev + imgTag);
        alert("AI 이미지 생성이 완료되었습니다! 본문 하단에 삽입되었습니다.");
      } else {
        alert("이미지 생성 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentId) {
      alert("Post ID (URL로 쓰일 폴더명/파일명)를 입력해주세요.");
      return;
    }
    
    const method = mode === "create" ? "POST" : "PUT";
    const url = mode === "create" ? "/api/posts" : `/api/posts/${currentId}`;
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentId, content }),
    });

    if (res.ok) {
      alert("저장되었습니다!");
      setMode("list");
      fetchPosts();
    } else {
      const err = await res.json();
      alert("저장 실패: " + err.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 포스트를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPosts();
    } else {
      alert("삭제 실패");
    }
  };

  const editPost = (post: Post) => {
    setCurrentId(post.id);
    setContent(post.raw);
    setMode("edit");
  };

  const createPost = () => {
    setCurrentId("");
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const currentTime = `${dateStr} ${timeStr}`;

    setContent(`---
title: ""
category: "컬럼"
date: "${currentTime}"
excerpt: ""
tags: []
---

`);
    setPrompt("");
    setMode("create");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentId) {
      if (!currentId) alert("이미지를 업로드하려면 먼저 Post ID를 입력해주세요.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/posts/${currentId}/assets`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const imgTag = `\n\n![이미지 설명](./${data.fileName})\n\n`;
        setContent(prev => prev + imgTag);
        alert(`업로드 성공! 본문 하단에 이미지 태그가 추가되었습니다.`);
      } else {
        alert("업로드 실패");
      }
    } catch (error) {
      alert("업로드 중 오류 발생");
    } finally {
      setIsUploading(false);
    }
  };

  if (mode === "list") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-black">블로그 관리 대시보드</h1>
          <button onClick={createPost} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg hover:opacity-80">
            + 새 글 쓰기 (AI 지원)
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <div key={post.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition">
              <div>
                <div className="text-xs font-bold text-accent mb-1">{post.category} | {post.date}</div>
                <div className="font-bold text-lg">{post.title}</div>
                <div className="text-sm text-gray-500">/{post.id}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editPost(post)} className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">수정</button>
                <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">{mode === "create" ? "새 글 쓰기" : "글 수정"}</h1>
        <button onClick={() => setMode("list")} className="px-4 py-2 border font-bold rounded hover:bg-gray-100 dark:hover:bg-gray-800">목록으로</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold">Post ID (URL 경로)</label>
          <input 
            type="text" 
            value={currentId} 
            onChange={e => setCurrentId(e.target.value)} 
            disabled={mode === "edit"}
            className="p-3 border rounded-lg dark:bg-black/50"
            placeholder="예: my-new-post"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold">이미지 첨부</label>
          <input 
            type="file" 
            onChange={handleUpload} 
            disabled={isUploading || !currentId}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:opacity-80 cursor-pointer disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold text-accent">✨ AI 이미지 생성</label>
          <button 
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !currentId}
            className="w-full py-2 bg-accent text-white font-bold rounded-full hover:opacity-80 disabled:opacity-50 transition"
          >
            {isGeneratingImage ? "이미지 생성 중..." : "AI 사진 만들기"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6 border-2 border-dashed border-accent/50 rounded-xl bg-accent/5">
        <label className="font-bold text-accent">🤖 Gemini AI 자동 작성 (프롬프트)</label>
        <div className="flex flex-col gap-3">
          <textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="원하시는 글의 방향, 참고할 자료, 분석하고 싶은 내용 등을 길게 작성하실 수 있습니다. (여러 줄 가능)&#13;&#10;예: 최신 UFC 300 리뷰를 작성해줘. 1라운드 타격 위주로 짧고 강렬하게 써줘."
            className="w-full p-4 border rounded-lg dark:bg-black/50 min-h-[120px] resize-y"
          />
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="self-end px-6 py-2 bg-accent text-white font-bold rounded-lg hover:opacity-80 disabled:opacity-50"
          >
            {isGenerating ? "작성 중..." : "AI 작성 시작"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-[500px]">
        <label className="font-bold">마크다운 본문 (Frontmatter 포함)</label>
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="flex-1 p-4 font-mono text-sm border rounded-xl dark:bg-black/50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          placeholder="---\ntitle: ...\n---\n\n마크다운 내용..."
        />
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black text-lg rounded-xl hover:opacity-80">
          포스트 저장하기
        </button>
      </div>
    </div>
  );
}
