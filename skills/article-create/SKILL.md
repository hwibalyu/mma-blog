---
name: article-create
description: Create new MMA blog articles in this repository, including real local image assets by default.
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
- Do not stop at an outline or draft in chat unless the user explicitly asks for draft-only output.
- Frontmatter must be valid and use repo conventions.
- Write in the repository's Korean MMA magazine voice.
- For event, ranking, rumor, or fighter trajectory articles, reflect both Korean and international framing when relevant.

## Image policy

- By default, generate real local image assets for the post.
- Do not leave SVG placeholders or generic `./image.jpg` placeholders unless:
  - the user explicitly wants placeholders only, or
  - image generation is blocked and you must fall back.
- Prefer 1 to 3 images per post.
- Image captions in markdown must describe concrete scenes, not vague placeholders.
- If the article is about a real event or real fighters, prefer:
  1. editorial event photo style
  2. in-cage action still
  3. fighter portrait
  4. premium sports poster illustration
- If exact real-photo fidelity is not feasible, generate an event-inspired editorial visual or sports illustration that still matches the article.

## How to generate images

After writing `index.md`, run:

```bash
node scripts/generate-post-images.mjs --post <slug>
```

Optional style override:

```bash
node scripts/generate-post-images.mjs --post <slug> --style fight-action
node scripts/generate-post-images.mjs --post <slug> --style fighter-portrait
node scripts/generate-post-images.mjs --post <slug> --style poster-illustration
```

Optional extra article context:

```bash
node scripts/generate-post-images.mjs --post <slug> --context "ZFN 04 event analysis, Jung Chan-sung promotional influence, Korean MMA atmosphere"
```

The script reads image tags from the markdown, generates real JPG files into the same post folder, and rewrites the markdown paths to the generated filenames.

## Output checklist

- Broad fact collection happened before drafting.
- `index.md` exists in the correct folder.
- Frontmatter is valid.
- The article matches the requested topic and angle.
- Image captions are concrete and article-relevant.
- Real image files were generated and referenced in markdown unless explicitly skipped.
