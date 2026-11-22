export type ExperimentId = "wave-physics" | "sunset-lab" | "tide-type";

export type Experiment = {
  id: ExperimentId;
  index: string;
  name: string;
  category: string;
  description: string;
  detail: string;
  accent: string;
  tall?: boolean;
};

export const EXPERIMENTS: Experiment[] = [
  {
    id: "wave-physics",
    index: "01",
    name: "F\u00edsica das Ondas",
    category: "Canvas \u00b7 Motion",
    description:
      "Three layers of waves rolling under the wind. Move your pointer through the water and watch the surface bend around you.",
    detail:
      "Each wave is a sine layer drawn on a 2D canvas, with its own speed, amplitude and depth. The wind pushes the crests sideways and the pointer creates a passing swell. No two moments look the same, because the sea never repeats itself. It is a study in soft physics \u2014 motion that feels like water instead of a script.",
    accent: "#0E5A8A",
  },
  {
    id: "sunset-lab",
    index: "02",
    name: "Laborat\u00f3rio do P\u00f4r do Sol",
    category: "Color \u00b7 Gradient",
    description:
      "The SOL & MAR palette, set in motion. Drag the sun down and watch the sky melt from blue into gold, live.",
    detail:
      "Two sliders drive a live sky built only from the official palette. The sun-height control moves the golden hour across the horizon while the warmth control deepens the amber. Copy the CSS it generates and take the sunset with you \u2014 it is a real, usable snippet, not a screenshot.",
    accent: "#FF9F1C",
    tall: true,
  },
  {
    id: "tide-type",
    index: "03",
    name: "Tipo Mar\u00e9",
    category: "Typography \u00b7 Interaction",
    description:
      "Letters that refuse to sit still. The word MAR\u00c9 orbits your cursor \u2014 pull it close, push it away.",
    detail:
      "Every letter is an independent body in a small orbital system, attracted to the pointer and pushed apart by its neighbours. It is typography treated as a physical material: expressive, a little unruly, and different every time you move.",
    accent: "#FFC93C",
  },
];
