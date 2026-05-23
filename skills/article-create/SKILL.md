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
- Frontmatter should include `author: THE MMA JOURNAL` unless the user explicitly asks for a different byline.
- Frontmatter should include `coverImage` and `coverImageAlt` whenever the article contains or is expected to contain a representative hero image.
- `excerpt` should be written as search-facing summary copy: ideally 1 to 2 sentences that tell the reader exactly what the article covers and why it matters.
- Write in the repository's Korean MMA magazine voice.
- Prefer a **single-line, high-impact title**. Avoid long, two-part or overloaded titles unless the user explicitly wants a softer magazine headline.
- Titles should surface the primary search intent early when possible, such as the main fighter name, event name, matchup, ranking question, or controversy angle.
- Default to prose-first writing. Do not build the article as a stack of bullets unless the user explicitly asks for list format.
- Use bullets or numbered lists only when they are genuinely necessary for comprehension, such as a tightly bounded comparison or set of fight variables that becomes less clear in prose.
- Do not turn several adjacent points into a list by habit. If the same material reads cleanly in narrative form, keep it as prose.
- Make each major section feel fully developed. Expand tactical explanation, context, and matchup logic instead of leaving sections at note-like summary depth.
- For event, ranking, rumor, or fighter trajectory articles, reflect both Korean and international framing when relevant.
- When a `###` section becomes long or contains multiple distinct beats, split it with `####` sub-subheadings for readability.
- Unless the passage is clearly analysis, interpretation, or opinion, write only facts that can be supported by evidence or public sources.
- Keep claims measured and precise. Do not exaggerate stakes, praise, criticism, certainty, or historical significance beyond what the evidence supports.
- Add 1 to 3 natural internal links when there are clearly relevant existing posts in the repo, especially for recurring fighters, connected events, or follow-up analysis.

## Image policy

- Do not generate image assets by default.
- Insert image slots directly into the markdown using the real markdown image tag format, with a concrete description and a relative placeholder filename.
- Treat the primary article image as the post's canonical cover image. The first intentionally chosen hero image should usually also be reflected in frontmatter as `coverImage` and `coverImageAlt`.
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

## Guardrails

- Do not present unsupported interpretation as straight fact. Attribute analysis, framing, or projection clearly when needed.
- Do not use inflated wording that overstates momentum, dominance, decline, controversy, or importance without solid support.
- When evidence is limited, narrow the claim or write with explicit uncertainty instead of filling the gap with confident language.

## Output checklist

- Broad fact collection happened before drafting.
- `index.md` exists in the correct folder.
- Frontmatter is valid.
- Frontmatter includes `author: THE MMA JOURNAL` unless the request explicitly overrides it.
- Frontmatter includes `coverImage` and `coverImageAlt` aligned with the article's primary image when a representative image is present.
- `excerpt` clearly states the article's subject and works as search/snippet copy.
- The title exposes the main fighter, event, or angle early enough to read well in search results.
- The article matches the requested topic and angle.
- The title is ideally one line and lands with a clear, memorable hook.
- The article reads primarily as connected prose rather than list-driven notes.
- Multiple points are not turned into list format unless that structure is clearly necessary.
- Major sections are materially developed, not just briefly summarized.
- Long sections are broken into readable `####` sub-subheadings where helpful.
- Non-opinion passages stay evidence-based and do not drift into unsupported assertion.
- The tone stays restrained and avoids overstatement.
- Image tags are already inserted in markdown at the intended positions.
- Each image tag uses a concrete, article-relevant description and a plausible relative placeholder filename.
- Strongly related existing posts are internally linked when that helps context or navigation.
- Any public-source notes are stored in `references.md`, not in the article body.
