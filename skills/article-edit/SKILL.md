---
name: article-edit
description: Edit existing MMA blog articles in this repository. Use when the user asks to revise, polish, shorten, expand, retitle, restructure, or otherwise modify a post under content/posts. Preserve the repo's Korean MMA magazine voice and frontmatter conventions while improving the article, and make sure emphasis and highlight density stay strong.
---

# Article Edit

Use this skill when working on an existing post in `content/posts/*/index.md`.

## Target resolution

Resolve the article to edit using the first unambiguous match in this order:

1. Exact file path such as `content/posts/<slug>/index.md`
2. Post slug such as `choi-after-santos-ranking-path`
3. Site URL path such as `/posts/<slug>`
4. Linked folder such as `[title](content/posts/<slug>/)`
5. Exact post title, only if it clearly maps to one article

If the target is ambiguous, inspect the repository and choose the safest exact match. Only ask the user when there is real ambiguity that cannot be resolved locally.

## Read first

1. Read `content/INSTRUCTIONS.md` for the house style.
2. Read `content/HOW_TO_WRITE_POST.md` for the repository's post structure and frontmatter rules.
3. Read `skills/fact-research/SKILL.md`.
4. If the article is recent, event-based, rumor-based, ranking-based, or otherwise time-sensitive, run the `fact-research` workflow before editing.
5. In those cases, the fact refresh should actively check broad source coverage when available:
   - official event/result sources
   - domestic Korean MMA news and columns
   - international MMA news and columns
   - domestic and international interviews
   - domestic and international YouTube/video analysis
6. Do not treat a revision as "wording-only" if the factual frame may have shifted.
7. Read the target article before editing so the revision keeps its existing angle, facts, and structure unless the user asks for a rewrite.

## Required behavior

- If the user asks for a revision, apply the change directly to the target markdown file.
- Do not stop at analysis, suggestions, or replacement paragraphs unless the user explicitly asks for draft-only output.
- Treat content requests such as "반영", "수정", "다듬어줘", "추가해줘", "줄여줘", and "제목 바꿔줘" as file edit requests.
- After editing, make sure the requested points are reflected in the actual file contents.
- Keep or normalize the byline to `author: THE MMA JOURNAL` unless the user explicitly wants a different author field.
- Tighten `excerpt` when the existing summary is vague, bloated, or weak as search-result copy.
- Remove or rewrite any meta framing that implies the article was produced from a user prompt, request, or AI instruction.
- Ban phrases such as `요청하신 대로`, `사용자 요청에 따라`, `이번 글에서는 요청대로`, `정리해달라는 취지에 맞춰`, `AI가 작성`, `프롬프트`, or any equivalent wording that reveals the writing process instead of speaking directly to readers.
- When this kind of wording appears, replace it with a direct magazine-style thesis, scene-setter, or transition.
- If the topic is time-sensitive, treat fact refresh as a required dependency, not optional cleanup.
- If recent coverage exists, the revised article should reflect not just official facts but also the broader Korean and international media framing where relevant.
- Unless the passage is clearly analysis, interpretation, or opinion, write only facts that can be supported by evidence or public sources.
- Keep claims measured and precise. Do not exaggerate stakes, praise, criticism, certainty, or historical significance beyond what the evidence supports.

## Editing goals

- Preserve the article's core thesis unless the user asks for a new angle.
- Keep the tone polished, analytical, and magazine-like.
- Improve clarity, rhythm, transitions, and section structure.
- When revising titles, prefer a **single-line, high-impact headline** over a long explanatory chain unless the user asks otherwise.
- When revising titles for discoverability, move the primary search intent forward: the fighter name, event, matchup, or key issue should appear early when possible.
- Prefer connected narrative prose over outline-like bullet formatting.
- Use lists only when they are genuinely necessary for comprehension and prose would make the same point less clear.
- Do not present multiple points as a list by default. If the same content works cleanly as prose, keep it in prose.
- When the user asks for a richer piece, deepen the tactical and contextual analysis instead of only lengthening the wording.
- When a `###` section grows long or covers multiple distinct ideas, split it with `####` sub-subheadings so the section is easier to scan.
- Strengthen technical and tactical MMA analysis where useful.
- Keep markdown valid and preserve local image references such as `![alt](./fighter-faceoff.jpg)`.
- When a post has a clear primary image, ensure frontmatter has `coverImage` and `coverImageAlt` that match the intended representative image.
- Add or refine internal links to strongly related existing posts when that improves context, crawlability, or reader flow.
- Increase visual emphasis so the article does not read like a flat wall of text.

## Emphasis rules

- Every major section should contain at least one visible highlight: bold text, an inline key sentence, a quote block, or a short list.
- Bold the most important fighter names, turning points, techniques, and conclusions.
- Keep `**bold**` for fighter names, techniques, outcomes, and core terms.
- Use `<mark>...</mark>` for the single most important takeaway line in a section.
- Use `<u>...</u>` or `<ins>...</ins>` for comparison points, interpretive conclusions, or phrases you want the reader to notice without making them the top headline line.
- Avoid stacking emphasis on the same sentence. Prefer one primary emphasis style per sentence.
- If two long paragraphs appear back to back, break the rhythm with a bold sentence before reaching for a concise list.
- Use quote blocks for thesis lines or the article's strongest interpretive statement.
- In matchup or round analysis, use short lists sparingly and only when prose would become less clear.
- If one section contains multiple analytical layers such as context, tactics, and prediction, prefer `####` sub-subheadings rather than one uninterrupted block.

## Guardrails

- Do not change the folder slug or file path unless the user explicitly asks.
- Do not invent facts, quotes, records, dates, or results. If a claim looks time-sensitive or uncertain, verify it first.
- Do not rely on a single recap article when refreshing a live or recent topic.
- Do not present unsupported interpretation as straight fact. Attribute analysis, framing, or projection clearly when needed.
- Do not use inflated wording that overstates momentum, dominance, decline, controversy, or importance without solid support.
- Preserve frontmatter fields unless the edit requires updating them.
- If `author`, `coverImage`, or `coverImageAlt` are missing and the edit context makes them clear, add them rather than leaving the frontmatter incomplete.
- If `excerpt` is too vague for search or share previews, rewrite it instead of preserving weak summary copy.
- Keep category values aligned with the repo convention: `컬럼` or `해외컬럼`, unless the user requests a different taxonomy.
- If the user asks for a light edit, prefer surgical wording changes over full rewrites.
- If you insert a new image slot during an edit, add the actual markdown image tag directly with a concrete caption and a relative placeholder filename the user can later replace with a real file.
- Do not trigger image generation as part of article edits unless the user explicitly asks for it.
- Do not leave `참고한 공개 자료` or source lists inside `index.md`; move them to `references.md` in the same post folder.

## Revision checklist

- Frontmatter is present and still valid.
- `author` is set to `THE MMA JOURNAL` unless the request explicitly says otherwise.
- `coverImage` and `coverImageAlt` are present when the article has a clear representative image.
- `excerpt` clearly says what the article covers and reads cleanly as search/snippet copy.
- Title and excerpt still match the revised body.
- No sentence implies the piece was written by AI, generated from a prompt, or produced "as requested"; any such wording has been removed.
- The title is concise, one-line when possible, and carries a strong hook.
- The article has a strong opening and clear section flow.
- The revised piece reads as prose first, with lists used only where clearly justified.
- Multiple points are not turned into list format unless that structure is clearly necessary.
- Expanded sections feel meaningfully more complete, not just cosmetically longer.
- Important fighters, techniques, and outcomes are emphasized cleanly with markdown.
- Strongly relevant existing posts are internally linked where that helps context and navigation.
- Each major section has enough visual emphasis to be easy to scan.
- Non-opinion passages stay evidence-based and do not drift into unsupported assertion.
- The tone stays restrained and avoids overstatement.
- Any inserted image tags use concrete descriptions and relative placeholder filenames, not generic names like `image.jpg`.
- Any reference or source list is stored in `references.md`, not at the bottom of the article body.

## Output preference

When making article edits, directly update the target markdown file and keep changes consistent with the surrounding prose instead of pasting a detached draft unless the user asks for one.
