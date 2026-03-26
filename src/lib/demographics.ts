// This encapsulates demographic data for Ottawa neighborhoods.
// In the future, this will be dynamically synchronized with the res_ddf.neighborhoods Supabase table.

export interface DemographicProfile {
  name: string;
  population: string;
  medianIncome: string;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  schoolScore: number;
  quietScore: number;
  greenScore: number;
  familyScore: number;
  topSchools: string[];
  vibe: string;
}

const ottawaDemographics: Record<string, DemographicProfile> = {
  nepean: {
    name: 'Nepean',
    population: '170,000+',
    medianIncome: '$105,000',
    walkScore: 45, transitScore: 68, bikeScore: 55,
    schoolScore: 82, quietScore: 78, greenScore: 76, familyScore: 90,
    topSchools: ['Sir Robert Borden High School (Fraser: 8.2/10)', 'Merivale High School (IB)', 'St. Paul High School'],
    vibe: 'A massive, highly sought-after suburban stretch featuring expansive lots, sprawling parks, and strong school districts. Features condo hubs near Algonquin College and ultra-luxury detached homes in Craig Henry and Centrepointe.'
  },
  kanata: {
    name: 'Kanata',
    population: '120,000+',
    medianIncome: '$125,000',
    walkScore: 35, transitScore: 60, bikeScore: 50,
    schoolScore: 89, quietScore: 88, greenScore: 82, familyScore: 92,
    topSchools: ['Earl of March Secondary (Fraser: 8.9/10)', 'All Saints High School', 'Kanata Highlands Public School'],
    vibe: 'Canada\'s largest tech park. High household incomes, master-planned communities like Kanata Lakes, pristine golf courses. Premier destination for engineering and tech executives.'
  },
  westboro: {
    name: 'Westboro',
    population: '23,000+',
    medianIncome: '$118,000',
    walkScore: 94, transitScore: 85, bikeScore: 90,
    schoolScore: 85, quietScore: 55, greenScore: 80, familyScore: 72,
    topSchools: ['Nepean High School (Fraser: 8.5/10)', 'Broadview Public School', 'Notre Dame High School'],
    vibe: 'Ottawa\'s trendiest, most expensive urban village. 94+ Walkscore, direct beach access, premium independent cafés, MEC, Lululemon. Heavily gentrified and exceptionally modern.'
  },
  glebe: {
    name: 'The Glebe',
    population: '13,000+',
    medianIncome: '$135,000',
    walkScore: 92, transitScore: 88, bikeScore: 88,
    schoolScore: 81, quietScore: 60, greenScore: 85, familyScore: 74,
    topSchools: ['Glebe Collegiate Institute (Fraser: 8.1/10)', 'Corpus Christi School', 'Mutchmor Public School'],
    vibe: 'Prestigious, historic neighborhood bordering the Rideau Canal. Million-dollar century homes, enormous tree canopies, and the thriving Bank Street artery. Extremely safe and highly desirable.'
  },
  orleans: {
    name: 'Orléans',
    population: '125,000+',
    medianIncome: '$108,000',
    walkScore: 40, transitScore: 72, bikeScore: 52,
    schoolScore: 80, quietScore: 82, greenScore: 74, familyScore: 94,
    topSchools: ['St. Peter Catholic High School', 'Cairine Wilson Secondary', 'École secondaire catholique Garneau'],
    vibe: 'Rapidly expanding eastern suburb with a strong Francophone heritage. Massive new-build developments, easy beach access at Petrie Island, and the incoming LRT eastern extension.'
  },
  barrhaven: {
    name: 'Barrhaven',
    population: '95,000+',
    medianIncome: '$115,000',
    walkScore: 38, transitScore: 55, bikeScore: 44,
    schoolScore: 85, quietScore: 90, greenScore: 78, familyScore: 96,
    topSchools: ['Longfields-Davidson Heights Secondary', 'St. Joseph High School', 'Walter Baker Public School'],
    vibe: 'Ottawa\'s fastest-growing family suburb. Sprawling new-build communities with large lots, excellent schools, and a tight-knit community feel. Very low crime and outstanding family amenities.'
  },
  stittsville: {
    name: 'Stittsville',
    population: '30,000+',
    medianIncome: '$122,000',
    walkScore: 42, transitScore: 45, bikeScore: 58,
    schoolScore: 83, quietScore: 92, greenScore: 80, familyScore: 95,
    topSchools: ['Blessed Kateri Catholic Elementary', 'Stittsville Public School', 'A.Y. Jackson Secondary'],
    vibe: 'A charming, rapidly growing village community at Ottawa\'s western edge. Known for its heritage Main Street, strong arts community, and premium new-build family homes with easy Greenbelt access.'
  },
  centretown: {
    name: 'Centretown',
    population: '28,000+',
    medianIncome: '$92,000',
    walkScore: 97, transitScore: 92, bikeScore: 95,
    schoolScore: 72, quietScore: 40, greenScore: 65, familyScore: 52,
    topSchools: ['Lisgar Collegiate Institute (Fraser: 9.1/10)', 'Albert Street Education Centre', 'Cambridge St Community PS'],
    vibe: 'Ottawa\'s highest-density urban core. Unmatched walkability, steps from Parliament Hill, Elgin Street dining, and Bank Street culture. Ideal for professionals who want to live where the action is.'
  },
  'sandy-hill': {
    name: 'Sandy Hill',
    population: '21,000+',
    medianIncome: '$78,000',
    walkScore: 90, transitScore: 88, bikeScore: 85,
    schoolScore: 75, quietScore: 45, greenScore: 70, familyScore: 55,
    topSchools: ['University of Ottawa (nearby)', 'Garneau Elementary', 'École élémentaire catholique Sacré-Cœur'],
    vibe: 'A vibrant, multicultural neighborhood adjacent to uOttawa. Historic row houses, Strathcona Park on the Rideau River, and a diverse restaurant scene. Popular with young professionals and graduate students.'
  },
  'old-ottawa-south': {
    name: 'Old Ottawa South',
    population: '12,000+',
    medianIncome: '$128,000',
    walkScore: 85, transitScore: 78, bikeScore: 88,
    schoolScore: 86, quietScore: 72, greenScore: 88, familyScore: 82,
    topSchools: ['Hopewell Avenue Public School', 'Elmwood School for Girls (IB)', 'St. Margaret Catholic School'],
    vibe: 'One of Ottawa\'s most beloved mature neighborhoods. Canopy-lined streets, Brewer Park, the Rideau River pathway, and the eclectic Glebe Annex shops make this a perennial favourite for affluent families.'
  },
  'riverside-south': {
    name: 'Riverside South',
    population: '22,000+',
    medianIncome: '$118,000',
    walkScore: 32, transitScore: 65, bikeScore: 40,
    schoolScore: 81, quietScore: 91, greenScore: 72, familyScore: 95,
    topSchools: ['Adrienne Clarkson Elementary', 'Sacred Heart High School', 'South Carleton High School'],
    vibe: 'A masterplanned community along the Rideau River south of the urban core. Stunning waterfront trail access, premium new-builds, and the incoming LRT Stage 3 extension making this a high-appreciation investment zone.'
  },
  'alta-vista': {
    name: 'Alta Vista',
    population: '18,000+',
    medianIncome: '$105,000',
    walkScore: 58, transitScore: 70, bikeScore: 65,
    schoolScore: 78, quietScore: 80, greenScore: 82, familyScore: 88,
    topSchools: ['Colonel By Secondary School', 'Elmview Public School', 'St. Patrick\'s High School'],
    vibe: 'A mature, established middle-class neighborhood near the General Hospital. Large lots, quiet streets, mature trees, and easy access to both downtown and the east end make it a reliable family favourite.'
  },
  'hunt-club': {
    name: 'Hunt Club',
    population: '35,000+',
    medianIncome: '$98,000',
    walkScore: 40, transitScore: 62, bikeScore: 45,
    schoolScore: 76, quietScore: 82, greenScore: 75, familyScore: 87,
    topSchools: ['Colonel By Secondary School', 'Meadowlands Public School', 'St. Patrick\'s Catholic High School'],
    vibe: 'A diverse, established suburban community bordering the Ottawa International Airport. Excellent access to the 417 and Rideau River pathways, affordable family detached homes, and strong community programs.'
  },
};

export function getDemographics(communitySlug: string): DemographicProfile | null {
  if (!communitySlug) return null;
  // Normalize: lowercase, trim, replace spaces with hyphens for composite names
  const key = communitySlug.toLowerCase().trim().replace(/\s+/g, '-');
  // Also try without hyphens for single-word lookups
  const altKey = key.replace(/-/g, '');
  return ottawaDemographics[key] || ottawaDemographics[altKey] || null;
}
