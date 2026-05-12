import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment variables." }, { status: 500 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${today} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // 커스텀 지침 파일 읽기
    const instructionPath = path.join(process.cwd(), "content/INSTRUCTIONS.md");
    let customInstructions = "";
    if (fs.existsSync(instructionPath)) {
      customInstructions = fs.readFileSync(instructionPath, "utf8");
    }

    const systemInstruction = `
당신은 세계 최고의 종합격투기(MMA) 전문 칼럼니스트입니다.
아래의 [작성 가이드라인]을 엄격히 준수하여 사용자의 요청에 따라 블로그 포스팅을 작성하세요.

[작성 가이드라인]
${customInstructions}

반드시 아래 JSON 형식으로 응답하세요 (다른 텍스트는 일절 배제):
{
  "slug": "영문-소문자-하이픈-조합의-포스트-ID",
  "imagePrompt": "A cinematic, premium sports photography prompt in English",
  "content": "--- 전체 마크다운 내용 ---"
}

- slug: 제목의 핵심 키워드를 활용한 영문 URL용 ID. (예: choi-doo-ho-victory-analysis)
- imagePrompt: 본문 내용에 가장 잘 어울리는 역동적이고 세련된 사진을 위한 **상세한 영문 프롬프트**.
- content: 
    1. 반드시 '---'로 시작하는 YAML Frontmatter를 포함할 것.
    2. date 항목은 반드시 "${currentTime}" (현재 날짜와 시간)으로 작성할 것.
    3. title, category, excerpt, tags 항목을 빠짐없이 채울 것.
    4. 본문은 [작성 가이드라인]의 분량과 스타일을 따를 것.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      tools: [
        {
          googleSearchRetrieval: {},
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text);
    let finalContent = result.content;

    // AI가 날짜를 틀리게 생성했을 경우를 대비해 서버측에서 강제로 오늘 날짜/시간으로 치환 (방어 코드)
    const dateRegex = /date:\s*["']?\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?["']?/;
    finalContent = finalContent.replace(dateRegex, `date: "${currentTime}"`);

    console.log("Generated Slug:", result.slug);

    return NextResponse.json({ 
      content: finalContent,
      slug: result.slug,
      imagePrompt: result.imagePrompt
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
