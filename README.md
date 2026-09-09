# Atlassify Inspector Console

Atlassify is a mocked front end for a video annotation and instance tracking tool. It lets you attach a video, mark points on an object to track, run a small bank of analysis tools, and inspect the results Atlassify returns. Nothing in this build calls a real model. Every result is a deterministic mock, useful for testing interaction design before wiring up a backend.

The app is a Vite and React project. `src/concept-a/` and `src/concept-b/` hold each concept's own components and styles. `src/shared/` holds what both concepts use, the color tokens, the SVG scene renderer, the annotation modal, the suggestion list, and the mock data.

## Core features

**Video and picture attachment.** Attach a video to unlock instance tracking, or a picture for similarity search. Each attachment can be swapped or removed at any time.

**Instance annotation.** Click an attached video to open the annotation modal. Mark foreground points on the object you want tracked and background points around it. Atlassify tracks the marked instance across every frame of the mock clip.

**Tool Bank.** Four tools are available: `track_instance_video`, `critical_view_safety`, `surgical_tool_detection`, and `tissue_detection`. `track_instance_video` turns on automatically once you mark at least one point, and you can also switch it on manually as a reminder to attach a video and mark points before sending. The other three toggle independently.

**Dataset selection.** Choose which dataset Atlassify searches, `Synthetic Cell Atlas` or `All Demo Dataset`.

**Result count.** Choose how many ranked results Atlassify returns, from 1 to 10.

**Plain-language queries.** You don't need a video to get a response. Type a question and send it. Queries that ask to track something still need a video attached, since there's nothing to track otherwise.

**Ideas for you.** The empty result area suggests example queries. Click one to fill the query box, or type your own.

**Run history.** Every generated result is kept and browsable, so you can compare a run against earlier ones without losing your place.

## Concept A and Concept B

Concept A and Concept B are two interface designs built on the same underlying features and mock data. A dropdown next to the Reset button in the top bar switches between them. Switching resets whichever concept you're leaving, since each keeps its own independent state.

**Concept A** is a chat-style redesign. A single composer at the top of the left panel holds the query text box, with pill buttons below it for Video, Picture, Dataset, Tools, and Results. Each pill opens a small popover instead of a permanent section, so the controls stay out of the way until you need them. Generated results stream into a feed on the right, newest first, styled as cards rather than a single canvas. Concept A carries a blue accent color for anything active, selected, or interactive, layered over the same neutral base as Concept B.

**Concept B** is the original design. Video, picture, dataset, tools, and results each live in their own collapsible section in a sidebar. The main canvas on the left shows the current result, with a row of past runs in a history rail underneath.

The two concepts share the same color tokens, including the blue accent for anything active or selected, the SVG scene renderer, and the annotation modal. What differs is how the same controls are organized and reached, an accordion sidebar against a composer and popover system, not the underlying capabilities.

## Project layout

```
src/
  main.jsx           mounts Root
  Root.jsx           shared shell, top bar, and the Concept A/B switch
  shared/            tokens, Scene, AnnotationModal, IdeasForYou, mock data
  concept-a/          composer and feed components, scoped styles
  concept-b/          canvas and sidebar components, scoped styles
```

## Running it

```
npm install
npm run dev
```

`npm run build` produces a static build in `dist/`.
