# Prompt 1:
You are about to perform a deep read of a React/TypeScript project. Your goal is to build a complete internal understanding of two systems: the interaction system and the components system, including all types.
Do not make suggestions or recommendations yet. This is a pure data-gathering pass.
Read every file in the following directories thoroughly:
web-react/src/interaction
web-react/src/components
For each file, internally map and retain:
What it does — its responsibility and purpose
What it exports — functions, types, interfaces, constants
What it imports — its dependencies, both internal and external
How it connects — how it relates to other files you've read

Pay special attention to:
The full pipeline flow in interaction/core/ and how it connects to interaction/solvers/
How the interaction/types/ types are used across the system
How the interaction/stores/ (Carousel, Drag, Slider) are structured and how they relate to each other
How each primitive in components/primitives/ (Carousel, Drag, Slider) uses its hooks, solvers, and stores
The bridge in components/hooks/bridge.js and how it fits into the overall flow
When you are done reading, confirm you have completed the pass and give me a brief high-level summary (3–5 sentences) of what you understand the interaction + components system to be doing at a conceptual level. No recommendations yet — just confirm your understanding.

# Here's your Prompt 2:

You have already read and internally mapped the interaction/ and components/primitives/ systems. Now perform a deep analysis pass. Do not produce fixes or suggestions yet — this is diagnosis only.
Analyse the codebase through each of the following lenses and produce a structured written report:
1. Type Safety
Loose types, missing type guards, any any usage, unsafe assumptions about data shapes, missing return types.
2. State Management
Zustand store boundaries and whether they are well scoped, cross-store dependencies, subscription granularity and potential for unnecessary re-renders, store method responsibilities.
3. Separation of Concerns
Especially within interaction/ — pipeline, solvers, bridge, updater, types. Does each file/module do exactly one thing? Are any responsibilities leaking across boundaries?
4. Naming & Discoverability
Could a developer unfamiliar with this codebase find, understand, and edit any given piece of functionality quickly? Flag anything confusing, misleading, or inconsistently named across the three primitives (Carousel, Slider, Drag).
5. Consistency Across Primitives
Carousel, Slider, and Drag follow the same architectural pattern. Audit whether they have drifted — in naming conventions, hook structure, solver interface, or how they connect to the pipeline. Flag any asymmetries.
6. Error Handling & Edge Cases
What happens on unmounted elements, simultaneous multi-pointer input on the same primitive, unexpected solver input, or event listener cleanup failures. Flag silent failure risks.
7. Performance
ResizeObserver usage, Zustand subscription granularity, potential memory leaks in bridge/event listener lifecycle, anything that could cause unnecessary work.
8. Testability
How easily can each layer be unit tested in isolation? Solvers being pure functions should score well — flag anything that is tightly coupled or hard to test without a full DOM/React environment.
9. Dead or Redundant Code
Anything unused, unreachable, or duplicated across the three primitives that could be consolidated.
10. Scalability
What breaks first if a fourth primitive is added, if pointer event volume increases significantly, or if the project grows in team size. Where are the architectural pressure points?

For each lens, score it 1–10 (10 = excellent, 1 = critical issues) and write your findings. Close with an overall score and a one-paragraph summary of the system's general health.


# Here's Prompt 3:

Using your analysis from the previous step, write a markdown file.
Name the file ANALYSIS_REPORT_[DATE].md where [DATE] is today's date in YYYY-MM-DD format.
Structure it exactly as follows:
# Analysis Report — Interaction & Components System

## Overview
[Your one-paragraph system health summary]

## Overall Score: X/10

---

## Findings

### 1. Type Safety — X/10
[Findings]

### 2. State Management — X/10
[Findings]

### 3. Separation of Concerns — X/10
[Findings]

### 4. Naming & Discoverability — X/10
[Findings]

### 5. Consistency Across Primitives — X/10
[Findings]

### 6. Error Handling & Edge Cases — X/10
[Findings]

### 7. Performance — X/10
[Findings]

### 8. Testability — X/10
[Findings]

### 9. Dead or Redundant Code — X/10
[Findings]

### 10. Scalability — X/10
[Findings]
Write findings in clear prose. Be specific — reference actual file names, function names, and type names where relevant. No fix suggestions yet, diagnosis only. 

Save the file to src/analysis/

# Here's Prompt 4:

Using your analysis from the previous step, write a markdown file.
Name the file RECOMMENDATIONS_[DATE].md where [DATE] is today's date in YYYY-MM-DD format.
Structure it as follows:
# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

## High Priority
*High impact, higher effort or risk — plan these carefully*

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

---
For each recommendation, write it as an entry like this:
### [Short title]
**Category:** [Type Safety / State Management / Separation of Concerns / Naming / Consistency / Error Handling / Performance / Testability / Dead Code / Scalability]
**Impact:** High / Medium / Low
**Effort:** High / Medium / Low
**Details:** [Specific description of the issue and what needs to change. Reference actual file names, function names, and type names. Be concrete.]
Rules:
Order entries within each section by impact descending
Be specific — no generic advice, every entry must reference actual code
If multiple small related issues can be fixed in one pass, group them as a single entry
Do not introduce new findings not present in the analysis — this is strictly derived from ANALYSIS_REPORT_[TodaysDATE].md

Save the file to src/analysis/

# Here's Prompt 5:

You have just written RECOMMENDATIONS_[DATE].md where [DATE] is today's date.

Now read the previous RECOMMENDATIONS file (the one with the most recent date 
before today) from src/analysis/. Above each ticket in that file are //comments 
representing the developer's verdict on each ticket. Use these as signal:

- //DONE — issue is resolved, remove from new recommendations if present
- //SKIPPED + reason — conscious decision not to fix, add a note if you keep it
- //NOTE or //HELP — unresolved but has context, preserve that context
- No comment — treat as unresolved

Cross-reference the old file against your new RECOMMENDATIONS_[DATE].md and edit 
it accordingly using your own judgement. If you are unsure whether something is 
resolved, keep it in. Do not remove tickets based on guesswork.

When done, save the updated RECOMMENDATIONS_[DATE].md to src/analysis/.

# Prompt 6 — Cleanup Pass

Read the most recent RECOMMENDATIONS file from src/analysis/.

For each ticket, identify the files it references. Read those files directly.

Your job is cross-referencing. For each ticket:
- If the referenced code clearly and fully resolves the ticket → delete the ticket
- If the code partially addresses it → add //PARTIAL and note exactly what remains unresolved, referencing specific file/line
- If a //SKIPPED or //NOTE ticket has justification visible in the code that confirms the skip → add //DEPRECATED with a one-line note citing the specific code
- If the ticket is unresolved → leave it completely unchanged

Rules:
- Do NOT add new tickets
- Do NOT modify ticket text or recommendations
- Do NOT touch //SKIPPED, //NOTE, or //HELP tags — leave them as-is
- Only act on what is visible in the code, never infer or assume
- When in doubt, leave it unchanged

Save the updated file back to src/analysis/.

# Prompt 7 — Progress Analysis

Read ALL analysis reports from src/analysis/ ordered by date.

Produce a markdown file named PROGRESS_REPORT_[DATE].md saved to src/analysis/.

Structure:
# Progress Report

## Trajectory
One paragraph: is the system improving, plateauing, or regressing? Be honest.

## Score History
| Date | Score | Delta |
|------|-------|-------|
| ...  | ...   | ...   |

## Category Trends
For each of the 10 categories, show the score history and whether it's trending up, flat, or down.

## What's Actually Improving
Specific findings that have been resolved between reports. Reference file names.

## What's Stuck
When assessing "What's Stuck", cross-reference the RECOMMENDATIONS file. 
If a ticket is marked //SKIPPED, do not count it as stuck — 
it is a conscious decision.
Categories or specific findings that have not moved across multiple reports. Be direct about why.

## What's Getting Worse
Any regressions — scores that dropped or new findings that didn't exist in earlier reports.

## Verdict
One honest paragraph. Is the 7/10 ceiling a measurement problem, a complexity ceiling, or unfinished work?