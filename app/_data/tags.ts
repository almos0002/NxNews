export interface Tag {
  slug: string;
  label: string;
  description: string;
}

export const tags: Tag[] = [
  {
    slug: "artificial-intelligence",
    label: "Artificial Intelligence",
    description: "The latest on machine learning, large language models, AI governance, and the companies shaping the intelligence revolution.",
  },
  {
    slug: "climate-change",
    label: "Climate Change",
    description: "Reporting on global warming, carbon policy, extreme weather, and the race to decarbonise the world economy.",
  },
  {
    slug: "economy",
    label: "Economy",
    description: "Coverage of global markets, central banking, inflation, trade, and the forces shaping economic life around the world.",
  },
  {
    slug: "space",
    label: "Space",
    description: "From lunar missions to commercial space stations — tracking humanity's expanding presence beyond Earth.",
  },
  {
    slug: "health",
    label: "Health",
    description: "Science-backed reporting on public health, medical breakthroughs, epidemics, and the future of medicine.",
  },
  {
    slug: "geopolitics",
    label: "Geopolitics",
    description: "Analysis of power, conflict, diplomacy, and the shifting international order.",
  },
  {
    slug: "energy",
    label: "Energy",
    description: "Nuclear, renewables, oil, and the global energy transition — the stories behind how we power the world.",
  },
  {
    slug: "innovation",
    label: "Innovation",
    description: "Breakthroughs in science, engineering, and technology that are changing what is possible.",
  },
];

export const tagArticleMap: Record<string, string[]> = {
  "artificial-intelligence": ["l3", "f2", "t1", "t2", "t4", "t6", "t7", "t12"],
  "climate-change": ["1", "g5", "ep1", "l7", "t11"],
  "economy": ["f4", "l2", "l6", "b1", "b2", "b3", "b4", "b5", "b6"],
  "space": ["f3", "t9", "tr1"],
  "health": ["l4", "8", "t5", "t13", "ep2"],
  "geopolitics": ["5", "f2", "l1", "l8", "t3", "9"],
  "energy": ["ep4", "t11", "1"],
  "innovation": ["t1", "t2", "t8", "t13", "t14", "t6"],
};

export function getTagBySlug(slug: string): Tag | undefined {
  return tags.find((t) => t.slug === slug);
}
