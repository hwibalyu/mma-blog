---
name: fact-research
description: Gather and structure broad MMA facts before writing or revising an article, with official verification plus domestic/international media coverage.
---

# Fact Research

Use this skill before writing or revising meaningful MMA articles, especially for:

- recent events
- live rankings
- rumors and transfers
- event analysis
- fighter trajectory pieces
- anything involving disputed or time-sensitive claims

## Goal

Treat research as a first-class phase of the work. The article should be built on a verified fact base, not on memory or one-off articles.

## Source coverage

When available, gather from multiple layers:

1. **Official / primary**
   - promotion or event pages
   - Tapology or reliable fight record databases
   - official results, weigh-in, card listings, press releases
2. **Domestic Korean media**
   - Korean MMA news
   - Korean columns
   - interviews
   - Korean YouTube channels or analysis videos
3. **International media**
   - English-language news
   - international columns
   - interviews
   - English-language YouTube/video breakdowns
4. **Context / reaction**
   - post-fight interviews
   - analyst takes
   - market or scene impact discussions

Do not force every bucket if the material genuinely does not exist, but actively look across them before deciding it is unavailable.

## Required process

1. Verify the event basics first:
   - event name
   - date
   - venue
   - key results
   - method and round if relevant
2. Gather broader interpretation next:
   - what local media emphasized
   - what international media emphasized
   - whether YouTube/interview material reveals extra context, quotes, reactions, or scene impact
3. Cross-check any strong claim:
   - rankings
   - contract status
   - callouts
   - injuries
   - retirement / comeback framing
   - “biggest ever” or “first time” type claims
4. Distill the findings into writing inputs:
   - core facts
   - strongest angles
   - unresolved uncertainty
   - claims to avoid or soften

## Research notes

Before drafting or revising the article, create a short internal note in this format inside your working context or scratch notes:

- **Verified facts**
- **Korean media angle**
- **International angle**
- **Video / interview angle**
- **Open uncertainty**
- **Article thesis candidates**

You do not need to save this to the repo unless the user asks, but you should explicitly form it before writing.

## Reference handoff

- If the article workflow needs a persistent list of consulted public materials, store it in `content/posts/<slug>/references.md`.
- Do not append reference lists such as `참고한 공개 자료`, `출처`, or `Sources` to the bottom of `index.md`.
- The article body should stay clean and reader-facing; source tracking belongs in the separate references file.
- When handing off to `article-create` or `article-edit`, treat `references.md` as the default destination for public-source notes.

## Guardrails

- Do not rely on a single article for the whole piece.
- Do not infer rankings, records, or event significance without checking.
- Do not treat rumor as fact.
- Unless the eventual article is explicitly making analysis or opinion, treat unsupported claims as unusable until they are backed by evidence or public sourcing.
- When the evidence is mixed, write with calibrated language.
- Avoid exaggeration in the research handoff. Summaries should stay proportional to what the sourcing actually supports.
- If a specific YouTube claim or columnist opinion is unverified elsewhere, label it as interpretation rather than fact.

## Output effect

After using this skill, the article should:

- feel factually grounded
- reflect both Korean and international framing when relevant
- avoid brittle or overstated claims
- have a clearer, sharper thesis because the fact base is broader
