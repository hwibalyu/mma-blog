import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const { prompt, includeImages = true, imageStyle = "event-photo" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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

    const imagePromptGuide = `
[이미지 프롬프트 작성 규칙]
- imagePrompt는 반드시 영어로 작성한다.
- imagePrompt는 "실제 기사에 들어갈 대표 비주얼 1장"을 목표로 한다.
- 추상적인 아트, 의미 불명 오브젝트, 기괴한 얼굴, 과장된 해부학, 과도한 타이포그래피를 절대 유도하지 말 것.
- 사용자가 요청한 이미지 스타일은 "${imageStyle}" 이다. 이 스타일과 맞지 않는 이미지는 피하라.
- 반드시 아래 4가지 스타일 중 기사에 가장 맞는 1가지를 고른다.
  1. photorealistic editorial MMA event photography
  2. cinematic in-cage fight action still
  3. premium fighter portrait photography
  4. premium sports poster illustration
- 기사 주제가 실제 이벤트 분석이면 경기장, 케이지, 조명, 선수 간 거리감, 코너 분위기 같은 "현장성"을 우선하라.
- 기사 주제가 특정 매치업 분석이면 두 선수의 대치, 타격 교환, 클린치, 테이크다운 방어 중 하나처럼 장면이 분명한 이미지를 우선하라.
- 기사 주제가 특정 선수 중심이면 인물 중심 portrait 또는 training-camp/editorial style 이미지를 우선하라.
- imagePrompt에는 다음 요소를 최대한 포함하라:
  - who/what is in frame
  - camera style
  - lighting
  - arena or background context
  - mood
  - visual realism or illustration direction
- 다음 네거티브 제약을 반드시 문장 안에 포함하라:
  "no text, no watermark, no logo, no deformed hands, no extra fingers, no extra limbs, no blurry face, no duplicated subject, no surreal objects"
- 실존 선수나 실제 이벤트를 다루더라도, 참조 사진 없이 얼굴을 완벽 복제하려고 하지 말고 "editorial photo inspired by the event" 또는 "premium sports illustration inspired by the matchup"처럼 안전하고 자연스럽게 묘사하라.
- 결과적으로 imagePrompt만 읽어도 어떤 장면을 생성해야 하는지 바로 떠오를 정도로 구체적이어야 한다.
`;

    const naverArticleGuide = `
[네이버 블로그 압축본 작성 규칙]
- 원글 content와 별도로 naverContent를 반드시 작성한다.
- naverContent는 같은 주제의 네이버 블로그용 압축 아티클이다. 원글을 복붙하지 말고 라이트 유저가 빠르게 읽도록 재구성한다.
- 전체 길이는 한국어 기준 2000~2200자 정도를 목표로 한다.
- 한 문단은 1~3문장으로 짧게 끊고, 문장도 길게 늘이지 않는다.
- 전문 용어는 쓰되 바로 쉬운 말로 풀어준다.
- 제목은 검색 키워드를 살리되 너무 무겁지 않게 쓴다.
- 초반 3문단 안에 "무슨 일인지", "왜 봐야 하는지", "핵심 결론"이 드러나야 한다.
- 핵심 포인트는 짧은 불렛 리스트를 1~2개 활용한다.
- bold, 인용구, <mark>를 적절히 쓰되 과하게 꾸미지 않는다.
- 이미지 태그는 원글보다 많이 넣는다. 본문 중간중간 7~8개의 구체적 플레이스홀더를 배치한다.
- 이미지 플레이스홀더는 사용자가 검색해서 찾기 쉬운 실제성 있는 장면으로 쓴다. 예: 공식 계체 사진, 페이스오프, 이벤트 포스터, 케이지 액션 스틸, 중계 캡처, 랭킹 그래픽, 기자회견, 파이터 SNS/훈련 사진.
- 각 이미지 파일명은 장면과 인물이 드러나는 상대 경로로 쓴다. 예: ./fighter-name-weigh-in.jpg, ./event-poster.jpg, ./cage-action-round-two.jpg
- 참고자료, 출처 목록, 작성 과정 설명, AI 언급은 naverContent 본문에 넣지 않는다.
- naverContent도 반드시 YAML Frontmatter로 시작한다. title, category, date, excerpt, tags, author를 포함하고 date는 "${currentTime}"로 맞춘다.
`;

    const systemInstruction = `
당신은 세계 최고의 종합격투기(MMA) 전문 칼럼니스트입니다.
아래의 [작성 가이드라인]을 엄격히 준수하여 사용자의 요청에 따라 블로그 포스팅을 작성하세요.

[작성 가이드라인]
${customInstructions}

${imagePromptGuide}

${naverArticleGuide}

반드시 아래 JSON 형식으로 응답하세요 (다른 텍스트는 일절 배제):
{
  "slug": "영문-소문자-하이픈-조합의-포스트-ID",
  "imagePrompt": "A highly specific English prompt for a realistic MMA article visual",
  "content": "--- 전체 마크다운 내용 ---",
  "naverContent": "--- 네이버 블로그용 압축 마크다운 내용 ---"
}

- slug: 제목의 핵심 키워드를 활용한 영문 URL용 ID. (예: choi-doo-ho-victory-analysis)
- imagePrompt: 본문 내용에 가장 잘 어울리는 역동적이고 세련된 **상세한 영문 이미지 생성 프롬프트**.
    1. 반드시 1문장 이상 3문장 이하로 작성할 것.
    2. 이미지 종류가 사진인지 일러스트인지 명확히 드러낼 것.
    3. 기사 내용과 직접 연결되는 인물, 기술, 이벤트 문맥이 들어갈 것.
    4. 마지막에 반드시 negative constraints를 포함할 것.
- content: 
    1. 반드시 '---'로 시작하는 YAML Frontmatter를 포함할 것.
    2. date 항목은 반드시 "${currentTime}" (현재 날짜와 시간)으로 작성할 것.
    3. title, category, excerpt, tags 항목을 빠짐없이 채울 것.
    4. category는 반드시 "컬럼", "해외컬럼/뉴스", "매치분석" 중 하나만 사용할 것.
    5. 본문은 [작성 가이드라인]의 분량과 스타일을 따를 것.
    6. ${includeImages ? "본문 중간중간에 이미지 태그(![설명](./filename.jpg))를 2~3개 적절히 배치할 것." : "본문에 이미지 태그를 절대 포함하지 말 것."}
- naverContent:
    1. content의 핵심을 네이버 블로그용으로 압축한 별도 마크다운이다.
    2. 반드시 '---'로 시작하는 YAML Frontmatter를 포함할 것.
    3. date 항목은 반드시 "${currentTime}" (현재 날짜와 시간)으로 작성할 것.
    4. 2000~2200자 정도로, 짧은 문단, 쉬운 표현, 빠른 결론, 1~2개의 짧은 리스트 중심으로 구성할 것.
    5. ${includeImages ? "원글보다 이미지가 많도록 본문 중간중간 이미지 태그를 7~8개 포함할 것. 검색해서 찾기 쉬운 실제성 있는 장면을 설명하고, 구체적인 상대 파일명을 사용할 것." : "본문에 이미지 태그를 절대 포함하지 말 것."}
`;

    // z.ai API 키 로드 (GEMINI_API_KEY 변수를 재사용하거나 ZAI_API_KEY 사용 가능하도록 대응)
    const apiKeys = (process.env.ZAI_API_KEY || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    console.log(`[Generate ZAI] Total keys found: ${apiKeys.length}`);

    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "ZAI_API_KEY (or GEMINI_API_KEY) is not set" }, { status: 500 });
    }

    let lastError: Error = new Error("모든 API 키가 실패했습니다.");

    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`[Generate ZAI] Trying key ${i + 1}/${apiKeys.length}...`);
      try {
        const response = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "glm-4.7-flash",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            tools: [
              {
                type: "web_search",
                web_search: {
                  enable: true
                }
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          const errorMsg = data.error?.message || `API Error: ${response.status}`;
          if (response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('limit')) {
            console.warn(`⚠️ [ZAI Key ${i + 1}] Quota exceeded: ${errorMsg}`);
            lastError = new Error(errorMsg);
            continue;
          }
          throw new Error(errorMsg);
        }

        const text = data.choices[0].message.content;
        if (!text) {
          throw new Error("AI 응답이 비어있습니다.");
        }

        const parsedResult = JSON.parse(text);
        let finalContent = parsedResult.content;
        let finalNaverContent =
          typeof parsedResult.naverContent === "string" ? parsedResult.naverContent : "";
        
        // 날짜 보정 로직 유지
        const dateRegex = /date:\s*["']?\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?["']?/;
        finalContent = finalContent.replace(dateRegex, `date: "${currentTime}"`);
        finalNaverContent = finalNaverContent.replace(dateRegex, `date: "${currentTime}"`);

        console.log(`[Generate ZAI] Success with key ${i + 1}`);

        return NextResponse.json({ 
          content: finalContent,
          naverContent: finalNaverContent,
          slug: parsedResult.slug,
          imagePrompt: parsedResult.imagePrompt
        });
      } catch (err: unknown) {
        console.error(`[Generate ZAI] Key ${i + 1} failed:`, getErrorMessage(err));
        lastError = err instanceof Error ? err : new Error(getErrorMessage(err));
        if (i === apiKeys.length - 1) break;
      }
    }

    return NextResponse.json({ error: lastError.message || "z.ai API 호출 중 오류가 발생했습니다." }, { status: 500 });
  } catch (error: unknown) {
    console.error("Critical ZAI Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
