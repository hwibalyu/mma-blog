---
name: article-review
description: Review an existing MMA blog article for factual risk, structure, style, headline/excerpt quality, emphasis density, AI-like meta wording, and publication readiness without editing the file unless explicitly asked.
---

# Article Review

Use this skill when the user asks to review, critique, audit, check, evaluate, or give feedback on an existing MMA article.

## Target resolution

Resolve the article to review using the first unambiguous match in this order:

1. Exact file path such as `content/posts/<slug>/index.md`
2. Post slug such as `choi-after-santos-ranking-path`
3. Site URL path such as `/posts/<slug>`
4. Linked folder such as `[title](content/posts/<slug>/)`
5. Exact post title, only if it clearly maps to one article

If the target is ambiguous, inspect the repository and choose the safest exact match. Only ask the user when there is real ambiguity that cannot be resolved locally.

## Read first

1. Read `content/INSTRUCTIONS.md` for the house style.
2. Read `content/HOW_TO_WRITE_POST.md` for repository structure and frontmatter rules.
3. Read the target `index.md` fully before forming conclusions.
4. Read `skills/fact-research/SKILL.md` if the article involves recent events, rankings, rumors, disputed claims, fight records, contract status, or any live topic.
5. For time-sensitive or disputed articles, run the `fact-research` workflow before judging factual quality.

## Review stance

- Default to **review-only**: do not modify the article file unless the user explicitly asks for edits.
- Lead with the most important findings, not compliments or a general summary.
- Prioritize issues that affect publication quality: factual risk, misleading framing, weak thesis, structure problems, flat prose, missing emphasis, weak headline/excerpt, broken markdown, source-list leakage, or AI-like meta wording.
- Be concrete. Reference the article file and line numbers whenever possible.
- Distinguish factual errors from uncertain claims, stylistic concerns, and optional polish.
- If the article is strong, say so clearly and focus on remaining risks or final polish.

## Review checklist

Check the article for:

- **Factual grounding**: records, dates, event names, rankings, contracts, results, quotes, and claims that may need verification.
- **Angle and thesis**: whether the article has a clear central argument instead of only summarizing information.
- **Opening**: whether the first paragraphs hook the reader without sounding like a prompt response.
- **AI/process leakage**: remove-worthy phrases such as `요청하신 대로`, `사용자 요청에 따라`, `이번 글에서는 요청대로`, `정리해달라는 취지에 맞춰`, `AI가 작성`, `프롬프트`, or equivalent wording that reveals the production process.
- **Magazine voice**: polished Korean MMA column tone, with technical and tactical depth where appropriate.
- **Structure**: logical section order, useful headings, no overlong sections that need `####` subheadings.
- **Emphasis density**: each major section should have a visible highlight such as bold text, a quote block, `<mark>`, `<u>`, `<ins>`, or a concise list.
- **Markdown hygiene**: valid frontmatter, valid image tags, concrete image descriptions, no generic `image.jpg` style placeholders when avoidable.
- **Frontmatter**: title, category, date, excerpt, tags, `author: THE MMA JOURNAL`, and cover image fields when the post has a clear representative image.
- **Excerpt and title**: search-facing clarity, primary fighter/event/angle near the front, concise one-line title when possible.
- **References policy**: no `참고한 공개 자료`, `출처`, or source lists inside `index.md`; source notes belong in `references.md`.
- **Internal links**: relevant existing posts are linked when they would improve context or reader flow.

## Output format

Use this structure unless the user asks for a different format:

1. **Findings**
   - List issues in priority order.
   - Include file links with line numbers.
   - Label severity as `[High]`, `[Medium]`, or `[Low]`.
2. **Strengths**
   - Keep brief and specific.
3. **Suggested Fix Direction**
   - Explain the most efficient way to improve the article.
   - If useful, include replacement wording for short passages.
4. **Publication Readiness**
   - Give one of: `Ready`, `Ready after minor edits`, `Needs revision`, or `Needs fact refresh`.

## If edits are requested

- If the user asks to apply the review, switch to `skills/article-edit/SKILL.md`.
- If the article is time-sensitive, run or reuse `fact-research` before editing.
- Apply changes directly to the target markdown file.
