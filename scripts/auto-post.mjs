import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// .env.local 로드
dotenv.config({ path: envPath });

const postsDir = path.resolve(__dirname, '../content/posts');
const apiKeys = (process.env.ZAI_API_KEY || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

if (apiKeys.length === 0) {
  console.error('❌ ZAI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

async function callZaiWithRetry(prompt, systemInstruction) {
  let lastError = null;
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`🤖 [ZAI Key ${i + 1}/${apiKeys.length}] AI 호출 시도 중...`);
    
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
      
      if (response.ok) {
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('응답 형식이 올바르지 않습니다.');
        return JSON.parse(text);
      }

      const errorMsg = data.error?.message || `API Error: ${response.status}`;
      if (response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('limit')) {
        console.warn(`⚠️ [ZAI Key ${i + 1}] 할당량 초과: ${errorMsg}`);
        lastError = new Error(errorMsg);
        continue;
      }

      throw new Error(errorMsg);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [ZAI Key ${i + 1}] 오류 발생: ${error.message}`);
      if (i < apiKeys.length - 1) {
        console.log('🔄 다음 키로 재시도합니다...');
      }
    }
  }
  throw lastError || new Error('모든 API 키 시도가 실패했습니다.');
}

async function runAutoPost() {
  console.log('🔍 [Z.AI] 최신 MMA 이슈 검색 및 포스팅 생성 중...');

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const existingFolders = fs.readdirSync(postsDir).filter(f => fs.statSync(path.join(postsDir, f)).isDirectory());
  const existingTitles = existingFolders.map(folder => {
    const filePath = path.join(postsDir, folder, 'index.md');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/title:\s*"(.*)"/);
      return match ? match[1] : '';
    }
    return '';
  }).filter(Boolean);

  const now = new Date();
  const currentTime = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const instructionPath = path.resolve(__dirname, '../content/INSTRUCTIONS.md');
  const customInstructions = fs.existsSync(instructionPath) ? fs.readFileSync(instructionPath, 'utf8') : '';

  const systemInstruction = `
당신은 MMA 전문 기자입니다. 실시간 웹 검색을 통해 오늘 현재 가장 뜨거운 MMA(UFC 등) 뉴스나 이슈를 찾아보세요.
이미 작성된 포스트들(${existingTitles.join(', ')})과 겹치지 않는 새로운 이슈를 선정해야 합니다.

[작성 가이드라인]
${customInstructions}

반드시 아래 JSON 형식으로 응답하세요 (다른 텍스트 배제):
{
  "slug": "영문-포스트-id",
  "title": "글 제목",
  "content": "--- 전체 마크다운 내용 ---"
}

- date는 반드시 "${currentTime}"로 작성하세요.
`;

  const prompt = "오늘 가장 화제가 되는 MMA 뉴스를 하나 선정해서 심층 분석 칼럼을 작성해줘.";

  try {
    const result = await callZaiWithRetry(prompt, systemInstruction);

    // 3. 파일 저장
    const newPostDir = path.join(postsDir, result.slug);
    if (fs.existsSync(newPostDir)) {
      console.log(`⚠️ 이미 존재하는 슬러그입니다: ${result.slug}. 번호를 붙여 저장합니다.`);
      const altSlug = `${result.slug}-${Date.now()}`;
      const altDir = path.join(postsDir, altSlug);
      fs.mkdirSync(altDir, { recursive: true });
      fs.writeFileSync(path.join(altDir, 'index.md'), result.content, 'utf8');
      console.log(`✅ 저장 완료: ${altDir}`);
    } else {
      fs.mkdirSync(newPostDir, { recursive: true });
      fs.writeFileSync(path.join(newPostDir, 'index.md'), result.content, 'utf8');
      console.log(`✅ 저장 완료: ${newPostDir}`);
    }

  } catch (error) {
    console.error('❌ [Z.AI] 최종 오류 발생:', error.message);
  }
}

runAutoPost();
