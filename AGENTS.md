<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local Skills

## `fact-research`

When the user asks for any new MMA article, event analysis, rumor check, ranking piece, fighter profile, or time-sensitive revision, read and follow `skills/fact-research/SKILL.md` before writing.
Treat fact collection as a required first phase, not an optional polish step.
For meaningful MMA writing, research should cover official records/results plus broad media context when available, including domestic and international news, columns, interviews, and YouTube/video material.

## `article-edit`

When the user asks to revise, polish, expand, shorten, retitle, or structurally edit an existing MMA article, read and follow `skills/article-edit/SKILL.md` before making changes.
Treat requests mentioning `$article-edit`, `article-edit`, a post slug, a `content/posts/...` path, or a `/posts/...` URL as article editing requests.
When the user specifies a target article and asks for changes, update the real markdown file directly instead of only proposing copy in chat, unless the user explicitly asks for a draft only.
When writing or editing articles, increase emphasis density so key arguments, fighter names, turning points, and conclusions are visually highlighted with bold text, quotes, and short lists instead of long flat paragraphs.
If the article involves live topics, recent events, rankings, rumors, or disputed claims, run `fact-research` first and treat its output as a core dependency.

## `article-review`

When the user asks to review, critique, audit, check, evaluate, or give feedback on an existing MMA article without directly rewriting it, read and follow `skills/article-review/SKILL.md`.
Treat requests mentioning `$article-review`, `article-review`, `리뷰`, `검토`, `평가`, `체크`, a post slug, a `content/posts/...` path, or a `/posts/...` URL as article review requests when the user is asking for feedback rather than direct edits.
Default to review-only: do not modify the article file unless the user explicitly asks to apply fixes.
When reviewing, check factual risk, structure, magazine voice, title/excerpt quality, emphasis density, markdown/frontmatter hygiene, reference placement, and any AI-like meta wording such as `요청하신 대로`.
If the article involves live topics, recent events, rankings, rumors, or disputed claims, run `fact-research` first and treat its output as a core dependency.

## `article-create`

When the user asks to write, create, draft, publish, or generate a new MMA column/article/post, read and follow `skills/article-create/SKILL.md` before making changes.
Treat requests like `컬럼 작성해줘`, `새 포스트 써줘`, `기사 생성해줘`, `주제: ...`, or any request to create a new post under `content/posts/` as article creation requests.
When creating a new article, write the real markdown file directly under `content/posts/<slug>/index.md`.
Do not generate image assets by default. Instead, insert the image tag directly in the markdown with a concrete descriptive caption and a relative placeholder filename such as `![설명](./scene-placeholder.jpg)` so the user can add the real file later.
Do not leave source or reference lists inside the article body. Put public-source notes in a separate `content/posts/<slug>/references.md` file.
Before drafting the article, run `fact-research` and use it as the first major phase of the workflow.
