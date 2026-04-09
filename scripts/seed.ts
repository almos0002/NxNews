import { pool } from "../lib/db";

const ADMIN_EMAIL = "admin@kumarihub.com";
const ADMIN_NAME = "Admin User";

const CATEGORIES = [
  { name_en: "World",         name_ne: "विश्व",        slug: "world"         },
  { name_en: "Politics",      name_ne: "राजनीति",      slug: "politics"      },
  { name_en: "Business",      name_ne: "व्यापार",      slug: "business"      },
  { name_en: "Technology",    name_ne: "प्रविधि",      slug: "technology"    },
  { name_en: "Science",       name_ne: "विज्ञान",      slug: "science"       },
  { name_en: "Culture",       name_ne: "संस्कृति",     slug: "culture"       },
  { name_en: "Sports",        name_ne: "खेलकुद",       slug: "sports"        },
  { name_en: "Entertainment", name_ne: "मनोरञ्जन",     slug: "entertainment" },
  { name_en: "Opinion",       name_ne: "विचार",        slug: "opinion"       },
  { name_en: "Videos",        name_ne: "भिडियो",       slug: "videos"        },
];

const TAGS = [
  { name_en: "Artificial Intelligence", name_ne: "कृत्रिम बुद्धिमत्ता", slug: "artificial-intelligence" },
  { name_en: "Climate Change", name_ne: "जलवायु परिवर्तन", slug: "climate-change" },
  { name_en: "Economy", name_ne: "अर्थतन्त्र", slug: "economy" },
  { name_en: "Space", name_ne: "अन्तरिक्ष", slug: "space" },
  { name_en: "Health", name_ne: "स्वास्थ्य", slug: "health" },
  { name_en: "Geopolitics", name_ne: "भूराजनीति", slug: "geopolitics" },
  { name_en: "Energy", name_ne: "ऊर्जा", slug: "energy" },
  { name_en: "Innovation", name_ne: "नवप्रवर्तन", slug: "innovation" },
  { name_en: "Nepal", name_ne: "नेपाल", slug: "nepal" },
  { name_en: "Education", name_ne: "शिक्षा", slug: "education" },
];

type ArticleSeed = {
  title_en: string;
  title_ne: string;
  slug: string;
  excerpt_en: string;
  excerpt_ne: string;
  content_en: string;
  content_ne: string;
  category: string;
  tags: string[];
  featured_image: string;
};

const ARTICLES: ArticleSeed[] = [
  {
    title_en: "The Architecture of Tomorrow: How Cities Are Redesigning Themselves for a Post-Carbon World",
    title_ne: "भोलिको वास्तुकला: शहरहरूले कसरी आफूलाई पुनः डिजाइन गर्दैछन्",
    slug: "architecture-of-tomorrow-post-carbon-cities",
    excerpt_en: "From Singapore to Copenhagen, a new generation of urban planners is reimagining what cities can be — transforming concrete jungles into living ecosystems.",
    excerpt_ne: "सिंगापुरदेखि कोपेनहेगनसम्म, शहरी योजनाकारहरूको नयाँ पुस्ताले शहरहरूलाई पुनः कल्पना गर्दैछ।",
    content_en: `<p>Across the globe, the convergence of climate pressures, shifting demographics, and technological disruption is forcing governments and civil societies to rethink longstanding assumptions about what a city should be.</p>
<p>What once seemed like distant policy debates have become immediate questions of survival and adaptation. Urban centres that produce 70 percent of global carbon emissions are now also home to the most ambitious experiments in sustainable design.</p>
<p>In Singapore, the government's "City in a Garden" initiative has evolved into something far more radical: a city that generates more biodiversity than it displaces. Solar panels cover every public building. Vertical farms supply a quarter of the city's leafy vegetables. Rainwater harvesting systems have cut municipal water demand by a third.</p>
<p>Copenhagen, meanwhile, has achieved something its planners once considered impossible: a city centre largely free of private cars. Bicycle lanes outnumber car lanes. The harbour, once too polluted to swim in, is now home to five public swimming areas.</p>
<p>Experts who have tracked these trends for decades say the speed of change is unprecedented. "We are compressing what should be a century of transition into a single generation," said one senior policy researcher. "That creates enormous stress on institutions that were not designed for this pace."</p>
<p>Still, there are reasons to believe that adaptation is possible. The decisions made over the next five to ten years will constrain — or expand — the possibilities available to future generations.</p>`,
    content_ne: `<p>विश्वभर जलवायु दबाब, जनसांख्यिकीय परिवर्तन, र प्रविधिगत व्यवधानको समागमले सरकारहरू र नागरिक समाजहरूलाई शहर कस्तो हुनुपर्छ भन्ने दीर्घकालीन मान्यताहरू पुनर्विचार गर्न बाध्य बनाउँदैछ।</p>
<p>एकसमय टाढाको नीतिगत बहस जस्तो लाग्ने कुरा अब अस्तित्व र अनुकूलनको तत्काल प्रश्न बनिसकेको छ।</p>
<p>सिंगापुरमा, सरकारको "बगैंचामा शहर" पहल अझ बढी क्रान्तिकारी चीजमा परिणत भएको छ। सौर्य प्यानलहरूले हर सार्वजनिक भवन ढाकेका छन्। ठाडो खेतहरूले शहरको पातदार तरकारीको एक चौथाइ आपूर्ति गर्छन्।</p>`,
    category: "World",
    tags: ["climate-change", "innovation"],
    featured_image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop",
  },
  {
    title_en: "Inside the G20's Emergency Session on AI Governance",
    title_ne: "G20 को एआई शासन सम्बन्धी आपतकालीन सत्रको भित्री कथा",
    slug: "g20-emergency-session-ai-governance",
    excerpt_en: "World leaders convene for an unprecedented summit on regulating frontier AI systems before they outpace human oversight.",
    excerpt_ne: "विश्व नेताहरूले सिमावर्ती एआई प्रणालीहरू नियन्त्रण गर्न अभूतपूर्व शिखर सम्मेलन बोलाउँछन्।",
    content_en: `<p>The political calculus behind this development has been building for years, driven by a confluence of electoral pressures, institutional fatigue, and a media environment that rewards confrontation over compromise.</p>
<p>When heads of state gathered in Geneva last week for what has been called the most consequential AI policy summit in history, the mood in the negotiating chambers was described by participants as simultaneously urgent and paralysed.</p>
<p>"Everyone agrees something must be done," said one senior European diplomat who spoke on condition of anonymity. "The disagreement is about who does it, how fast, and who bears the cost."</p>
<p>The central tension running through the talks is familiar to anyone who has followed international technology governance: the pace of AI development is outrunning the pace of regulation. Systems that can generate convincing disinformation, autonomously make financial decisions, and increasingly perform complex cognitive tasks have reached commercial deployment before any international framework exists to govern them.</p>
<p>The G20 communiqué, if one emerges, is expected to be heavy on principle and light on mechanism. Critics say that is insufficient. Advocates say it is the best that can be achieved in the current geopolitical environment.</p>`,
    content_ne: `<p>यस विकासको पछाडिको राजनीतिक गणना वर्षौंदेखि निर्माण भइरहेको छ, चुनावी दबाब, संस्थागत थकान र सम्झौताभन्दा टकरावलाई पुरस्कृत गर्ने मिडिया वातावरणको समागमले प्रेरित।</p>
<p>जब राष्ट्र प्रमुखहरू पछिल्लो हप्ता जेनेभामा एकत्रित भए, वार्ता कक्षमा मनोदशा एकैसाथ जरुरी र लकवाग्रस्त बताइएको थियो।</p>`,
    category: "Politics",
    tags: ["artificial-intelligence", "geopolitics"],
    featured_image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
  },
  {
    title_en: "The New Space Race Is Happening Right Now — and It's Private",
    title_ne: "नयाँ अन्तरिक्ष दौड अहिले भइरहेको छ — र यो निजी हो",
    slug: "new-space-race-private-companies-2026",
    excerpt_en: "Four companies are racing to put a permanent habitat in lunar orbit before 2027, with implications for science, commerce, and geopolitics.",
    excerpt_ne: "चार कम्पनीहरू २०२७ भन्दा पहिले चन्द्रमाको कक्षामा स्थायी आवास राख्न दौडिरहेका छन्।",
    content_en: `<p>The findings represent years of painstaking research conducted by teams spanning multiple institutions and continents. The commercial space sector has raised more capital in the past three years than in the previous two decades combined.</p>
<p>SpaceX's Starship program, after a series of high-profile test failures, achieved its seventh consecutive successful orbital flight last month. Blue Origin's New Glenn rocket has completed fourteen consecutive successful launches. Rocket Lab is deploying satellites at a rate that would have seemed impossible five years ago.</p>
<p>But the ambitions extend far beyond satellite deployment. Four separate organisations — SpaceX, Blue Origin, a consortium of Japanese and European companies, and a Chinese state-backed enterprise — are in an active race to place the first crewed lunar surface mission since Apollo 17 in 1972.</p>
<p>"We are not rerunning the sixties," said one NASA official. "The economics are completely different. The technology is completely different. The geopolitical context is completely different. The only thing that is the same is the destination."</p>
<p>The practical implications are significant, though the timeline for real-world application remains uncertain. Translating a scientific or commercial breakthrough into a sustainable presence in space is rarely straightforward.</p>`,
    content_ne: `<p>यी निष्कर्षहरू एकाधिक संस्थाहरू र महाद्वीपहरूमा फैलिएका टोलीहरूद्वारा सञ्चालित वर्षौंको कठिन अनुसन्धानको प्रतिनिधित्व गर्छन्।</p>
<p>स्पेसएक्सको स्टारशिप कार्यक्रमले पछिल्लो महिना आफ्नो सातौं लगातार सफल कक्षीय उडान पूरा ग¥यो।</p>`,
    category: "Science",
    tags: ["space", "innovation"],
    featured_image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
  },
  {
    title_en: "Fed Holds Rates Steady, Signals Two Cuts Possible in Second Half of 2026",
    title_ne: "फेडले ब्याजदर स्थिर राख्यो, २०२६ को दोस्रो अर्धमा दुई कटौतीको संकेत",
    slug: "fed-holds-rates-signals-two-cuts-2026",
    excerpt_en: "The central bank held borrowing costs flat as it awaits clearer inflation data, while hinting at possible easing later in the year.",
    excerpt_ne: "केन्द्रीय बैंकले स्पष्ट मुद्रास्फीति डेटाको प्रतीक्षा गर्दै ऋण लागत स्थिर राख्यो।",
    content_en: `<p>The economic forces at play here reflect a longer restructuring that has been reshaping industries, labour markets, and capital flows for more than a decade. The Federal Reserve's decision to hold its benchmark interest rate at 4.25-4.50 percent came as little surprise to markets.</p>
<p>What drew more attention was the revised dot plot, which showed a narrower consensus among policymakers than in previous meetings. Six of the eighteen committee members now project only one cut by year-end, while four project no cuts at all.</p>
<p>Federal Reserve Chair Jerome Powell, in his post-meeting press conference, emphasised that the committee was "not in a hurry" to adjust policy. "We want to see more progress on inflation before we take further action," he said. "The labour market remains strong. Consumer spending continues to support growth."</p>
<p>Corporate strategists have responded with a mixture of aggressive repositioning and cautious hedging. Consumer behaviour has shifted in ways that confound traditional models.</p>
<p>The challenge for businesses is to make long-term strategic decisions in an environment where the medium-term outlook is genuinely unclear.</p>`,
    content_ne: `<p>यहाँ काम गर्ने आर्थिक शक्तिहरूले एक दशकभन्दा बढी समयदेखि उद्योगहरू, श्रम बजारहरू र पूँजी प्रवाहलाई पुनर्आकार दिँदै आइरहेको दीर्घकालीन पुनर्संरचनालाई प्रतिबिम्बित गर्छन्।</p>`,
    category: "Business",
    tags: ["economy"],
    featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
  },
  {
    title_en: "Nepal's Startups Are Quietly Disrupting South Asian Finance",
    title_ne: "नेपालका स्टार्टअपहरूले दक्षिण एसियाली वित्तलाई चुपचाप बाधा पु¥याउँदैछन्",
    slug: "nepal-startups-disrupting-south-asian-finance",
    excerpt_en: "A wave of fintech companies born in Kathmandu is quietly reshaping how hundreds of millions of people in South Asia save, borrow, and pay.",
    excerpt_ne: "काठमाडौंमा जन्मिएको फिनटेक कम्पनीहरूको लहरले दक्षिण एसियामा करोडौं मानिसहरूले कसरी बचत गर्छन् भन्ने पुनः आकार दिइरहेको छ।",
    content_en: `<p>The technology sector continues to evolve at a pace that outstrips the capacity of regulatory frameworks to keep up. Nowhere is this more apparent than in Nepal, where a generation of fintech founders is building systems that serve populations traditional banking has never reached.</p>
<p>Esewa, Khalti, and a dozen newer entrants have collectively processed more than $4 billion in transactions this year. Remittance flows — Nepal receives one of the highest levels of remittances relative to GDP of any country in the world — are increasingly being processed through digital rails rather than legacy banking channels.</p>
<p>"The unbanked population is not unbanked because they don't want financial services," said the CEO of one Kathmandu-based fintech. "They're unbanked because the services that existed weren't designed for them."</p>
<p>The workforce implications are already being felt. Certain categories of knowledge work are being transformed more rapidly than economists had projected.</p>`,
    content_ne: `<p>प्रविधि क्षेत्र नियामक ढाँचाहरूको क्षमताभन्दा बढी गतिमा विकसित भइरहेको छ। नेपालमा फिनटेक संस्थापकहरूको एक पुस्ताले परम्परागत बैंकिङले कहिल्यै नपुगेका जनसंख्याहरूको सेवा गर्ने प्रणाली निर्माण गरिरहेको छ।</p>`,
    category: "Technology",
    tags: ["nepal", "innovation", "economy"],
    featured_image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Last Glaciers: Scientists Warn of Irreversible Loss Within Decades",
    title_ne: "अन्तिम हिमनदहरू: वैज्ञानिकहरूले दशकहरूभित्र अपरिवर्तनीय नोक्सानको चेतावनी दिन्छन्",
    slug: "last-glaciers-scientists-warn-irreversible-loss",
    excerpt_en: "New research confirms that more than 60 percent of the world's remaining mountain glaciers are committed to melting regardless of future emissions.",
    excerpt_ne: "नयाँ अनुसन्धानले पुष्टि गर्छ कि विश्वका बाँकी पहाडी हिमनदहरूको ६० प्रतिशत भन्दा बढी भविष्यको उत्सर्जनलाई ध्यान नगरी पग्लन प्रतिबद्ध छन्।",
    content_en: `<p>The findings represent years of painstaking research conducted by teams spanning multiple institutions and continents. The methodology has been subject to rigorous peer review, and independent researchers have confirmed the core results.</p>
<p>"This changes the way we understand the fundamental mechanism," said one of the principal investigators from the Swiss Federal Institute of Technology. "We will need to revise models that have been in use for decades."</p>
<p>The study, published simultaneously in Science and Nature Climate Change, analysed satellite data, ice core samples, and direct field measurements from 4,500 glaciers across six mountain ranges. Its conclusion — that a "committed" trajectory of ice loss is already locked in — is the most definitive statement yet from the scientific community about the irreversibility of some climate impacts.</p>
<p>For the Himalayan region, the implications are particularly acute. The glaciers of the Hindu Kush Himalaya supply freshwater to 240 million people directly and influence the monsoon patterns that support 1.9 billion more.</p>
<p>Funding constraints remain a persistent challenge for basic research. Younger researchers entering the field describe a landscape that is both exhilarating and precarious.</p>`,
    content_ne: `<p>यी निष्कर्षहरूले एकाधिक संस्थाहरू र महाद्वीपहरूमा फैलिएका टोलीहरूद्वारा सञ्चालित वर्षौंको कठिन अनुसन्धानको प्रतिनिधित्व गर्छन्।</p>
<p>हिन्दु कुश हिमालयको हिमनदहरूले सीधा २४ करोड मानिसलाई ताजा पानी आपूर्ति गर्छन्।</p>`,
    category: "Science",
    tags: ["climate-change", "energy"],
    featured_image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop",
  },
  {
    title_en: "How AI Is Rewriting the Rules of Music Production",
    title_ne: "एआईले संगीत उत्पादनका नियमहरू कसरी पुनर्लेखन गर्दैछ",
    slug: "ai-rewriting-rules-music-production",
    excerpt_en: "Composers, musicians and producers describe a field undergoing its most fundamental transformation since the invention of multitrack recording.",
    excerpt_ne: "संगीतकारहरू, संगीतज्ञहरू र निर्माताहरूले बहुट्र्याक रेकर्डिङको आविष्कारपछिको सबैभन्दा आधारभूत परिवर्तनको वर्णन गर्छन्।",
    content_en: `<p>The work arrives at a moment of cultural ferment, when questions of representation, authenticity, and the relationship between art and commerce feel newly urgent.</p>
<p>At Abbey Road Studios last month, producer Tom Ellis demonstrated a workflow that would have been unimaginable three years ago. Starting from a melody hummed into a microphone and a brief text description of the desired emotional arc, an AI system produced a fully orchestrated demo track in eleven minutes.</p>
<p>"Critics who attended early viewings describe it as a work that refuses easy categorisation," said one music industry veteran. "Formally adventurous, emotionally demanding, and deliberately resistant to frictionless consumption."</p>
<p>The commercial implications are already reshaping the industry. Streaming platforms have begun deploying AI-generated background music as a low-cost alternative to licensed tracks. Some libraries now offer AI-generated compositions at a fraction of the price of traditional music licensing.</p>
<p>The cultural conversation around the work has itself become part of the work's meaning. What endures, if anything endures, is not for any of us to determine right now.</p>`,
    content_ne: `<p>यो काम सांस्कृतिक किण्वनको एक क्षणमा आउँछ, जब प्रतिनिधित्व, प्रामाणिकता र कला र वाणिज्यबीचको सम्बन्धका प्रश्नहरू नयाँ रूपले जरुरी महसुस हुन्छन्।</p>`,
    category: "Culture",
    tags: ["artificial-intelligence", "innovation"],
    featured_image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Quiet Revolution in Global Health: How mRNA Technology Is Redefining Medicine",
    title_ne: "वैश्विक स्वास्थ्यमा शान्त क्रान्ति: mRNA प्रविधिले चिकित्साको पुनः परिभाषा",
    slug: "mrna-technology-redefining-global-medicine",
    excerpt_en: "Five years after its Covid-19 debut, mRNA vaccine technology is delivering on promises that once seemed like science fiction.",
    excerpt_ne: "कोभिड-१९ मा आफ्नो पहिलो उपस्थितिको पाँच वर्षपछि, mRNA भ्याक्सिन प्रविधिले विज्ञान कथा जस्तो लागेका प्रतिज्ञाहरू पूरा गर्दैछ।",
    content_en: `<p>The findings represent years of painstaking research. Five years ago, mRNA vaccines were an experimental technology that had never been successfully deployed in humans. Today, they are on the threshold of transforming the treatment of cancer, HIV, influenza, and a range of rare genetic diseases.</p>
<p>The pipeline is striking in its breadth. Moderna has twenty-one mRNA candidates in clinical trials, spanning cancer vaccines, a combined flu and Covid shot, and treatments for rare metabolic disorders. BioNTech, Pfizer's partner, is advancing its own personalised cancer vaccine. CureVac, Arcturus, and a constellation of smaller biotech firms are pursuing their own programmes.</p>
<p>Funding constraints remain a persistent challenge for basic research. While governments and private philanthropists have increased their contributions in recent years, the gap between scientific ambition and available resources remains wide.</p>
<p>Younger researchers entering the field describe a landscape that is both exhilarating and precarious. Competition for grants and positions is intense, and the path from laboratory breakthrough to clinical deployment is long and often failure-prone.</p>`,
    content_ne: `<p>पाँच वर्ष पहिले, mRNA भ्याक्सिनहरू एउटा प्रयोगात्मक प्रविधि थियो जुन कहिल्यै मानव शरीरमा सफलतापूर्वक प्रयोग भएको थिएन। आज, तिनीहरू क्यान्सर, HIV, र दुर्लभ आनुवंशिक रोगहरूको उपचार रूपान्तरण गर्ने दहलिजमा छन्।</p>`,
    category: "Science",
    tags: ["health", "innovation"],
    featured_image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Return of Industrial Policy: How Western Governments Are Betting on Manufacturing",
    title_ne: "औद्योगिक नीतिको फिर्ता: पश्चिमी सरकारहरूले उत्पादन क्षेत्रमा कसरी दाँव लगाउँदैछन्",
    slug: "return-industrial-policy-western-manufacturing",
    excerpt_en: "After decades of deindustrialisation, governments on both sides of the Atlantic are reversing course with massive investment programmes.",
    excerpt_ne: "औद्योगिकीकरण हटाउनेको दशकहरूपछि, अटलान्टिकका दुवैतर्फका सरकारहरूले ठूला लगानी कार्यक्रमहरूसँग दिशा परिवर्तन गर्दैछन्।",
    content_en: `<p>Supply chain vulnerabilities, exposed dramatically during the pandemic, remain only partially addressed. The political calculus behind this development has been building for years, driven by geopolitical competition with China and the domestic political imperative to restore manufacturing jobs.</p>
<p>The United States' CHIPS Act, the European Chips Act, and the UK's Industrial Strategy represent the most significant peacetime intervention in industrial economies since the Marshall Plan. Together, they commit more than $400 billion in public subsidies to semiconductors, clean energy, and advanced manufacturing.</p>
<p>The results are beginning to materialise. Since the CHIPS Act passed in 2022, more than $200 billion in private semiconductor investment has been announced in the United States. New fabs are under construction in Ohio, Arizona, and Texas.</p>
<p>Consumer behaviour has shifted in ways that confound traditional models. Spending patterns, savings rates, and debt tolerance all look different from pre-pandemic baselines. For businesses, the challenge is to make long-term strategic decisions in an environment where the medium-term outlook is genuinely unclear.</p>`,
    content_ne: `<p>महामारीको समयमा नाटकीय रूपमा उजागर भएका आपूर्ति श्रृंखला कमजोरीहरू अझै आंशिक रूपमा मात्र सम्बोधन गरिएका छन्।</p>`,
    category: "Business",
    tags: ["economy", "geopolitics"],
    featured_image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=600&fit=crop",
  },
  {
    title_en: "Inside Kathmandu's Thriving Contemporary Art Scene",
    title_ne: "काठमाडौंको फलिरहेको समकालीन कला दृश्यको भित्री कथा",
    slug: "kathmandu-contemporary-art-scene-2026",
    excerpt_en: "A new generation of Nepali artists is drawing on ancient traditions while engaging with the most pressing questions of the present.",
    excerpt_ne: "नेपाली कलाकारहरूको नयाँ पुस्ता प्राचीन परम्पराहरूबाट आकर्षण लिँदै वर्तमानका सबैभन्दा जरुरी प्रश्नहरूसँग संलग्न छन्।",
    content_en: `<p>The work arrives at a moment of cultural ferment. Across Kathmandu's Patan, Bhaktapur, and Thamel districts, a constellation of galleries, artist-run spaces, and collective studios has emerged that is drawing international attention.</p>
<p>"I was not interested in making something comfortable," said Pratima Gurung, whose work was recently acquired by the Guggenheim Bilbao. "Comfort is the enemy of encounter."</p>
<p>The artists working here draw on a tradition that is among the oldest continuous artistic lineages in Asia: the Newar metalworking and thangka painting schools that have operated in the Kathmandu Valley for more than fifteen centuries. But they are also engaging with migration, climate change, gender, and the consequences of a decade of political transformation.</p>
<p>The cultural conversation around the work has itself become part of the work's meaning. Online discussions have excavated references and debated interpretations with an intensity that suggests the work is touching something real.</p>
<p>Commercial considerations inevitably shape what gets made and what gets distributed. The economics of cultural production have shifted dramatically in the age of digital distribution.</p>`,
    content_ne: `<p>पाटन, भक्तपुर र ठमेल जिल्लाहरूमा, ग्यालेरीहरू, कलाकार-संचालित स्थानहरू र सामूहिक स्टुडियोहरूको एक नक्षत्र उभरेको छ जसले अन्तर्राष्ट्रिय ध्यान आकर्षित गर्दैछ।</p>`,
    category: "Culture",
    tags: ["nepal"],
    featured_image: "https://images.unsplash.com/photo-1583599838566-1e2d6f0b46a6?w=800&h=600&fit=crop",
  },
  {
    title_en: "Why Democracy Is Harder to Kill Than Its Critics Think",
    title_ne: "प्रजातन्त्र किन यसका आलोचकहरूले सोचेभन्दा बढी कठोर छ",
    slug: "democracy-harder-to-kill-than-critics-think",
    excerpt_en: "A new body of comparative research challenges the narrative of democratic backsliding, finding resilience in unexpected places.",
    excerpt_ne: "तुलनात्मक अनुसन्धानको नयाँ निकायले प्रजातान्त्रिक पछाडि हट्ने कथालाई चुनौती दिन्छ।",
    content_en: `<p>The argument being advanced here is not new, but its urgency is. For much of the past decade, the dominant narrative in political science has been one of democratic recession: the steady erosion of free elections, civil liberties, and the rule of law across an expanding range of countries.</p>
<p>A new body of scholarship, drawing on a broader range of evidence, is challenging that narrative — not by denying the pressures on democracy, but by pointing to sources of resilience that the standard accounts have underweighted.</p>
<p>"The conventional story focuses on leaders and institutions," said Professor Maria Costa at the London School of Economics. "But democracy is also a set of norms, expectations, and habits that exist in civil society, in journalism, in business, and in everyday life. Those are harder to dismantle than a constitution."</p>
<p>The question is not whether we understand the stakes. We do. The question is whether that understanding is sufficient to produce the will, the coordination, and the sacrifice that the situation demands.</p>
<p>I am not, by temperament, a pessimist. But I am also not willing to pretend that the situation is less serious than it is.</p>`,
    content_ne: `<p>यहाँ प्रस्तुत तर्क नयाँ छैन, तर यसको जरुरियत छ। पछिल्लो एक दशकको अधिकांश भागमा, राजनीतिशास्त्रमा प्रभावशाली कथा प्रजातान्त्रिक मन्दीको रही आएको छ।</p>`,
    category: "Opinion",
    tags: ["geopolitics"],
    featured_image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Champions League Final That Will Define a Generation",
    title_ne: "च्याम्पियन्स लिग फाइनल जसले एउटा पुस्तालाई परिभाषित गर्नेछ",
    slug: "champions-league-final-define-generation",
    excerpt_en: "Saturday's match in Munich brings together two clubs, two cities, and two footballing philosophies that have shaped the game for three decades.",
    excerpt_ne: "म्युनिखमा शनिबारको खेलले दुई क्लब, दुई शहर र तीस वर्षदेखि खेलको आकार दिने दुई फुटबल दर्शनहरू एकसाथ ल्याउँछ।",
    content_en: `<p>The performance confirmed what those close to the preparation had long suspected: that a combination of tactical innovation and individual brilliance had produced something genuinely unusual.</p>
<p>When Real Madrid and Manchester City take to the Allianz Arena pitch on Saturday evening, they will bring with them a combined total of twenty-two Champions League titles, seven of them won in the last decade. They also bring with them an extraordinary concentration of footballing talent: between the two squads, there are nine of the top twenty players in the world by most ratings systems.</p>
<p>Opponents and analysts who have studied the footage closely describe a coherence that is rare at this level. "You can see it in the small details," said one experienced observer. "The decisions being made in fractions of a second, consistently, under pressure. That's not accidental."</p>
<p>The broader context matters too. The institutional investment that made this possible did not arrive overnight. Years of infrastructure development, talent identification, and coaching education preceded this moment.</p>
<p>Whatever comes next, this chapter will be worth remembering. The stakes, as many observers note, could scarcely be higher.</p>`,
    content_ne: `<p>शनिबार साँझ रियल माड्रिड र म्यान्चेस्टर सिटी अलियान्ज एरेना पिचमा ओर्लंदा, तिनीहरू सम्मिलित रूपमा बाइस च्याम्पियन्स लिग उपाधिहरू लिएर आउनेछन्।</p>`,
    category: "Sports",
    tags: [],
    featured_image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
  },
  {
    title_en: "Quantum Computing Reaches a Commercial Tipping Point",
    title_ne: "क्वान्टम कम्प्युटिङले व्यावसायिक टिपिंग पोइन्ट गाठ्यो",
    slug: "quantum-computing-commercial-tipping-point",
    excerpt_en: "IBM's announcement of a 10,000-qubit processor has set off a scramble among banks, drug companies, and logistics firms to prepare for the quantum era.",
    excerpt_ne: "IBM को १०,००० क्युबिट प्रोसेसरको घोषणाले बैंक, ड्रग कम्पनीहरू र लजिस्टिक फर्महरूमा क्वान्टम युगको लागि तयारी गर्न हल्लाखल्ला ल्यायो।",
    content_en: `<p>The technology sector continues to evolve at a pace that outstrips the capacity of regulatory frameworks to keep up. IBM's announcement of a 10,000-qubit quantum processor — a tenfold increase over its previous generation — represents the most significant milestone in commercial quantum computing since the field emerged from academic research.</p>
<p>Engineers and ethicists inside major technology companies describe a culture in which competitive pressure often overrides caution. "There is always someone willing to move faster," said one senior researcher at a competing firm who asked not to be named.</p>
<p>The gap between what these systems can do and what the public understands about them remains vast. Surveys consistently show that most people significantly underestimate both the capabilities and the limitations of quantum computing.</p>
<p>Governments are beginning to engage more seriously. Legislative proposals have been introduced in multiple jurisdictions, though the speed of technological change makes it genuinely difficult to write rules that will remain relevant.</p>`,
    content_ne: `<p>IBM को १०,०००-क्युबिट क्वान्टम प्रोसेसरको घोषणाले व्यावसायिक क्वान्टम कम्प्युटिङमा सबैभन्दा महत्त्वपूर्ण माइलस्टोनको प्रतिनिधित्व गर्छ।</p>`,
    category: "Technology",
    tags: ["artificial-intelligence", "innovation"],
    featured_image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop",
  },
  {
    title_en: "Nepal Passes Landmark Clean Energy Act Targeting 15 GW by 2035",
    title_ne: "नेपालले २०३५ सम्म १५ GW लक्ष्य राखेको ऐतिहासिक स्वच्छ ऊर्जा ऐन पास ग¥यो",
    slug: "nepal-clean-energy-act-15gw-2035",
    excerpt_en: "Parliament has unanimously passed legislation that could transform Nepal from one of the world's most energy-poor nations to a major exporter.",
    excerpt_ne: "संसदले सर्वसम्मतिले कानून पारित ग¥यो जसले नेपाललाई विश्वका सबैभन्दा ऊर्जा-गरिब राष्ट्रहरूमध्ये एकबाट प्रमुख निर्यातकमा रूपान्तरण गर्न सक्छ।",
    content_en: `<p>The political calculus behind this development has been building for years. Nepal's parliament voted unanimously last week to pass the Clean Energy Development Act, a sweeping piece of legislation that sets binding targets for hydropower and solar development, streamlines the permitting process for foreign investment, and establishes a sovereign energy fund.</p>
<p>Behind closed doors, lawmakers from across party lines acknowledge that the legislation represents a rare moment of consensus in a parliament that has been marked by instability. The bill passed with 213 votes in favour and none against.</p>
<p>"We are sitting on one of the world's greatest natural endowments," said Energy Minister Shakti Basnet. "The question is no longer whether Nepal can develop its hydropower potential. The question is how quickly we can bring it to market."</p>
<p>Nepal has an estimated 83,000 megawatts of technically feasible hydropower potential, of which only about 2,200 megawatts have been developed. The new law is designed to accelerate that development by cutting permitting timelines from an average of eleven years to a target of three.</p>`,
    content_ne: `<p>नेपालको संसदले पछिल्लो हप्ता सर्वसम्मतिले स्वच्छ ऊर्जा विकास ऐन पारित ग¥यो, जसले जलविद्युत् र सौर्य विकासका लागि बाध्यकारी लक्ष्यहरू तोक्छ।</p>`,
    category: "Politics",
    tags: ["nepal", "energy", "climate-change"],
    featured_image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
  },
  {
    title_en: "How Netflix Is Betting $3 Billion on South Asian Content",
    title_ne: "नेटफ्लिक्सले कसरी दक्षिण एसियाली सामग्रीमा $३ अर्ब लगाइरहेको छ",
    slug: "netflix-3-billion-south-asian-content-bet",
    excerpt_en: "The streaming giant is doubling down on Hindi, Tamil, and Nepali productions as global subscriber growth slows.",
    excerpt_ne: "स्ट्रिमिङ दिग्गजले वैश्विक ग्राहक वृद्धि सुस्त हुँदा हिन्दी, तमिल र नेपाली उत्पादनहरूमा दोब्बर दाँव लगाउँदैछ।",
    content_en: `<p>The work arrives at a moment of cultural ferment. When Netflix's content chief announced the $3 billion South Asian investment programme at the Mumbai Content Summit last month, the immediate reaction from the industry was a mixture of excitement and scepticism.</p>
<p>The excitement was understandable. Netflix's South Asian subscriber base has grown from 12 million in 2020 to more than 65 million today. Hindi-language originals have proven that regional content can travel globally.</p>
<p>The scepticism was also understandable. Previous announcements of major investment in regional content have not always translated into the promised number or quality of productions. The gap between announced spend and actual output has been a persistent frustration for local creative communities.</p>
<p>What is different this time, according to people close to the negotiations, is the structure of the investment. Rather than commissioning individual shows, Netflix is establishing long-term production partnerships with studios in Mumbai, Chennai, and Kathmandu.</p>`,
    content_ne: `<p>नेटफ्लिक्सको दक्षिण एसियाली सामग्री प्रमुखले मुम्बई सामग्री शिखर सम्मेलनमा $३ अर्ब दक्षिण एसियाली लगानी कार्यक्रम घोषणा गर्दा, उद्योगबाट तत्काल प्रतिक्रिया उत्साह र शंकाको मिश्रण थियो।</p>`,
    category: "Entertainment",
    tags: ["nepal"],
    featured_image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Hidden Cost of AI Data Centres: Water, Power, and Local Communities",
    title_ne: "एआई डेटा केन्द्रहरूको लुकेको लागत: पानी, बिजुली र स्थानीय समुदायहरू",
    slug: "hidden-cost-ai-data-centres-water-power",
    excerpt_en: "As tech giants race to build AI infrastructure, the communities living near their data centres are counting the environmental and social costs.",
    excerpt_ne: "टेक दिग्गजहरू एआई पूर्वाधार निर्माण गर्न दौडिरहेका छन्, तर तिनीहरूका डेटा केन्द्रहरू नजिक बस्ने समुदायहरूले वातावरणीय र सामाजिक लागत गणना गर्दैछन्।",
    content_en: `<p>The technology sector continues to evolve at a pace that outstrips the capacity of regulatory frameworks. The infrastructure underpinning the AI revolution is massive, energy-hungry, and deeply dependent on water — a fact that is beginning to generate significant pushback from communities hosting the data centres that power it.</p>
<p>A single large AI training run can consume as much electricity as 100 US households use in a year. The water used to cool the servers — through evaporative cooling towers — can amount to millions of gallons per day at a large facility.</p>
<p>In Mesa, Arizona, a coalition of residents and environmental groups is challenging Google's application for permits to expand its data centre campus. The core objection is water: the facility sits in one of the most water-stressed regions of the United States.</p>
<p>Governments are beginning to engage more seriously. Legislative proposals have been introduced in multiple jurisdictions, though the speed of technological change makes it genuinely difficult to write rules that will remain relevant.</p>`,
    content_ne: `<p>एआई क्रान्तिको आधारभूत पूर्वाधार विशाल, ऊर्जा-भोकी र पानीमा गहिरो निर्भर छ — एउटा तथ्य जसले डेटा केन्द्रहरू होस्ट गर्ने समुदायहरूबाट महत्त्वपूर्ण विरोध उत्पन्न गर्न थालेको छ।</p>`,
    category: "Technology",
    tags: ["artificial-intelligence", "energy", "climate-change"],
    featured_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
  },
  {
    title_en: "Opinion: We Need to Talk About the Cost of Remote Work",
    title_ne: "विचार: हामीले रिमोट काम गर्नुको लागत बारे कुरा गर्न आवश्यक छ",
    slug: "opinion-cost-of-remote-work",
    excerpt_en: "The productivity gains are real. So are the social costs — and we have been remarkably reluctant to account for them.",
    excerpt_ne: "उत्पादकता लाभ वास्तविक छन्। सामाजिक लागत पनि — र हामी तिनीहरूको हिसाब लगाउन उल्लेखनीय रूपमा हिचकिचाउँदै आएका छौं।",
    content_en: `<p>The argument being advanced here is not new, but its urgency is. We have known for some time that the shift to remote and hybrid work has produced genuine productivity gains for many categories of knowledge worker. What we have been less willing to reckon with is what has been lost.</p>
<p>The data on loneliness is alarming. Rates of social isolation among knowledge workers under 35 have risen significantly since 2020. Mental health indicators that were already trending in the wrong direction have continued their deterioration.</p>
<p>"There is a version of this story in which individuals and institutions rise to the challenge," said Dr. Emma Roberts, a social psychologist at University College London. "What we are finding is that most people are not adapting. They are enduring."</p>
<p>The economic accounting has focused almost entirely on measurable productivity. It has not accounted for the social infrastructure that offices provided — the ambient relationships, the casual mentoring, the collective sense of purpose — and that remote work has largely failed to replace.</p>
<p>What would it look like to take this seriously? Not in words — we are not short of words — but in decisions, in trade-offs, in the reallocation of attention and resources toward the things that actually matter.</p>`,
    content_ne: `<p>यहाँ अग्रसारित तर्क नयाँ छैन, तर यसको जरुरियत छ। रिमोट र हाइब्रिड काममा स्थानान्तरणले ज्ञान कामदारका धेरै वर्गहरूका लागि वास्तविक उत्पादकता लाभ उत्पन्न गरेको छ भनेर हामी केही समयदेखि जान्दछौं।</p>`,
    category: "Opinion",
    tags: ["economy"],
    featured_image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop",
  },
  {
    title_en: "Inside Nepal's Education Reform: Classrooms, Code, and Controversy",
    title_ne: "नेपालको शिक्षा सुधारको भित्री कथा: कक्षाकोठाहरू, कोड र विवाद",
    slug: "nepal-education-reform-classrooms-code-controversy",
    excerpt_en: "A sweeping overhaul of Nepal's school curriculum is pitting traditionalists against reformers over what the country's children should learn.",
    excerpt_ne: "नेपालको विद्यालय पाठ्यक्रमको व्यापक सुधारले देशका बालबालिकाहरूले के सिक्नुपर्छ भन्ने विषयमा परम्परावादीहरू र सुधारकहरूलाई आमने-सामने बनाउँदैछ।",
    content_en: `<p>A sweeping overhaul of Nepal's school curriculum is pitting traditionalists against reformers in a debate that goes to the heart of what kind of society Nepal wants to become. At stake is the content and approach of education for 7.6 million school-age children.</p>
<p>The reform, backed by the Ministry of Education and a coalition of technology companies and international development organisations, would replace a substantial portion of rote memorisation-based instruction with project-based learning, critical thinking skills, and — most controversially — a compulsory coding curriculum from grade four onwards.</p>
<p>"Education is how we build the human capital that the economy needs," said Education Minister Dipendra Shahi. "The jobs of 2040 do not look like the jobs of 2000. Our curriculum cannot look like the curriculum of 2000 either."</p>
<p>Opponents argue that the reform risks undermining cultural transmission, devaluing traditional knowledge, and creating a generation of children who are skilled at writing code but lack the literacy, numeracy, and cultural grounding that education has historically provided.</p>`,
    content_ne: `<p>नेपालको विद्यालय पाठ्यक्रमको व्यापक सुधारले परम्परावादीहरू र सुधारकहरूलाई यस बहसमा आमने-सामने बनाउँदैछ जुन नेपाल कस्तो समाज बन्न चाहन्छ भन्ने मूलतत्त्वसम्म पुग्छ।</p>`,
    category: "World",
    tags: ["nepal", "education"],
    featured_image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Women Rebuilding Nepal's Mountain Communities After the Quake",
    title_ne: "भूकम्पपछि नेपालका पहाडी समुदायहरू पुनर्निर्माण गर्ने महिलाहरू",
    slug: "women-rebuilding-nepal-mountain-communities",
    excerpt_en: "In the remote villages of Sindhupalchok, women who survived the 2015 earthquake have become architects of community reconstruction.",
    excerpt_ne: "सिन्धुपाल्चोकका दुर्गम गाउँहरूमा, २०१५ को भूकम्पबाट बाँचेका महिलाहरू सामुदायिक पुनर्निर्माणका वास्तुकार बनेका छन्।",
    content_en: `<p>Across the globe, questions about resilience, community, and the role of women in reconstruction are forcing development organisations to rethink longstanding assumptions. Nowhere is this story more visible than in the remote mountain villages of Sindhupalchok, Nepal.</p>
<p>A decade after the 2015 Gorkha earthquake killed more than 9,000 people and destroyed hundreds of thousands of homes, the work of reconstruction continues — but it looks very different from what international development organisations initially envisioned.</p>
<p>What has emerged, against the odds, is a network of women-led cooperatives that are building earthquake-resistant homes, managing village water systems, and running community forests with a sophistication that has drawn attention from planners and researchers around the world.</p>
<p>Local officials describe scrambling to allocate resources, navigate competing demands, and maintain public trust in institutions under strain. The gap between stated policy and lived experience remains a persistent fault line.</p>`,
    content_ne: `<p>सिन्धुपाल्चोकका दुर्गम पहाडी गाउँहरूमा, २०१५ को गोर्खा भूकम्पले ९,०००भन्दा बढी मानिसहरू मारेको र लाखौं घरहरू ध्वस्त भएको एक दशकपछि पुनर्निर्माणको काम जारी छ।</p>`,
    category: "World",
    tags: ["nepal"],
    featured_image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop",
  },
  {
    title_en: "The Nepalese Climbing Industry Is Changing — Its Guides Are Leading the Way",
    title_ne: "नेपाली आरोहण उद्योग परिवर्तन भइरहेको छ — यसका गाइडहरूले नेतृत्व गर्दैछन्",
    slug: "nepal-climbing-industry-guides-leading-change",
    excerpt_en: "As Everest crowds and commercialisation debates intensify, a new generation of Sherpa entrepreneurs is reshaping what Himalayan expedition tourism can be.",
    excerpt_ne: "एभरेस्टको भीड र व्यावसायीकरण बहसहरू तीव्र हुँदा, शेर्पा उद्यमीहरूको नयाँ पुस्ताले हिमालयी अभियान पर्यटन के हुन सक्छ भन्ने पुनः आकार दिइरहेको छ।",
    content_en: `<p>The performance confirmed what those close to the preparation had long suspected. As Everest welcomes its five-hundredth climber of the spring season this week, the mountain that has come to symbolise both human ambition and tourist excess is in the midst of a structural transformation.</p>
<p>At the centre of this transformation are the Sherpa men and women who have guided, carried, and supported Himalayan expeditions for more than a century. A growing number are no longer content to serve as the backbone of an industry that others own and profit from.</p>
<p>"My father was a porter. My uncle was a guide. I own a company," said Dorje Sherpa, 34, the CEO of Summit Bridge Expeditions, one of several Sherpa-owned guiding companies that have emerged in the past decade. "That is the shift."</p>
<p>Questions about the future are inevitable. Sustaining this transformation at this level requires constant renewal — of leadership, of ideas, of commitment to fair labour practices.</p>`,
    content_ne: `<p>एभरेस्टले यो वसन्त सिजनमा आफ्नो पाँचौं सय आरोहीलाई स्वागत गर्दा, यो पहाड संरचनात्मक रूपान्तरणको बीचमा छ।</p>`,
    category: "Sports",
    tags: ["nepal"],
    featured_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
  },
  {
    title_en: "How Biotech Is Turning Agricultural Waste Into Green Fuel",
    title_ne: "बायोटेकले कसरी कृषि फोहोरलाई हरित इन्धनमा परिवर्तन गर्दैछ",
    slug: "biotech-agricultural-waste-green-fuel",
    excerpt_en: "Third-generation biofuels made from rice straw, corn husks, and sugarcane bagasse are edging towards commercial viability.",
    excerpt_ne: "धानको पराल, मकैको खोस्टा र उखुको बगासीबाट बनेको तेस्रो पुस्ताको जैविक ईन्धनहरू व्यावसायिक व्यवहार्यताको दिशामा अघि बढिरहेका छन्।",
    content_en: `<p>The findings represent years of painstaking research. Scientists at a consortium of European and Asian universities have developed enzymatic processes that can convert agricultural waste into high-energy biofuels at costs that are, for the first time, competitive with conventional fossil fuels in certain markets.</p>
<p>The process, known as consolidated bioprocessing, uses engineered microorganisms to simultaneously break down cellulose and ferment the resulting sugars into ethanol or butanol. Previous attempts at this approach were hindered by the sensitivity of the microorganisms to the harsh chemical environment of the fermentation process.</p>
<p>"The breakthrough was in engineering the tolerance of the organism," said Dr. Sachiko Yamamoto, the lead researcher on the project. "Once we solved that, the economics changed fundamentally."</p>
<p>Funding constraints remain a persistent challenge for basic research. While governments and private philanthropists have increased their contributions in recent years, the gap between scientific ambition and available resources remains wide.</p>`,
    content_ne: `<p>यूरोपेली र एसियाली विश्वविद्यालयहरूको एक समूहका वैज्ञानिकहरूले एन्जाइमेटिक प्रक्रियाहरू विकास गरेका छन् जसले कृषि फोहोरलाई उच्च-ऊर्जा जैविक ईन्धनमा रूपान्तरण गर्न सक्छ।</p>`,
    category: "Science",
    tags: ["energy", "innovation", "climate-change"],
    featured_image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop",
  },
  {
    title_en: "Global Debt Crisis: Which Countries Are Most at Risk in 2026",
    title_ne: "वैश्विक ऋण संकट: २०२६ मा कुन देशहरू सबैभन्दा बढी जोखिममा छन्",
    slug: "global-debt-crisis-countries-most-at-risk-2026",
    excerpt_en: "As interest rates remain elevated, a new IMF analysis identifies eighteen countries facing a dangerous combination of high debt, slow growth, and currency exposure.",
    excerpt_ne: "ब्याजदर उच्च रहँदा, एउटा नयाँ IMF विश्लेषणले उच्च ऋण, सुस्त वृद्धि र मुद्रा जोखिमको खतरनाक संयोजनको सामना गरिरहेका अठार देशहरू पहिचान गर्छ।",
    content_en: `<p>The economic forces at play here reflect a longer restructuring that has been reshaping global capital flows for more than a decade. Total global debt — public and private — now exceeds $310 trillion, equivalent to more than three times global GDP. For most of the period since the 2008 financial crisis, that debt was serviceable because interest rates were near zero. They no longer are.</p>
<p>The IMF's Global Debt Monitor, released this week, identifies eighteen countries in what it characterises as a "high-risk debt zone": countries where the combination of debt levels, interest costs, growth prospects, and currency exposure creates a significant probability of debt distress within the next three years.</p>
<p>The list includes familiar candidates — Sri Lanka, which already defaulted in 2022; Pakistan, which narrowly avoided default with a bailout; and several Sub-Saharan African nations. But it also includes two larger economies that have not previously figured prominently in debt sustainability discussions.</p>
<p>Regulators and policymakers are navigating their own uncertainty. The tools available to them were calibrated for a different economic environment, and the lessons of the 2008 crisis may not translate to the current one.</p>`,
    content_ne: `<p>IMF को वैश्विक ऋण मनिटरले यस हप्ता जारी गरिएको, अठार देशहरूलाई पहिचान गर्छ जसलाई यसले "उच्च-जोखिम ऋण क्षेत्र" मा वर्गीकृत गर्छ।</p>`,
    category: "Business",
    tags: ["economy", "geopolitics"],
    featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
  },
  {
    title_en: "Bollywood in the Age of Streaming: How OTT Is Changing Indian Cinema",
    title_ne: "स्ट्रिमिङको युगमा बलिउड: OTT ले भारतीय सिनेमालाई कसरी परिवर्तन गर्दैछ",
    slug: "bollywood-streaming-age-ott-changing-cinema",
    excerpt_en: "The golden age of the Indian multiplex is giving way to a new era in which streaming platforms are dictating content, budgets, and star power.",
    excerpt_ne: "भारतीय मल्टिप्लेक्सको स्वर्ण युग एक नयाँ युगलाई मार्ग दिइरहेको छ जसमा स्ट्रिमिङ प्लेटफर्महरूले सामग्री, बजेट र स्टार पावर निर्देशित गर्दैछन्।",
    content_en: `<p>The work arrives at a moment when questions of cultural identity, authenticity, and the relationship between art and commerce feel particularly urgent in the world's largest film industry. The data tells the story starkly: theatrical box office revenues in India fell 18 percent in 2025, the second consecutive year of significant decline. At the same time, streaming subscriptions to Indian content grew 34 percent.</p>
<p>The shift is forcing a fundamental restructuring of how films are financed, made, and distributed. Studios that once built their business models around blockbuster theatrical releases are increasingly pivoting to OTT-first strategies. Stars who once commanded fees of $10 million for a single film are negotiating streaming deals that pay a fraction of that but offer guaranteed reach.</p>
<p>The cultural conversation around the work has itself become part of the work's meaning. Critics and audiences are engaging with Indian content on streaming platforms in ways that would have been impossible in the theatrical distribution model.</p>`,
    content_ne: `<p>डेटाले कथा स्पष्ट रूपमा बताउँछ: भारतमा नाटकीय बक्स अफिस राजस्व २०२५ मा १८ प्रतिशत घट्यो, महत्त्वपूर्ण गिरावटको दोस्रो लगातार वर्ष।</p>`,
    category: "Entertainment",
    tags: [],
    featured_image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
  },
  {
    title_en: "Nepal Cricket: The Extraordinary Rise of a Himalayan Cricketing Nation",
    title_ne: "नेपाल क्रिकेट: हिमालयी क्रिकेट राष्ट्रको असाधारण उदय",
    slug: "nepal-cricket-extraordinary-rise-himalayan-nation",
    excerpt_en: "From a country with no cricket infrastructure twenty years ago, Nepal has become a genuine contender for full ICC membership.",
    excerpt_ne: "बीस वर्ष पहिले कुनै क्रिकेट पूर्वाधार नभएको देशबाट, नेपाल ICC को पूर्ण सदस्यतासम्मको वास्तविक दावेदार बनेको छ।",
    content_en: `<p>The performance confirmed what those close to the preparation had long suspected. In December, Nepal defeated the West Indies in a T20 series for the first time in the team's history. Three months later, they came within seven runs of defeating Australia at the T20 World Cup.</p>
<p>The story of Nepal cricket is, in many ways, a story about what is possible when institutional investment, coaching quality, and individual talent align. A generation ago, cricket was played in Nepal on pitches that would not have met the minimum standards for a district league in England or Australia.</p>
<p>"I grew up playing on concrete with a tennis ball," said Sandeep Lamichhane, Nepal's most celebrated cricketer and one of the most sought-after spinners in franchise cricket globally. "I learned to spin the ball because the surface was so unpredictable. It turned out that was the best training ground in the world."</p>
<p>Years of infrastructure development, talent identification, and coaching education preceded this moment. Whatever comes next, this chapter will be worth remembering.</p>`,
    content_ne: `<p>डिसेम्बरमा, नेपालले पहिलो पटक टोलीको इतिहासमा T20 श्रृंखलामा वेस्ट इन्डिजलाई पराजित ग¥यो। तीन महिनापछि, तिनीहरू T20 विश्व कपमा अस्ट्रेलियालाई पराजित गर्नबाट सात रनले चुके।</p>`,
    category: "Sports",
    tags: ["nepal"],
    featured_image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
  },
];

type VideoSeed = {
  title_en: string;
  title_ne: string;
  youtube_url: string;
  description_en: string;
  description_ne: string;
  thumbnail: string;
  category: string;
  duration: string;
};

const VIDEOS: VideoSeed[] = [
  {
    title_en: "Inside the World's Largest Vertical Farm",
    title_ne: "विश्वको सबैभन्दा ठूलो ठाडो खेतको भित्री कथा",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "A rare look inside the Dubai facility growing 12,000 tonnes of food per year without soil or sunlight.",
    description_ne: "माटो वा सूर्यको प्रकाश बिना वार्षिक १२,००० टन खाना उमार्ने दुबई सुविधाको भित्री दुर्लभ दृश्य।",
    thumbnail: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=450&fit=crop",
    category: "Science",
    duration: "14:22",
  },
  {
    title_en: "The Ocean Cleanup: Two Years Later",
    title_ne: "समुद्र सफाई: दुई वर्षपछि",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "We revisit the ambitious project and ask whether it has lived up to its promises.",
    description_ne: "हामी महत्त्वाकांक्षी परियोजना पुनः हेर्छौं र यसले आफ्ना वाचाहरू पूरा गरेको छ कि छैन भनी सोध्छौं।",
    thumbnail: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800&h=450&fit=crop",
    category: "World",
    duration: "08:47",
  },
  {
    title_en: "How AI Is Writing Tomorrow's Music",
    title_ne: "एआईले भोलिको संगीत कसरी लेख्दैछ",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "Composers, musicians and producers debate the rise of machine-generated sound.",
    description_ne: "संगीतकारहरू, संगीतज्ञहरू र निर्माताहरूले मेशिन-उत्पन्न ध्वनिको उदयबारे बहस गर्छन्।",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
    category: "Culture",
    duration: "11:05",
  },
  {
    title_en: "One Year Inside a Mars Simulation",
    title_ne: "मंगल ग्रह सिमुलेसनभित्र एक वर्ष",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "Four volunteers emerged last week from a yearlong Mars analogue habitat in the Utah desert.",
    description_ne: "चार स्वयंसेवकहरू उटाह मरुभूमिमा एक वर्षको मंगल ग्रह अनुरूप आवासबाट पछिल्लो हप्ता निस्किए।",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    category: "Science",
    duration: "19:38",
  },
  {
    title_en: "The Last Glaciers: A Climate Emergency",
    title_ne: "अन्तिम हिमनदहरू: जलवायु आपतकाल",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "Glaciologists warn the world's remaining mountain glaciers could vanish within a generation.",
    description_ne: "ग्लेसियोलजिस्टहरूले चेतावनी दिन्छन् कि विश्वका बाँकी पहाडी हिमनदहरू एक पुस्तामा नै अदृश्य हुन सक्छन्।",
    thumbnail: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=450&fit=crop",
    category: "World",
    duration: "22:14",
  },
  {
    title_en: "Inside Kathmandu's Tech Revolution",
    title_ne: "काठमाडौंको प्रविधि क्रान्तिको भित्री कथा",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "Young entrepreneurs are turning Nepal's capital into a South Asian startup hub.",
    description_ne: "युवा उद्यमीहरूले नेपालको राजधानीलाई दक्षिण एसियाली स्टार्टअप हबमा परिवर्तन गर्दैछन्।",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
    category: "Technology",
    duration: "16:53",
  },
  {
    title_en: "Who Really Owns the Internet?",
    title_ne: "इन्टरनेटको वास्तविक मालिक को हो?",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "A deep dive into the undersea cables, data centres and corporations that hold the web together.",
    description_ne: "वेबलाई एकसाथ राख्ने पानीमुनिका केबलहरू, डेटा केन्द्रहरू र निगमहरूमा गहिरो छलफल।",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
    category: "Technology",
    duration: "28:01",
  },
  {
    title_en: "The Return of Nuclear: Saviour or Threat?",
    title_ne: "आणविक शक्तिको फिर्ता: मुक्तिदाता वा खतरा?",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description_en: "As fossil fuels dwindle, governments across Europe and Asia are betting on a nuclear renaissance.",
    description_ne: "जीवाश्म इन्धन घट्दै जाँदा, यूरोप र एसियाभर सरकारहरूले आणविक पुनर्जागरणमा दाँव लगाउँदैछन्।",
    thumbnail: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=450&fit=crop",
    category: "Politics",
    duration: "31:07",
  },
];

const SETTINGS_DEFAULTS = [
  { key: "site_title_en", value: "KumariHub" },
  { key: "site_title_ne", value: "कुमारीहब" },
  { key: "site_description_en", value: "Nepal's leading multilingual news portal — in-depth journalism for a connected world." },
  { key: "site_description_ne", value: "नेपालको अग्रणी बहुभाषी समाचार पोर्टल — जोडिएको विश्वका लागि गहन पत्रकारिता।" },
  { key: "breaking_news_enabled", value: "true" },
  { key: "breaking_news_text_en", value: "Nepal Clean Energy Act passes unanimously — 15 GW hydropower target by 2035" },
  { key: "breaking_news_text_ne", value: "नेपाल स्वच्छ ऊर्जा ऐन सर्वसम्मतिले पारित — २०३५ सम्म १५ GW जलविद्युत् लक्ष्य" },
  { key: "contact_email", value: "contact@kumarihub.com" },
  { key: "logo_url", value: "" },
  { key: "social_twitter", value: "@kumarihub" },
  { key: "social_facebook", value: "kumarihub" },
  { key: "social_instagram", value: "kumarihub" },
];

async function main() {
  console.log("🌱 Starting KumariHub database seed...\n");

  // 1. Add category/duration columns to videos table if missing
  console.log("📋 Ensuring videos table has category/duration columns...");
  await pool.query(`
    ALTER TABLE videos ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Video';
    ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration VARCHAR(20) DEFAULT '';
  `);
  console.log("   ✓ Videos table updated\n");

  // 2. Find or create admin user
  console.log("👤 Setting up admin user...");
  let adminId: string;

  const existingAdmin = await pool.query(
    `SELECT id FROM "user" WHERE role = 'admin' OR email = $1 LIMIT 1`,
    [ADMIN_EMAIL]
  );

  if (existingAdmin.rows[0]) {
    adminId = existingAdmin.rows[0].id;
    console.log(`   ✓ Using existing admin user (id: ${adminId})\n`);
  } else {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'admin', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET role = 'admin' RETURNING id`,
      [id, ADMIN_NAME, ADMIN_EMAIL]
    );
    const res2 = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [ADMIN_EMAIL]);
    adminId = res2.rows[0].id;
    console.log(`   ✓ Created admin user (id: ${adminId})\n`);
  }

  // 3. Seed categories
  console.log("📁 Seeding categories...");
  let catCount = 0;
  for (const cat of CATEGORIES) {
    const { rowCount } = await pool.query(
      `INSERT INTO categories (name_en, name_ne, slug)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING`,
      [cat.name_en, cat.name_ne, cat.slug]
    );
    if (rowCount && rowCount > 0) catCount++;
  }
  console.log(`   ✓ ${catCount} new categories inserted (${CATEGORIES.length - catCount} already existed)\n`);

  // 4. Seed tags
  console.log("🏷️  Seeding tags...");
  let tagCount = 0;
  for (const tag of TAGS) {
    const { rowCount } = await pool.query(
      `INSERT INTO tags (name_en, name_ne, slug)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING`,
      [tag.name_en, tag.name_ne, tag.slug]
    );
    if (rowCount && rowCount > 0) tagCount++;
  }
  console.log(`   ✓ ${tagCount} new tags inserted (${TAGS.length - tagCount} already existed)\n`);

  // 5. Seed articles
  console.log("📰 Seeding articles...");
  let articleCount = 0;
  const now = new Date();
  for (let i = 0; i < ARTICLES.length; i++) {
    const art = ARTICLES[i];
    // Stagger publication times (oldest first, 6-hour intervals)
    const publishedAt = new Date(now.getTime() - (ARTICLES.length - i) * 6 * 60 * 60 * 1000);

    const { rowCount } = await pool.query(
      `INSERT INTO article
         (title_en, title_ne, slug, excerpt_en, excerpt_ne,
          content_en, content_ne, category, tags, status,
          featured_image, author_id, published_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,$11,$12,$12,$12)
       ON CONFLICT (slug) DO NOTHING`,
      [
        art.title_en, art.title_ne, art.slug,
        art.excerpt_en, art.excerpt_ne,
        art.content_en, art.content_ne,
        art.category, art.tags,
        art.featured_image, adminId, publishedAt,
      ]
    );
    if (rowCount && rowCount > 0) articleCount++;
  }
  console.log(`   ✓ ${articleCount} new articles inserted (${ARTICLES.length - articleCount} already existed)\n`);

  // 6. Seed videos
  console.log("🎬 Seeding videos...");
  const { rows: existingVideos } = await pool.query(
    `SELECT COUNT(*) as cnt FROM videos`
  );
  const existingVideoCount = parseInt(existingVideos[0].cnt);
  if (existingVideoCount === 0) {
    for (const vid of VIDEOS) {
      await pool.query(
        `INSERT INTO videos
           (title_en, title_ne, youtube_url, description_en, description_ne,
            thumbnail, category, duration, status, author_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'published',$9)`,
        [
          vid.title_en, vid.title_ne, vid.youtube_url,
          vid.description_en, vid.description_ne,
          vid.thumbnail, vid.category, vid.duration, adminId,
        ]
      );
    }
    console.log(`   ✓ ${VIDEOS.length} new videos inserted\n`);
  } else {
    console.log(`   ✓ Videos already exist (${existingVideoCount} found), skipping\n`);
  }

  // 7. Seed settings
  console.log("⚙️  Seeding settings...");
  let settingCount = 0;
  for (const s of SETTINGS_DEFAULTS) {
    const { rowCount } = await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [s.key, s.value]
    );
    if (rowCount && rowCount > 0) settingCount++;
  }
  console.log(`   ✓ ${settingCount} new settings inserted (${SETTINGS_DEFAULTS.length - settingCount} already existed)\n`);

  // 8. Seed nav menu items
  console.log("🗺️  Seeding menu items...");
  const { rows: existingNav } = await pool.query(
    `SELECT COUNT(*) as cnt FROM menu_items WHERE menu_type = 'navbar'`
  );
  if (parseInt(existingNav[0].cnt) === 0) {
    const navItems = [
      { label_en: "World", label_ne: "विश्व", url: "/world", menu_type: "navbar", link_type: "category", sort_order: 1 },
      { label_en: "Politics", label_ne: "राजनीति", url: "/politics", menu_type: "navbar", link_type: "category", sort_order: 2 },
      { label_en: "Business", label_ne: "व्यापार", url: "/business", menu_type: "navbar", link_type: "category", sort_order: 3 },
      { label_en: "Technology", label_ne: "प्रविधि", url: "/technology", menu_type: "navbar", link_type: "category", sort_order: 4 },
      { label_en: "Science", label_ne: "विज्ञान", url: "/science", menu_type: "navbar", link_type: "category", sort_order: 5 },
      { label_en: "Culture", label_ne: "संस्कृति", url: "/culture", menu_type: "navbar", link_type: "category", sort_order: 6 },
      { label_en: "Sports", label_ne: "खेलकुद", url: "/sports", menu_type: "navbar", link_type: "category", sort_order: 7 },
      { label_en: "Videos", label_ne: "भिडियो", url: "/videos", menu_type: "navbar", link_type: "page", sort_order: 8 },
    ];
    for (const item of navItems) {
      await pool.query(
        `INSERT INTO menu_items (label_en, label_ne, url, menu_type, link_type, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.label_en, item.label_ne, item.url, item.menu_type, item.link_type, item.sort_order]
      );
    }
    console.log(`   ✓ ${navItems.length} navbar items inserted`);
  } else {
    console.log("   ✓ Navbar items already exist");
  }

  const { rows: existingFooter } = await pool.query(
    `SELECT COUNT(*) as cnt FROM menu_items WHERE menu_type = 'footer'`
  );
  if (parseInt(existingFooter[0].cnt) === 0) {
    const footerItems = [
      { label_en: "About Us", label_ne: "हाम्रो बारे", url: "/about", section_label_en: "Company", section_label_ne: "कम्पनी", sort_order: 1 },
      { label_en: "Contact", label_ne: "सम्पर्क", url: "/contact", section_label_en: "Company", section_label_ne: "कम्पनी", sort_order: 2 },
      { label_en: "Privacy Policy", label_ne: "गोपनीयता नीति", url: "/privacy", section_label_en: "Legal", section_label_ne: "कानूनी", sort_order: 3 },
      { label_en: "Terms of Use", label_ne: "प्रयोगका सर्तहरू", url: "/terms", section_label_en: "Legal", section_label_ne: "कानूनी", sort_order: 4 },
      { label_en: "World", label_ne: "विश्व", url: "/world", section_label_en: "Coverage", section_label_ne: "कवरेज", sort_order: 5 },
      { label_en: "Politics", label_ne: "राजनीति", url: "/politics", section_label_en: "Coverage", section_label_ne: "कवरेज", sort_order: 6 },
      { label_en: "Business", label_ne: "व्यापार", url: "/business", section_label_en: "Coverage", section_label_ne: "कवरेज", sort_order: 7 },
      { label_en: "Technology", label_ne: "प्रविधि", url: "/technology", section_label_en: "Coverage", section_label_ne: "कवरेज", sort_order: 8 },
    ];
    for (const item of footerItems) {
      await pool.query(
        `INSERT INTO menu_items (label_en, label_ne, url, menu_type, link_type, section_label_en, section_label_ne, sort_order)
         VALUES ($1, $2, $3, 'footer', 'page', $4, $5, $6)`,
        [item.label_en, item.label_ne, item.url, item.section_label_en, item.section_label_ne, item.sort_order]
      );
    }
    console.log(`   ✓ ${footerItems.length} footer items inserted`);
  } else {
    console.log("   ✓ Footer items already exist");
  }

  console.log("\n✅ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin user:");
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log("  (Set password via /signup or /dashboard/profile)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
