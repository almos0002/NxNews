export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  articleCount?: number;
}

export const authors: Author[] = [
  {
    slug: "elena-vasquez",
    name: "Elena Vasquez",
    role: "World Affairs Correspondent",
    bio: "Elena Vasquez covers global urban policy, climate adaptation, and international development. Based between Berlin and Singapore, she has reported from over 40 countries and previously worked for Le Monde and Reuters. Her long-form investigations have won three international journalism awards.",
    twitter: "@elenavasquez",
    linkedin: "elena-vasquez",
  },
  {
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    role: "Politics Reporter",
    bio: "Yuki Tanaka reports on international governance, AI regulation, and geopolitics. A former policy analyst at the OECD, she brings a rigorous analytical framework to her political coverage. She is based in Tokyo with frequent postings to Brussels and Washington.",
    twitter: "@yukitanaka_dr",
  },
  {
    slug: "priya-sharma",
    name: "Priya Sharma",
    role: "Science Correspondent",
    bio: "Priya Sharma covers space exploration, life sciences, and the intersection of technology and climate. Trained as an aerospace engineer before turning to journalism, she brings technical depth to stories about humanity's biggest scientific ambitions. Based in Mumbai.",
    twitter: "@priyasharma_sci",
    linkedin: "priya-sharma-science",
  },
  {
    slug: "sarah-kim",
    name: "Sarah Kim",
    role: "Business & Finance Reporter",
    bio: "Sarah Kim covers central banking, monetary policy, and capital markets. A graduate of the London School of Economics, she has spent a decade tracking the forces that shape the global financial system. She is based in New York and Hong Kong.",
    twitter: "@sarahkim_biz",
    linkedin: "sarah-kim-finance",
  },
  {
    slug: "raj-mehta",
    name: "Raj Mehta",
    role: "Technology Reporter",
    bio: "Raj Mehta covers artificial intelligence, digital platforms, and the social consequences of emerging technology. He has interviewed founders, regulators, and researchers across four continents. Previously a software engineer, he brings a practitioner's eye to technology journalism.",
    twitter: "@rajmehta_tech",
    linkedin: "raj-mehta-tech",
  },
  {
    slug: "dr-amara-singh",
    name: "Dr. Amara Singh",
    role: "Science Editor",
    bio: "Dr. Amara Singh holds a PhD in epidemiology from Johns Hopkins and leads The Daily Report's science desk. She oversees coverage of global health, biotechnology, and environmental science, and has been recognised by the World Health Organisation for her reporting on emerging infectious disease.",
    twitter: "@dramarasingh",
    linkedin: "amara-singh-phd",
  },
  {
    slug: "marcus-chen",
    name: "Marcus Chen",
    role: "Business Correspondent",
    bio: "Marcus Chen covers the intersection of monetary policy, digital finance, and global trade. He has reported extensively on the rise of central bank digital currencies and the transformation of international payment systems. Based in Singapore.",
    twitter: "@marcuschen_fin",
  },
  {
    slug: "james-okoro",
    name: "James Okoro",
    role: "Politics & World Affairs Correspondent",
    bio: "James Okoro covers resource geopolitics, African development, and international security. He has embedded with UN peacekeeping missions and reported from conflict zones across sub-Saharan Africa and the Middle East. He is a recipient of the Robert Capa Gold Medal.",
    twitter: "@jamesokoro",
    linkedin: "james-okoro-journalist",
  },
  {
    slug: "nina-patel",
    name: "Nina Patel",
    role: "Technology Reporter",
    bio: "Nina Patel covers robotics, automation, and the future of work. Her reporting examines how technological change is reshaping industries, labour markets, and everyday life. She is based in London and holds a master's degree in science journalism from City, University of London.",
    twitter: "@ninapatel_tech",
  },
  {
    slug: "dr-sarah-okonkwo",
    name: "Dr. Sarah Okonkwo",
    role: "Science & Technology Correspondent",
    bio: "Dr. Sarah Okonkwo covers quantum computing, synthetic biology, and the business of biotech. With a background in molecular biology, she brings exceptional scientific literacy to her journalism. Her work has appeared in Nature News and Science magazine.",
    twitter: "@drsarahokonkwo",
    linkedin: "sarah-okonkwo",
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^dr\.\s+/, "dr-")
    .replace(/^prof\.\s+/, "prof-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getAllAuthorSlugs(): string[] {
  return authors.map((a) => a.slug);
}
