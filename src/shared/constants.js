export const DATASETS = ["Synthetic Cell Atlas", "All Demo Dataset"];
export const FRAME_COUNT = 10;
export const confidenceFor = rank => Math.max(0.52, 0.97 - rank * 0.055);

export const TOOLS = [
  { name: "track_instance_video", desc: "Track a marked instance across every frame.", live: true },
  { name: "critical_view_safety", desc: "Assess Critical View of Safety.", live: false },
  { name: "surgical_tool_detection", desc: "Detect instruments in an image.", live: false },
  { name: "tissue_detection", desc: "Detect tissue types in an image.", live: false },
];

export const QUERY_SUGGESTIONS = [
  { text: "Track the marked instance across this clip", requiresVideo: true },
  { text: "Find similar dissection scenes in the dataset", requiresVideo: false },
  { text: "Summarize the tools used in my last run", requiresVideo: false },
];
