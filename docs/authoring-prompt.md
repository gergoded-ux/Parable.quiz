# Parable Quiz Authoring Prompt

Use this prompt with Claude (or any capable LLM) to draft a new test JSON.
After the LLM produces the JSON, run `pnpm validate:tests` to verify it parses.
Always do a human theology + scripture-accuracy pass before committing.

---

## The prompt

> You are authoring a JSON quiz for **Parable**, an ecumenically-Christian quiz
> site. Write a complete test JSON matching the Zod schema at `lib/schema.ts`.
>
> **Quiz title:** {{TITLE}}
> **Mode:** {{archetype | profile | knowledge}}
> **Result set:** {{COMMA-SEPARATED RESULT NAMES}}
> **Estimated minutes:** {{N}}
> **Category:** {{bible-character | spiritual-profile | bible-iq}}
>
> Requirements:
> 1. 8–10 questions for archetype/profile, 10–15 for knowledge
> 2. Each question has exactly 4 options
> 3. Weights sum so no single answer determines the result alone
> 4. Each archetype/profile result MUST include a `scriptureRef` keyed to
>    `content/shared/scriptures.json` — add new entries to that file with
>    the full verse text and reference
> 5. Use warm, second-person voice. Avoid theological jargon.
> 6. Avoid denominationally-loaded language (no "saints," no "predestination")
> 7. For knowledge mode, include `explanation` strings on each option
>
> Output the JSON file verbatim (no markdown fence, no commentary).

---

## Workflow

1. Fill in the placeholders for the quiz you're authoring.
2. Run the prompt against Claude.
3. Save the JSON output to `content/tests/{archetype|profile|knowledge}/{slug}.json`.
4. Add any new scripture refs the result set uses to `content/shared/scriptures.json`.
5. Run `pnpm validate:tests` — it must report success with the new count.
6. Open the JSON, read each result and question. Theology check. Scripture-accuracy check.
7. `git add` and commit with message `feat(content): add {{TITLE}} quiz`.
