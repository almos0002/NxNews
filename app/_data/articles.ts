export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
}

export const categories = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Culture",
  "Opinion",
  "Sports",
];

export const breakingHeadline =
  "Global Climate Summit Reaches Historic Agreement on Carbon Emissions";

export const featuredArticle: Article = {
  id: "1",
  title: "The Architecture of Tomorrow: How Cities Are Redesigning Themselves for a Post-Carbon World",
  excerpt:
    "From Singapore to Copenhagen, a new generation of urban planners is reimagining what cities can be. Their bold experiments are transforming concrete jungles into living ecosystems, challenging every assumption about how we build and inhabit our shared spaces.",
  category: "World",
  author: "Elena Vasquez",
  date: "April 1, 2026",
  readTime: "12 min read",
  imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop",
  featured: true,
};

export const sidebarArticles: Article[] = [
  {
    id: "2",
    title: "Central Banks Weigh Digital Currency Rollout Amid Economic Uncertainty",
    excerpt:
      "Federal Reserve officials signal a cautious approach to implementing a digital dollar as inflation concerns persist.",
    category: "Business",
    author: "Marcus Chen",
    date: "April 1, 2026",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Breakthrough in Quantum Computing Promises New Era of Drug Discovery",
    excerpt:
      "Researchers demonstrate a 1,000-qubit processor capable of simulating complex molecular interactions.",
    category: "Science",
    author: "Dr. Sarah Okonkwo",
    date: "April 1, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    title: "The Rise of Cooperative Housing: Young Europeans Reject Traditional Property Markets",
    excerpt:
      "A growing movement across Berlin, Amsterdam, and Barcelona is challenging the concept of homeownership.",
    category: "Culture",
    author: "Liam Fournier",
    date: "March 31, 2026",
    readTime: "9 min read",
    imageUrl: "https://images.unsplash.com/photo-1523217553620-58f7da13f4ea?w=600&h=400&fit=crop",
  },
];

export const gridArticles: Article[] = [
  {
    id: "5",
    title: "Inside the Battle for Control of the World's Rarest Minerals",
    excerpt:
      "As nations compete for lithium and cobalt, new alliances are reshaping geopolitics in ways not seen since the oil age.",
    category: "Politics",
    author: "James Okoro",
    date: "March 31, 2026",
    readTime: "10 min read",
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop",
  },
  {
    id: "6",
    title: "AI-Generated Music Tops Charts for the First Time, Sparking Industry Debate",
    excerpt:
      "A track produced entirely by artificial intelligence has reached number one, forcing a reckoning over creativity and copyright.",
    category: "Technology",
    author: "Nina Patel",
    date: "March 31, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
  },
  {
    id: "7",
    title: "The Last Fishermen of the Aral Sea Tell Their Story",
    excerpt:
      "A photographic essay documents the lives of those who stayed behind as one of the world's great lakes disappeared.",
    category: "Culture",
    author: "Dmitri Volkov",
    date: "March 30, 2026",
    readTime: "14 min read",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
  },
  {
    id: "8",
    title: "New Study Links Ultra-Processed Foods to Accelerated Cognitive Decline",
    excerpt:
      "Longitudinal research across 12 countries reveals a striking correlation between diet and brain health in adults over 40.",
    category: "Science",
    author: "Dr. Amara Singh",
    date: "March 30, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
  },
];

export const opinionArticles: Article[] = [
  {
    id: "9",
    title: "We Cannot Afford to Ignore the Warning Signs in Southeast Asia",
    excerpt:
      "The geopolitical fault lines emerging in the Pacific demand immediate and sustained diplomatic attention from the West.",
    category: "Opinion",
    author: "Prof. Catherine Moore",
    date: "April 1, 2026",
    readTime: "5 min read",
    imageUrl: "",
  },
  {
    id: "10",
    title: "The Case for Universal Basic Infrastructure Over Universal Basic Income",
    excerpt:
      "Instead of writing checks, governments should invest in the systems that make a dignified life possible for everyone.",
    category: "Opinion",
    author: "Ricardo Mendes",
    date: "March 31, 2026",
    readTime: "7 min read",
    imageUrl: "",
  },
  {
    id: "11",
    title: "Why the Nobel Committee Got It Wrong This Year",
    excerpt:
      "The decision to award the Peace Prize to a sitting head of state undermines the institution's credibility at a critical moment.",
    category: "Opinion",
    author: "Fiona Blackwell",
    date: "March 30, 2026",
    readTime: "4 min read",
    imageUrl: "",
  },
];

export const trendingArticles = [
  { id: "t1", title: "Mars Colony Reports First Successful Harvest", category: "Science", comments: 2847 },
  { id: "t2", title: "Stock Markets Rally After Trade Deal Announcement", category: "Business", comments: 1923 },
  { id: "t3", title: "Olympic Committee Announces Surprising 2036 Host City", category: "Sports", comments: 3201 },
  { id: "t4", title: "Renowned Director's Final Film Premieres to Standing Ovation", category: "Culture", comments: 1456 },
  { id: "t5", title: "Parliament Passes Landmark Data Privacy Legislation", category: "Politics", comments: 2104 },
];
