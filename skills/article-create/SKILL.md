---
name: article-create
description: Create new MMA blog articles in this repository, leaving image insertion tags with concrete descriptions and placeholder local filenames for the user to fill later.
---

# Article Create

Use this skill when the user asks to create a new MMA column, article, or post.

## Read first

1. Read `content/INSTRUCTIONS.md`.
2. Read `content/HOW_TO_WRITE_POST.md`.
3. Read `skills/fact-research/SKILL.md`.
4. Run the `fact-research` workflow before drafting the article.

## Required behavior

- Treat fact collection as the first major phase of the task.
- Create the real post folder and `index.md` under `content/posts/<slug>/`.
- If reference notes are needed, store them in `content/posts/<slug>/references.md`, not in the article body.
- Do not stop at an outline or draft in chat unless the user explicitly asks for draft-only output.
- Frontmatter must be valid and use repo conventions.
- Write in the repository's Korean MMA magazine voice.
- For event, ranking, rumor, or fighter trajectory articles, reflect both Korean and international framing when relevant.

## Image policy

- Do not generate image assets by default.
- Insert image slots directly into the markdown using the real markdown image tag format, with a concrete description and a relative placeholder filename.
- Use descriptive placeholder filenames that imply the intended scene, for example `./topuria-makhachev-faceoff.jpg` or `./zfn-cage-atmosphere.jpg`.
- Do not use vague placeholders like `./image.jpg`, `./photo1.jpg`, or `./placeholder.png`.
- Prefer 1 to 3 images per post.
- Image captions in markdown must describe concrete scenes, not vague placeholders.
- The inserted tag itself should be the container the user will later satisfy with a real file, for example:

```markdown
![토푸리아와 마카체프가 옥타곤 중앙에서 서로를 응시하는 슈퍼파이트 분위기 이미지](./topuria-makhachev-faceoff.jpg)
```

- If the article is about a real event or real fighters, prefer descriptions based on:
  1. editorial event photo style
  2. in-cage action still
  3. fighter portrait
  4. premium sports poster illustration
- If the article needs multiple images, spread the tags at meaningful section breaks instead of clustering them at the top.

## Reference policy

- Do not append `참고한 공개 자료`, `출처`, `Sources`, or similar source lists to `index.md`.
- When you need to preserve the public materials consulted, create or update `content/posts/<slug>/references.md`.
- Keep `references.md` concise and list-shaped.
- `index.md` should read like a clean magazine article without bibliography text at the bottom.

## Output checklist

- Broad fact collection happened before drafting.
- `index.md` exists in the correct folder.
- Frontmatter is valid.
- The article matches the requested topic and angle.
- Image tags are already inserted in markdown at the intended positions.
- Each image tag uses a concrete, article-relevant description and a plausible relative placeholder filename.
- Any public-source notes are stored in `references.md`, not in the article body.
