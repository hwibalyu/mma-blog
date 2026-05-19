---
name: article-edit
description: Edit existing MMA blog articles in this repository. Use when the user asks to revise, polish, shorten, expand, retitle, restructure, or otherwise modify a post under content/posts. Preserve the repo's Korean MMA magazine voice and frontmatter conventions while improving the article.
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
3. Read the target article before editing so the revision keeps its existing angle, facts, and structure unless the user asks for a rewrite.

## Required behavior

- If the user asks for a revision, apply the change directly to the target markdown file.
- Do not stop at analysis, suggestions, or replacement paragraphs unless the user explicitly asks for draft-only output.
- Treat content requests such as "반영", "수정", "다듬어줘", "추가해줘", "줄여줘", and "제목 바꿔줘" as file edit requests.
- After editing, make sure the requested points are reflected in the actual file contents.

## Editing goals

- Preserve the article's core thesis unless the user asks for a new angle.
- Keep the tone polished, analytical, and magazine-like.
- Improve clarity, rhythm, transitions, and section structure.
- Strengthen technical and tactical MMA analysis where useful.
- Keep markdown valid and preserve local image references such as `![alt](./image.jpg)`.

## Guardrails

- Do not change the folder slug or file path unless the user explicitly asks.
- Do not invent facts, quotes, records, dates, or results. If a claim looks time-sensitive or uncertain, verify it first.
- Preserve frontmatter fields unless the edit requires updating them.
- Keep category values aligned with the repo convention: `컬럼` or `해외컬럼`, unless the user requests a different taxonomy.
- If the user asks for a light edit, prefer surgical wording changes over full rewrites.

## Revision checklist

- Frontmatter is present and still valid.
- Title and excerpt still match the revised body.
- The article has a strong opening and clear section flow.
- Important fighters, techniques, and outcomes are emphasized cleanly with markdown.
- Any inserted image placeholders use relative local paths.

## Output preference

When making article edits, directly update the target markdown file and keep changes consistent with the surrounding prose instead of pasting a detached draft unless the user asks for one.
