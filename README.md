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

## Input, actions, and output

Concept A and Concept B run the same interaction model underneath. Both assume the same three kinds of input, offer the same actions, and generate the same shape of response. Only the surface differs, which the next section covers.

**Input.** A video, which unlocks instance tracking. A picture, for similarity search, not wired to generation. A typed text query, which alone is enough to send.

**Actions.** Attach or detach a video or picture. Click an attached video to mark foreground and background points, defining the instance to track. Toggle any of the four Tool Bank entries. Pick a dataset. Set the result count from 1 to 10. Send, with or without a video attached, as long as there's either a video or query text and the query isn't a tracking request left without a video.

**Output.** Sending produces one run: a set of ranked results with a mock confidence score per rank, a retry count, the list of tools the run used, and the annotation snapshot, foreground and background points per tracked object, rendered on the scene and available as raw JSON behind a disclosure. Runs accumulate, so a query never overwrites the one before it.

## Concept A and Concept B

Concept A and Concept B are two interface designs over that same model. A dropdown next to the Reset button in the top bar switches between them. Switching resets whichever concept you're leaving, since each keeps its own independent state.

**Concept A** is a chat-style design. A single composer at the top of the left panel holds the query text box, with pill buttons below it for Video, Picture, Dataset, Tools, and Results. Each pill opens a small popover instead of a permanent section, so the controls stay out of the way until you need them. Generated results stream into a feed on the right, newest first, styled as cards rather than a single canvas.

**Concept B** is the original design. Video, picture, dataset, tools, and results each live in their own collapsible section in a sidebar. The main canvas on the left shows the current result, with a row of past runs in a history rail underneath.

| | Concept A | Concept B |
|---|---|---|
| Controls | Pills that open a popover on demand | Accordion sections, always in the sidebar |
| Attachments | One video, one picture, replacing the previous one | A gallery per media type, pick among several uploads |
| Result view | A scrolling feed of cards, newest first | One canvas showing the run you're viewing, plus a history rail |
| Tool status | A badge shows whether a tool is on for the next run | A badge also shows whether a tool ran on the run you're viewing |

Both share the same color tokens, including the blue accent for anything active or selected, the SVG scene renderer, and the annotation modal.

**Concept A's case.** The composer reads like a chat input, which needs no explanation for anyone who has used an AI assistant. Controls stay out of the way until called for, so the screen has less chrome at rest. The feed doubles as history, so there's no separate rail to keep in sync with what's on screen.

**Concept A's cost.** Settings sit one click behind a pill, so nothing about the current dataset or tool selection is visible without opening a popover. Only one video and one picture can be attached at a time, so there's no gallery to revisit an earlier upload.

**Concept B's case.** Every section is visible and expandable at once, so a user can see the whole configuration surface without opening anything. The media gallery keeps every upload on hand, not just the latest one. Tool badges reflect the run actually being viewed, not only what's queued for the next one.

**Concept B's cost.** An open sidebar with every section expanded runs long. Configuring and viewing a result live in separate panels, canvas on the left, controls on the right, so the eye moves between them more than it does in Concept A's single composer-and-feed column.

## Project layout

```
src/
  main.jsx              mounts Root
  Root.jsx              shared shell, top bar, and the Concept A/B switch
  shared/
    constants.js        DATASETS, TOOLS, QUERY_SUGGESTIONS, confidenceFor
    geometry.js          offsetFor, the mock per-frame object position
    Scene.jsx            the SVG canvas both concepts render results into
    AnnotationModal.jsx  the point-marking modal opened from an attached video
    IdeasForYou.jsx      the shared empty-state suggestion list
    shared.css           tokens, base reset, and chrome common to both concepts
  concept-a/
    ConceptA.jsx         composer, pills, popovers, and the result feed
    RunCard.jsx          one card in Concept A's feed
    conceptA.css         Concept A's own styles
  concept-b/
    ConceptB.jsx         canvas panel and the accordion sidebar
    MediaGrid.jsx        the video and picture upload gallery
    Section.jsx          one collapsible sidebar section
    conceptB.css         Concept B's own styles
```

## Running it

```
npm install
npm run dev
```

`npm run build` produces a static build in `dist/`.
