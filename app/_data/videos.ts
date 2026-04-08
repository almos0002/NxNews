export interface VideoItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  duration: string;
  thumbnailUrl: string;
  featured?: boolean;
}

export const videoItems: VideoItem[] = [
  {
    id: "v1",
    title: "Inside the World's Largest Vertical Farm",
    excerpt: "A rare look inside the Dubai facility growing 12,000 tonnes of food per year without soil or sunlight.",
    category: "Science",
    author: "Priya Sharma",
    date: "April 1, 2026",
    duration: "14:22",
    thumbnailUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=450&fit=crop",
    featured: true,
  },
  {
    id: "v2",
    title: "The Ocean Cleanup: Two Years Later",
    excerpt: "We revisit the ambitious project and ask whether it has lived up to its promises.",
    category: "World",
    author: "Elena Vasquez",
    date: "March 31, 2026",
    duration: "08:47",
    thumbnailUrl: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800&h=450&fit=crop",
  },
  {
    id: "v3",
    title: "How AI Is Writing Tomorrow's Music",
    excerpt: "Composers, musicians and producers debate the rise of machine-generated sound.",
    category: "Culture",
    author: "Marcus Bell",
    date: "March 30, 2026",
    duration: "11:05",
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
  },
  {
    id: "v4",
    title: "One Year Inside a Mars Simulation",
    excerpt: "Four volunteers emerged last week from a yearlong Mars analogue habitat in the Utah desert.",
    category: "Science",
    author: "James Park",
    date: "March 29, 2026",
    duration: "19:38",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
  },
  {
    id: "v5",
    title: "The Last Glaciers: A Climate Emergency",
    excerpt: "Glaciologists warn the world's remaining mountain glaciers could vanish within a generation.",
    category: "World",
    author: "Sarah Kim",
    date: "March 28, 2026",
    duration: "22:14",
    thumbnailUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=450&fit=crop",
  },
  {
    id: "v6",
    title: "Inside Kathmandu's Tech Revolution",
    excerpt: "Young entrepreneurs are turning Nepal's capital into a South Asian startup hub.",
    category: "Technology",
    author: "Rina Tamang",
    date: "March 27, 2026",
    duration: "16:53",
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
  },
  {
    id: "v7",
    title: "Who Really Owns the Internet?",
    excerpt: "A deep dive into the undersea cables, data centres and corporations that hold the web together.",
    category: "Technology",
    author: "Kenji Nakamura",
    date: "March 26, 2026",
    duration: "28:01",
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
  },
  {
    id: "v8",
    title: "The Return of Nuclear: Saviour or Threat?",
    excerpt: "As fossil fuels dwindle, governments across Europe and Asia are betting on a nuclear renaissance.",
    category: "Politics",
    author: "Diana Osei",
    date: "March 25, 2026",
    duration: "31:07",
    thumbnailUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=450&fit=crop",
  },
];
